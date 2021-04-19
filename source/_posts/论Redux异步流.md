---
title: 论Redux异步流
date: 2019-10-23 11:11:15
tags:
  - React
  - Redux
  - 中间件
---

> &emsp;故事的开始，是有一天一个带哥问了我redux的applyMiddleware做了什么...

<escape><!-- more --></escape>

&emsp;&emsp;这篇文章，会先从`applyMiddleware`的源码开始分析，只讨论核心代码实现。一些琐碎的部分会被略去，最终延伸到`redux`异步流处理方案。

### 准备道具

&emsp;&emsp;本着认真负责的态度，我希望阅读这篇文章的人都能有所收获（带哥可以略过）。因此，会先从一些比较基础的东西开始。

#### 闭包

&emsp;&emsp;啥是闭包，简单点来讲就是你在一个函数里返回了一个函数，在返回的这个函数内，你具有访问包裹它的函数作用域内的变量的能力。

&emsp;&emsp;一般来说在我们声明的函数体内声明变量，只会在函数被调用时在当前函数块的作用域内存在。当函数执行完毕后会垃圾回收。但！如果我们返回的函数中存在对那个变量的引用，那这个变量便不会在函数调用后被销毁。也基于这一特性，延展出很多闭包的应用，如常见的防抖(throttle)、节流(debounce)函数，它们都是不断对内部的一个定时器进行操作；又如一些递归的缓存结果优化，也是设置了一个内部对象去比对结果来跳过一些冗余的递归场景。

```javascript
function throttle(fn, wait) {
	let timeStart = 0;  // 不会被销毁，返回的函数执行时具有访问该变量的能力
	return function (...args) {
		let timeEnd = Date.now();
		if (timeEnd - timeStart > wait) {
			fn.apply(this, args);
			timeStart = timeEnd;
		}
	}
}
```

#### HOC（高阶函数or组件）与Compose（组合）

&emsp;&emsp;啥是高阶函数，其实跟上面的闭包的操作手段有点像，最终都会再返回一个函数。只不过它会根据你实际需求场景进行一些附加的操作来“增强”传入的原始函数的功能。像`React`中的一些HOC（高阶组件）的应用其实也是同理，毕竟`class`也不过是`function`的语法糖。网上的应用场景也很多，这里不赘述了。主要再提一嘴的是`compose`函数，它能让我们在进行多层高阶函数嵌套时，书写代码更为清晰。如我们有高阶函数A、B、C ，要实现A(B(C(...args)))的效果，如果没有`compose`，就需要不断地将返回结果赋值，调用。而使用`compose`，只需要一次赋值`let HOC = compose(A, B, C);`，然后调用`HOC(...args)`即可。

&emsp;&emsp;瞅瞅`compose`源码，比较简单，无传参时，返回一个按传入返回的函数；一个入参时，直接返回第一个入参函数；多个则用数组的`reduce`方法进行迭代，最终返回组合后的结果：

```javascript
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

#### isPlainObject

&emsp;&emsp;这个工具方法比较简单，就是来判断入参是否是由`Object`直接构造的且中间没有修改继承关系：

```javascript
let isObjectLike = obj => {
    return typeof obj === 'object' && obj !== null;
}

let isPlainObject = obj => {
    if (!isObjectLike(obj) || !Object.prototype.toString.call(obj) === '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(obj) === null) return true; // Object.prototype 本身
    let proto = obj; // 拷贝指针，移动指针直至原型链顶端
    while (Object.getPrototypeOf(proto) !== null) { // 是否纯粹，如果中间发生继承，则__proto__的最终跨越将不会是1层
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;    
} 
```

### 庖丁解牛

&emsp;&emsp;在聊`applyMiddleware`前，我们有必要先分析一波`createStore`内做了什么操作，因为他们俩其实是一个<del>相互成就</del>依赖注入的关系。

#### createStore

```javascript
function createStore(reducer, preloadedState, enhancer) {
// 略
// return {
// 	dispatch, // 去改变state的方法 派发 action
// 	subscribe, // 监听state变化 然后触发回调
// 	getState, // 访问这个createStore的内部变量currentState 也就是全局那个大state
// 	replaceReducer, // 传入新的reducer 来替换之前内部的reducer 可能场景是在代码拆分、redux的热加载？
// 	[$$observable]: observable // symbol属性 返回一个observable方法
// }
}
```

&emsp;&emsp;从源码中的声明可以看到，`createStore`接收三个参数，第一个是`reducer`，这个在项目中通常我们会用`combineReducers`组合成一个大的`reducer`传入。

#### combineReducers

&emsp;&emsp;这个`combineReducers`使用频率还是很高的，我们先简要看看:

```javascript
    function combineReducers(reducers) {
        //  略去一些
        return function combination(state = {}, action) {
            const nextState = {}
            for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i]
            const reducer = finalReducers[key]
            const previousStateForKey = state[key]
            const nextStateForKey = reducer(previousStateForKey, action)
            if (typeof nextStateForKey === 'undefined') {
                const errorMessage = getUndefinedStateErrorMessage(key, action)
                throw new Error(errorMessage)
            }
            nextState[key] = nextStateForKey
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey
            }
            return hasChanged ? nextState : state
        }
    }
	/** 
	 * 比如传入的子reducer函数是 	 
	 * function childA(state = 0, action) {
	 *   switch (action.type) {
	 *		case 'INCREMENT':
	 *			return state + 1
	 *		case 'DECREMENT':
	 *			return state - 1
	 *		default:
	 *			return state
	 *	 }
	 * }
	 * 那初始情况下的store.getState() // { childA: 0 }
	*/
```

&emsp;&emsp;首先`combineReducers`接收一个对象，里面的`key`是每一个小`reducer`文件或函数导出的`namespace`，`value`则是与其对应的`reducer`函数实体。然后它会将这些不同的`reducer`函数合并到一个`reducer`函数中。它会调用每一个合并的子`reducer`，并且会将他们的结果放入一个`state`中，最后返回一个闭包使我们可以像操作之前的子`reducer`一样操作这个大`reducer`。

&emsp;&emsp;`preloadedState`就是我们传入的初始`state`，当然源码中的注释里描述还可以向服务端渲染中的应用注入该值or恢复历史用户的session记录，不过没实践过，就不延展了...

&emsp;&emsp;最后的入参`enhancer`比较关键，字面理解就是用来增强功能的，先看看部分源码：

```javascript
if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
}

if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
}
```

&emsp;&emsp;在这里我们发现其实`createStore`可以只接收2个参数，当第二个参数为函数时，会自动初始化`state`为`undefined`，所以看到一些`createStore`只传了2个参数不要觉得奇怪。

#### applyMiddleware

&emsp;&emsp;然后往下看对`enhancer`函数的调用，这写法一看就是个高阶函数，接收一个方法`createStore`，然后返回一个函数。现在我们可以把`applyMiddleware`抬上来了，这个API也是`redux`本身唯一提供的用于`store enhancer`的。

```javascript
function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
	const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

#### redux-thunk

&emsp;&emsp;我们注意到`applyMiddleware`作为`enhancer`又把`createStore`这个函数作为参数传入并在内部返回函数中调用了，这其实也是依赖注入的理念。然后我们发现内部其实将`applyMiddleware`的入参传入的中间件都执行了一次，传参为`getState`和`dispatch`。这里可能初见者比较懵逼，我们先把早期处理异步`action`的中间件`redux-thunk`的源码翻出来看一眼：


```javascript
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

&emsp;&emsp;通过代码，我们可以得知一般`middleWare`的内部构造都遵从一个`({ getState, dispatch }) => next => action => {...}`的范式，并且导出的时候已经被调用了一次，即返回了一个需要接收`getState`和`dispatch`的函数。

&emsp;&emsp;Get到这一点以后，我们再往后看。通过`compose`将中间件高阶组合并“增强”传入原`store.dispatch`的功能，最后再在返回值内解构覆盖原始`store`的`dispatch`。

&emsp;&emsp;所以这个时候，如果我再问`applyMiddleware`做了什么？应该大家都知道答案了吧，**就是增强了原始`createStore`返回的`dispatch`的功能。**

&emsp;&emsp;那再回到那个如何处理`redux`中的异步数据流问题？**其实核心解决方案就是引入中间件，而中间件最终达成的目的就是增强我们的原始`dispatch`方法。**还是以上面的`redux-thunk`的`middleware`来说，它传入的`dispatch`就是它内部的`next`，换言之，调用时，如果`action`是个普通对象，那就跟往常`dispatch`没啥差别，正常走`reducer`更新状态；但如果是个函数，那我们就要让`action`<del>自己玩了</del>自己去处理内部的异步逻辑了，比如什么网络请求，当Promise`resolved`了`dispatch`一个成功`action`，`rejected`了`dispatch`一个失败`action`。

#### redux-devtools-extension

&emsp;&emsp;在开发环境中，为了追溯以及定位一些数据流向，我们会引入`redux-devtools-extension`，这个模块有2种使用方式，一种是沉浸式，即在开发环境安装对应依赖，然后通过2次增强我们的`applyMiddleWare`返回一个传入`createStore`中的`enhancer`，比如下面这样的：

```javascript
import { composeWithDevTools } from 'redux-devtools-extension';

const composeEnhancers = composeWithDevTools(options);
const store = createStore(reducer, /* preloadedState, */ 
composeEnhancers(
  // 一个 enhancer入口 套中套
  applyMiddleware(...middleware),
  // other store enhancers if any
));
```

&emsp;&emsp;又或者是插件扩展式的：

```javascript
const composeEnhancers = typeof window === 'object' && typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== 'undefined' ?
 window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

 // 剩下操作跟上面一样
```

&emsp;&emsp;更细节定制见[官方](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md)。

### 收工漫谈

&emsp;&emsp;现在处理异步逻辑的中间件已经不少了，但是原理都是差不多的，只不过说从以前的传`function`，到`Promise`、`Generator`控制之类的；像前文例子的`redux-thunk`是比较早的异步中间件了，之后社区中有了更多的方案提供：如`redux-promise`、`redux-saga`、`dvajs`、`redux-observable`等等。我们还是需要根据实际团队和业务场景使用最适合我们的方案来组织代码编写。

### 简单回忆

&emsp;&emsp;1. `store`本身的`dispatch`派发`action`更新数据这个动作是同步的；
&emsp;&emsp;2. 所谓异步`action`，是通过引入中间件的方案增强`dispatch`后实现的。具体是`applyMiddleware`返回`dispatch`覆盖原始`store`的`dispatch`；
&emsp;&emsp;3. 为何会采取这种中间件增强的模式，我个人看来一是集中在一个位置方便统一控制处理，另一个则是减少代码中的冗余判断模板；

### 课后思考

&emsp;&emsp;认真阅读文章的朋友，可能会有一个思考。

&emsp;&emsp;**在`redux-thunk`、`redux-saga`这些中间件的编写范式中`next`和我们的`dispatch`到底有什么关系？**

&emsp;&emsp;前文中，我们仅使用了`redux-thunk`来进行`applyMiddleware`能力的阐释，不过既然是中间件，我们大可以再添加一个比较常见的工具中间件`redux-logger`来进行结合说明。

![](logger.jpg)

&emsp;&emsp;可以看到`logger`实例的构造函数内，刨除对`console`是否存在的判断及是否作为`applyMiddleware`唯一参数的判断外，范式也是遵从`middlewareAPI`定义的。

&emsp;&emsp;那么我们看一个常见应用场景，对我们每一个`dispatch`动作进行日志打印：

```javascript
const store = createStore(
  reducer,
  applyMiddleware(thunk, logger)
);
```

&emsp;&emsp;`redux-logger`的使用必须放在中间件的最后一个，原因也很简单，它应该是包裹增强`dispatch`最近的一层，即发生调用时，输出日志，这就是它的功效。而根据源码中`compose`组合的高阶函数，`compose(A,B)(...args) => A(B(...args))`，也确实反应了这一点。

&emsp;&emsp;那么我们回归主线，实际上第一层的`redux-logger`它返回的就是一个`action => { 定制打印能力...; return next(action) }`的箭头函数, 而这第一层的`next`实际上就是`store.dispatch`。综合来看，第一层中间件（我们这里是logger），就是在执行`dispatch`基础职能之上再额外定制了一些打印的能力，然后将这个增强的高阶函数HOC1（1层强化版dispatch），交给下一个中间件的`next`使用。最终走完整条中间件链。