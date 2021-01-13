---
title: axios源码阅读
date: 2019-11-30 12:10:43
tags:
  - axios
---

> &emsp;没事读读码...

<escape><!-- more --></escape>

&emsp;&emsp;`axios`在业务中请求用得比较多了，这个周末就花点时间阅读下源码，先进`github`开启`sourcegraph`插件，找到核心实现目录：

![](menu.jpg)

&emsp;&emsp;那从哪里开始慢慢看比较好呢？我个人其实比较倾向从工具方法里入手，可以学习其中的编码思路，发现平常自己实现相同功能容易忽略的细节。了解了其中的工具方法作用后，对我们后续盘核心代码的逻辑也会轻松不少。

## helpers

&emsp;&emsp;该文件目录下主要是一些对我们发送请求时，拼接URL、处理参数的工具方法。

### bind.js

```javascript
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
```

&emsp;&emsp;其实就是在ES5下，实现了一个`bind`，返回一个闭包，最后返回绑定`this`的调用返回结果。

## adapters

&emsp;&emsp;根据文件目录，及README.md，该模块主要进行浏览器端及Node端的网络请求兼容，它会处理成一个request请求进行dispatch，并且当response返回后，处理返回一个Promise。

## cancel

&emsp;&emsp;这个模块进行了基本的Cancel对象封装，主要用于判断请求是否被Cancel以及如何进行请求的Cancel。

### Cancel.js

&emsp;&emsp;构造了一个Cancel函数，初始化`message`信息，原型链上重载了`toString`方法以及添加了`__CANCEL__`标记变量：

```javascript
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;
```

### CancelToken.js

&emsp;&emsp;`CancelToken`是一个用于进行请求取消操作的对象：

```javascript
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;
```

&emsp;&emsp;通过源码阅读我们可以看出，`CancelToken`也是一个构造函数，它接受一个执行函数`executor`，内部通过一个Promise实例控制，比较有趣的是它将Promise状态改变的回调函数执行句柄提出，并在`executor`中执行后再触发。并在执行函数触发时，首次执行会调用之前`Cancel`的构造函数，并将生成的实例赋值给当前上下文的`reason`属性。在下一次再触发时，若已有`reason`内容，则不再执行该函数。

&emsp;&emsp;除此之外，在axios中真正使用`CancelToken`往往不是直接通过`new`构造，而是使用函数的静态方法`source`，它通过注入一个函数的形式，从`CancelToken`内部拿到了真正进行取消动作的`cancel`函数，并将其赋值给了外层`source`函数内部的`cancel`变量，最终返回了这个`CancelToken`实例以及与其匹配的取消方法，形成一个闭包。

### isCancel.js

&emsp;&emsp;判断任务是否已被取消，从构造上来说，它的入参是Cancel函数构造的实例，返回值的处理也比较巧妙，运用`!!`真值处理，因为如果`value`为`undefined`，返回的就是`undefined`，真值处理会进行布尔值转换。

```javascript
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};
```

### axios是怎么做请求取消的？

&emsp;&emsp;了解了以上构造函数实现后，我们知道了核心是`CancelToken.source`方法以及`CancelToken`实例原型链上对应的`__CANCEL__`属性。再看看真实应用的例子from *README.md*：

```javascript
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/user/12345', {
  cancelToken: source.token
}).catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // handle error
  }
});

axios.post('/user/12345', {
  name: 'new name'
}, {
  cancelToken: source.token
})

// cancel the request (the message parameter is optional)
source.cancel('Operation canceled by the user.');
```

&emsp;&emsp;从使用demo上，我们知道在axios进行请求时，我们的`CancelToken`实例作为参数传入，而取消句柄则在外部被我们开发者在对应业务场景消费，简单来说就是我们可以决定何时取消。

&emsp;&emsp;那么实际我们的axios实例是如何运用以上的token和对应的cancel呢？

&emsp;&emsp;1. Axios构造函数实现核心请求方法`request`，本质上不同的请求方法（`get`、`put`、`post`等）最终都会调用这个`request`。

```javascript
// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

&emsp;&emsp;2. `request`中间的请求体会通过`interceptors`形成一个中间件进行处理，这里我们先不看具体中间件做了什么动作，聚焦到里面实际发起请求的函数`dispatchRequest`，代码中的`adapter`其实就是浏览器和Node端对应真实发起请求的方法封装，它们最终会返回一个Promise。

```javascript
  // 省略部分 ...
  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
```

&emsp;&emsp;在这个Promise的回调中，我们会判断`config`配置是否有`cancelToken`属性，即是否配置了取消请求的方法，如果有，则检查其中是否已经存在了取消的`reason`属性，这个`reason`属性根据前文，它是一个`Cancel`对象，内部是我们外部调用取消方法传入的`msg`。即如果这个`cancelToken`实例此时存在`reason`了，它就会抛出这个内部的`reason`即Cancel对象。

```javascript
/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}
```

&emsp;&emsp;3. `adapter`我们就以浏览器端的实现`xhr.js`文件来看，可以看出浏览器端就是去构造一个`XMLHttpRequest`，在真实发送`send`前，判断`config`中是否有`cancelToken`，有则以`cancelToken`内部的`promise`来进行异步控制。通过前文的了解我们知道，在具体业务场景我们调用`cancelToken`匹配的`cancel`方法进行请求终止，其实就是将`CancelToken`内部的`promise`进行`resolve`并使得在`adapter`中进入异步等待回调的promise立马回调，将`XMLHttpRequest`的请求实例通过`abort`方法终止。然后这个axios请求的Promise将会`reject`，里面的属性就是`cancelToken`的`reason`。同时释放`request`内存。实际上在请求的各个阶段结束后，如错误、终止、完成都会清空`request`指向，这也是`CancelToken`的`promise`回调中发现`request`已经阶段完成就啥都不做的判断逻辑：

```javascript
module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var request = new XMLHttpRequest();
    // 省略...
    request.onreadystatechange = function handleLoad() {
      // ...
      request = null;
    };
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(createError('Request aborted', config, 'ECONNABORTED', request));
      // Clean up request
      request = null;
    };
    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };
    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };
    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    };
    request.send(requestData);
  });
};
```

## utils.js

&emsp;&emsp;该文件下，主要是一些判断类型的工具方法：

![](utils.jpg)

&emsp;&emsp;一个基本的判断类型思路：

```javascript
// 获取toString 方便后续调用 避免每次都用.重新查找获取
var toString = Object.prototype.toString;
// 通过转化字符串的特点进行类型判断
function isXXX(val) {
	return toString.call(val) === '[object XXX]';
}
```

&emsp;&emsp;其中一些我个人觉得可以学习一下的：

### isObject

```javascript
/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}
```

### isFormData

```javascript
/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}
```

### isStandardBrowserEnv

&emsp;&emsp;判断当前运行环境，WEB端依赖`window`及`document`，Native端核心则是在`navigator.product`上。

```javascript
/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
		navigator.product === 'NativeScript' ||
		navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}
```

### forEach

```javascript
/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
		// 由于 in 会根据原型链往上去拿继承的属性，而我们其实只关注当前对象所直接包含的属性，固此处通过该方式过滤
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}
```

### normalizeHeaderName

```javascript
function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
	// 格式化头部，比较headers中的key及入参中的格式化name是否拼写相同（都转大写比较）
	// 若两者内容相同，但大小写不一致，以入参传入的为准(添加新的key)，删除原本headers中的key
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};
```

### extend 

&emsp;&emsp;相当于把第二个参数内的内容继承到第一个参数中。

```javascript
/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}
```

## axios.js

&emsp;&emsp;这个文件可以理解成一个入口，我们的逻辑都通过这个文件引入，再通过模块化导出供我们使用这个请求库。

&emsp;&emsp;先看生成实例的方法：

```javascript
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}
```

&emsp;&emsp;首先通过`Axios`构造方法`new`一个实例，其中传入默认的配置参数`defaults`。该配置参数又通过`defaults.js`导出。

&emsp;&emsp;`defaults.js`比较关键，它对Axios的默认请求配置进行了封装，并且其中做了浏览器端和Node端的兼容：

```javascript
function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}
```

```javascript
var defaults = {
  // 获取默认情况的适配器属性
  adapter: getDefaultAdapter(),

  // 转化请求头配置
  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
	// 根据请求数据格式进行不同的数据处理
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  // 转化返回结果，即我们拿到的请求结果已经是通过JSON.parse处理后的对象了
  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  // 是否请求成功
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};
```

&emsp;&emsp;再看看`Axios`这个“类”做了哪些事情：

```javascript
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
	// 初始化两个拦截器实例
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
```

&emsp;&emsp;先声明一个`Axios`函数，实例上有两个属性，一个是实例的配置信息`this.defaults`，另一个则是发起请求和接收响应的拦截器`this.interceptors`。

### InterceptorManager.js

&emsp;&emsp;`InterceptorManager`这个拦截器又做了什么呢？

```javascript
function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```

&emsp;&emsp;实例中有一个`handlers`初始化空数组进行拦截内容添加，原型链上添加`use`、`eject`、`forEach`方法，分别进行`Promise`处理状态入栈，清除以及迭代函数调用。

&emsp;&emsp;然后在`Axios`的原型链上配置方法`request`、`getUri`：

```javascript
/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // 支持2种 request方式 当第一个参数为字符串时，即将其设置为接口URL，第二个参数为config的配置信息
  // 当传入非字符串时，则将其设置为config
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  // 此处将会拿我们的配置信息 与 前面代码中的defaultConfig合并 相同key的value被覆盖
  config = mergeConfig(this.defaults, config);

  // Set config.method
  // 依次判断 传入config内的请求类型 > 默认的defaultConfig内的请求类型 ， 若都不存在 则初始化为get类型请求
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};
```

&emsp;&emsp;实际上核心还是`request`函数，它在内部通过`chain`数组结构编织了一个请求管道，默认没有配置拦截器`this.interceptors.request`及`this.interceptors.response`时，初始化值为`[dispatchRequest, undefined]`。这等价于请求时，在`promise`的回调中直接触发`resolve`状态的`dispatchRequest`，入参即请求配置`config`。

&emsp;&emsp;那么当我们分别在`request`和`response`中添加拦截，塞入中间件，就是下面这样的编排结构：

![](queue.jpeg)
 
&emsp;&emsp;结合请求前的处理，我们可以知道从队列首部到`dispatchRequest`，是给我们中间处理`config`的，因为`dispatchRequest`最终接收参数就是一个`config`。常见应用场景如获取app token，确认当前token是否有效等。而`undefined`之后到队尾的配置就是处理`dispatchRequest`的`promise`返回的`response`的内容，如果有相关场景依赖，我们便可以在返回的`response`上构造，处理起来也是生成新的Promise返回，数据返回新的`response`。

&emsp;&emsp;**综上，`chain`通过管道的概念，形成了一个`promise`链式调用，队列首到`dispatchRequest`进行`config`中间处理，`undefined`到队列尾部进行请求返回的`response`的中间处理。**