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

&emsp;&emsp;首先通过`Axios`构造方法`new`一个实例，其中传入默认的配置参数`defaults`。下面看看`defaults.js`内是些什么配置参数：

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