---
title: React使用手记
date: 2020-01-27 14:26:22
tags:
  - 总结
  - React
---

> &emsp;一篇分享文...

<escape><!-- more --></escape>

## 背景

&emsp;&emsp;由Vue的H5页面开发转为React-Native的原生应用开发；

&emsp;&emsp;不是所有成员过去都是主React技术栈，使用方式和理解各有不同；

&emsp;&emsp;这篇文章是本人过去对React的使用的一些思考和总结，希望能让还不熟练的成员对该框架中的一些易出错点在未来遇到时进行规避，同时尽量能够统一一些逻辑组织和写法，减少多人合作时因不同风格带来的理解成本；

## 框架对比

![](framework.jpg)

&emsp;&emsp;上图来源于尤大之前在平安做的分享的PPT，可以看出Vue和React两者在框架方面都是比较轻的（React本身其实只是一个视图库，而Vue尤大本人称其为渐进式框架），它们在复杂应用中都需要一些配套的库参与才能构成一个完整项目。

&emsp;&emsp;在实际使用上，借助于JSX的特性，我们可以更**像编写原生JS一样去敲React**，而Vue则内部集成了一系列的指令（`v-if`逻辑判断、`v-bind`负责绑定数据、属性表达式等、`v-for`循环结构、`v-on`事件监听、`v-model`负责表单域中的双向绑定、`v-show`CSS样式显示切换总是渲染）和数据收集机制来使我们同样轻松直接地进行逻辑编写；在数据同步上，React需要手动地进行`setState`，而Vue由于内部代理的机制（过去的`Object.defineProperty`到`Proxy`代理）我们无需关注具体更新操作，使用提供的指令即可；另外在大型项目中比较重要的状态管理问题我们会在后文讨论。

&emsp;&emsp;Vue的响应式（追踪变化）：

![](watcher.png)

## React开发注意点

### 命名要求

&emsp;&emsp;React**组件声明时，第一个字母须大写**；

&emsp;&emsp;React中的**事件、属性命名须遵守驼峰规范，如`className`、`onClick`等等**；

### setState问题

&emsp;&emsp;这里我只讲表现形式，底层原理有时间各位可以自行研究~

1. **合并更新问题**，当我们在一个函数内进行多次`setState`时，存在**覆盖性**对同一属性进行多次`setState`，取最后一次执行和**合成性**多次`setState`动作会合并成一次。

2. **注意PureComponent使用下可能带来的问题**，由于`PureComponent`实现了浅层拷贝版本的`ShouldComponentUpdate`，当我们进行引用类型的`setState`时，当前组件不会产生更新（相同引用地址`return true`）。而当我们使用`PureComponent`时往往是为了带来一些性能优化的（避免父组件发生`render`，子组件`props`未改变却也造成了额外的`rerender`），所以须要我们注意潜在的认知bug。

```javascript
// PureComponent下
let { arr, obj } = this.state; // arr = [1,2,3], obj = { name: 'Leo' }
arr[0] = 5;
obj.name = 'Tony'
this.setState({arr, obj}) // arr = [5,2,3] obj = { name: 'Tony' }
// 虽然 arr、obj 内部元素改变了 但由于当前进行的是浅层比较 它们还是指向之前的引用 并未发生改变 所以不会触发render
```

&emsp;&emsp;处理方式：对于对象通常可以采用`Object.assign({}, this.state.xxx)`、`{...this.state.xxx}`的方式、数组则可以使用解构或拼接重新赋值`[...this.state.xxx]`，`[].concat()`的方式。

3. **同步还是异步，如何同步获取更新后的数据**，`setState`由于其底层的判断执行机制，会给我们一种“异步”的感觉，但本质上它还是同步实现的。在我们的**生命周期**及**合成事件**中表现为异步，在**原生事件(addEventListener)**及`setTimeout`中表现为同步（为什么这类情况下不是异步表现，可以简单理解为Event Loop下的机制React无法介入修改，而生命周期和合成事件相关都是React自身定义并规定执行流程的）。

&emsp;&emsp;我们经常会遇到一种场景是先对`state`内的数据进行更新（如`fetch`我们的数据然后在组件中保持状态），再对该数据操作。假如我们按下面的操作肯定是不行的，拿到的还是初始状态值：

```javascript
// state.number 0
this.setState({ number: 1 })
console.log(this.state.number) // 0
```

&emsp;&emsp;如果要同步顺序地获取修改后的状态，官方提供了回调的方式如下：

```javascript
this.setState({
	number: 1
}, () => console.log(this.state.number))
```

&emsp;&emsp;`setState`第一个参数也支持传递一个函数进去，该函数的参数为要操作的`state`，我们可能会在一些频繁对`state`变量操作的场景遇见：

```javascript
this.setState(prevState => {
	return {
		number： prevState.number++,
	}
})
```

&emsp;&emsp;最后还有一些不推荐的做法，如`setTimeout`：

```javascript
setTimeout(() => {
	this.setState({
		number: 1
	})
	console.log(this.state.number) // 1
}, 0)
```

### 合成事件与函数绑定问题

&emsp;&emsp;先说**合成事件（SyntheticEvent）**，对Web应用来说，存在很多不同浏览器的兼容问题，过去需要我们根据不同环境做兼容处理，而现在React内已经帮我们做好了统一的封装，所以在React中的一些如`onClick`触发的回调已经不是我们原生的点击事件了。就拿事件冒泡来说，过去我们可以直接`return false`阻断继续冒泡，但是从`v0.14`版本开始就无效了，须要严格执行`e.stopPropagation()`或者`e.preventDefault()`。原生的绑定即前文提到的`addEventListener`。

&emsp;&emsp;再说**函数绑定问题**，先看如下几种绑定方式：

```javascript
export default class Demo extends PureComponent {
	constructor(props) {
		// 此处的super是为了继承父级传下来的props 执行后可以在this上访问props
		super(props)
		this.state = {
			color: this.props.color,
		}
		this.printOut = this.printOut.bind(this);
	}
	printOut() {
		console.log(this.state.color);
	}
	arrowPrintOut = () => console.log(this.state.color)
	render() {
		return (
			<>
				<button onClick={this.printOut}>绑定一</button>
				<button onClick={this.arrowPrintOut}>绑定二</button>
				<button onClick={() => console.log(this.state.color)}>绑定三</button>
			</>
		)
	}
}
```

&emsp;&emsp;先说绑定一、二，两者都是推荐的做法，目的都是拿`this`，个人倾向于使用第二种箭头绑定的方式，原因是绑定一每个都要去构造函数内手动`bind`一次，麻烦...绑定三能不用就不用，原因是直接写在`render`方法中的箭头匿名函数每一次重新渲染都是不一样的，这样造成的结果也很明显：diff算法会判定其发生变化对其再更新，带来额外的性能消耗。

&emsp;&emsp;另外，其实在类中直接声明一个箭头函数是不行的，会报下图问题：

![](error.jpg)

&emsp;&emsp;事实上，我们能够通过该方式声明是依赖了`babel`的`@babel/plugin-proposal-class-properties`插件。通过该插件上图中的内容会被转化为：

```javascript
	var Demo = function Demo() {
		this.printOut = function() {
			console.log(1111)
		}
	}
```

&emsp;&emsp;以上是在`{ "loose": true }`配置下的转化，默认情况配置是`false`，会采用`Object.defineProperty`的方式。具体详情可见[babel官方](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)。

### React事件系统的冒泡捕获

&emsp;&emsp;React的合成事件其实是统一冒泡到`document`上，再通过`dispatchEvent`进行处理的。当我们进行一些DOM事件绑定时，应当尽可能地使用合成事件处理，避免原生绑定和合成事件绑定混用，可以看下面的输出例子：

```javascript
  componentDidMount() {
    this.parent.addEventListener('click', (e) => {
      console.log('dom parent');
    })
    this.child.addEventListener('click', (e) => {
      console.log('dom child');
    })
    document.addEventListener('click', (e) => {
      console.log('document');
    })
  }

  childClick = (e) => {
    console.log('react child');
  }

  parentClick = (e) => {
    console.log('react parent');
  }

  render() {
    return (
      <div onClick={this.parentClick} ref={ref => this.parent = ref}>
        <div onClick={this.childClick} ref={ref => this.child = ref}>
          test
        </div>
      </div>)
  }
```

&emsp;&emsp;当我们点击test时，最终依次输出结果：

- dom child
- dom parent
- react child
- react parent
- document

### 生命周期

&emsp;&emsp;React的生命周期要分版本看，目前我们的项目版本是v16.8.x，以下对比v16.3前的周期和v16.3后的周期：

![](oldLifecycle.jpg)

![](lifecycle.jpg)

&emsp;&emsp;对比看来，在未来新版本中有意移除以下周期函数（目前可以使用`UNSAFE`前缀进行标记来提示自己未来某个时间节点或许会被移除）：

![](unsafe.jpg)

&emsp;&emsp;原因在于React在v16版本中采用了新的异步Fiber架构，这种架构下，React的渲染是切片式的，有点像计算机系统中的任务调度，它会将渲染分为两个阶段：`render`和`commit`。在`render`阶段，如果遇到紧急任务，会将之前做的事情全部舍弃，优先执行，然后再重新执行之前的任务。这也是为什么不要在`componentWillMount`中进行AJAX请求的原因（可能会因为一些奇奇怪怪的原因触发多次）。另外，如果在SSR时，`componentWillMount`中的数据请求会被执行两次（客户端、服务端各一次）。

&emsp;&emsp;官方也建议在`constructor`内初始化`state`，而不要在`componentWillMount`内`setState`:

![](willMount.jpg)

&emsp;&emsp;服务端请求、一些事件订阅也应当放在`componentDidMount`中执行，订阅类须在`componentWillUnmount`中取消订阅：

![](didMount.jpg)

&emsp;&emsp;你或许会对获取请求数据后在`componentDidmount`中`setState`触发额外的`render`抱有疑惑，我当年也有，不过上图也给出了解答：额外的`render`会在浏览器更新屏幕前进行触发，所以即便有多次`render`用户也不会感知。

#### getDerivedStateFromProps

&emsp;&emsp;这个静态方法是在v16.3时出现的，目的其实就是为了渐进废弃之前`render`前的一些Cycle：

 - componentWillReceiveProps
 - componentWillMount
 - componentWillUpdate

&emsp;&emsp;那为什么要干掉这些Cycle呢？因为过去有太多人会在这些周期里做一些带有副作用的事情，比如典型的发AJAX请求等等。

&emsp;&emsp;需要注意的是，在16.3版本这个生命周期只有在父组件重新渲染时，当前子组件才会被连带触发，而子组件本身`setState`则不会触发。另外从16.4版本开始已经兼容成了`setState`和`forceUpdate`都会触发。

```javascript
class ExampleComponent extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    // Called after a component is instantiated or before it receives new props.
    // Return an object to update state in response to prop changes.
    // Return null to indicate no change to state.
  }

  UNSAFE_componentWillMount() {
    // New name for componentWillMount()
    // Indicates that this method can be unsafe for async rendering.
    // Prefer componentDidMount() instead.
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    // New name for componentWillUpdate()
    // Indicates that this method can be unsafe for async rendering.
    // Prefer componentDidUpdate() instead.
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // New name for componentWillReceiveProps()
    // Indicates that this method can be unsafe for async rendering.
    // Prefer static getDerivedStateFromProps() instead.
  }
}
```

&emsp;&emsp;改动Reason参见[官方RFC](https://github.com/reactjs/rfcs/blob/master/text/0006-static-lifecycle-methods.md)。

#### getSnapshotBeforeUpdate

&emsp;&emsp;在16.3版本中还引入了一个新的生命周期`getSnapshotBeforeUpdate`，其实这玩意我们基本没啥用到的场景，其功能就是在下一次更新DOM前提供了一个介入操作数据（`snapshot`）的时机。

```javascript
getSnapshotBeforeUpdate(prevProps, prevState) {
	console.log('#enter getSnapshotBeforeUpdate');
	// 返回值即我们在componentDidUpdate中接收到的快照属性
	return 'foo';
}

componentDidUpdate(prevProps, prevState, snapshot) {
	console.log('#enter componentDidUpdate snapshot = ', snapshot);
}
```

### 受控与非受控组件

&emsp;&emsp;可以简单理解为表单域的值是否受`state`控制。

## 冷门API

&emsp;&emsp;冷门但不代表没用，下面提几个：

 - forceUpdate
 - createPortal
 - Children
 - cloneElement

### forceUpdate

![](forceUpdate.jpg)

&emsp;&emsp;`forceUpdate`通常在我们不依赖组件本身`state`进行更新时触发，即我们开发者本身确认一些别的属性变化须要强制触发组件进行更新时使用。这种方法会直接跳过当前组件的SCU，但不会影响子组件的正常SCU。

&emsp;&emsp;PS：大多数场景我们不需要这个API，根据`props`、`state`控制即可。

### createPortal

![](createPortal.jpg)

&emsp;&emsp;相当于提供我们一个方法直接在指定的DOM结构下配置，常见的应用场景就是全局模态框：

![](modal.jpg)

&emsp;&emsp;BTW，由于依赖ReactDOM，对于我们RN的场景是无法应用的。

### Children

&emsp;&emsp;我们都知道在`props`对象中还有`children`这个属性。它能够从某种程度上减少我们在一个组件内的嵌套层级，就是`props.children`对于我们开发者来说就是一个黑盒，我们对它可能传入的数据结构是不可知的（表达式、布尔、render function等等），如果我们没有对其进行操作，那其实没什么所谓。但只要我们对其进行操作了，比如下意识以为是个数组进行`props.children.map`这样的调用就要注意，非Array就直接报TypeError了。那怎么处理类似这样的情景呢？

&emsp;&emsp;其实`React.Children`恰好就是为我们提供处理`props.children`数据结构能力的API，其具有的方法如下：

 - map
 - forEach
 - count
 - only
 - toArray

#### React.Children.map

```javascript
React.Children.map(props.children, child => {})
```

&emsp;&emsp;这个API接收两个参数，第一个就是我们通常要处理的黑盒prop.children，第二个入参回调，其实就是我们遍历的元素上下文，通过它，我们能够进行定制化的操作。

&emsp;&emsp;并且根据源码，当`props.children`为`null`和`undefined`时，最终会原值返回，其余情景则是返回一个数组。

#### React.Children.forEach

&emsp;&emsp;跟`React.Children.map`类似，都是迭代操作，只不过这个不会返回数组。`undefined`和`null`时的判断逻辑同上。

#### React.Children.count

&emsp;&emsp;返回其中内部元素数，其值与前面两个迭代方法的回调触发次数相等。

#### React.Children.only

&emsp;&emsp;用于判断传入的`children`是否只有一个`child`。注意接收类型是`React element`。不能拿`React.Children.map()`返回的结果再去判断是几个`child`，因为此时你拿到的已然是一个`Array`类型。

### cloneElement

&emsp;&emsp;前文中我们通过`React.Children`的类方法得到了访问本是黑盒的`props.children`的能力。`React.cloneElement`则是能让我们在操作`React element`时，进行浅层的新`props merge`，传入的新`children`则会替换旧的`children`。原element的`key`和`ref`都会保留。

&emsp;&emsp;先看一下API定义：

```javascript
React.cloneElement(
  element,
  [props],
  [...children]
)
```

&emsp;&emsp;由于是拷贝返回一个新的组合元素，`React.cloneElement`处理`element`时可以大致理解成`<element.type {...element.props} {...props}>{children}</element.type>`。

&emsp;&emsp;对于一些有公共方法或属性须要传递的组件，我们能够提前将其需要的信息配置进去。举个[例子](https://codesandbox.io/s/cloneele-0oxo6)。

## 数据管理

&emsp;&emsp;React的数据管理也是一个逐步演化、进步的过程：单向数据流方面，从`flux`到`redux`，再到社区一系列的成熟中间件`thunk`、`saga`、`observable`等辅助；观察者方面，有类似Vuex的`mobx`。

### Redux

&emsp;&emsp;讲Redux前，简要提提Flux（主要是本人没用过）。Flux作为数据单项流的先驱，本身其实仅是一种设计模式（跟React一样，由FB提出），即便是源码中也主要是对`dispatcher`的实现。它的出现是为了解决MVC混乱的数据流向问题。对于Flux来说，视图层唯一的数据源都是来自`store`,通过`dispatch action`去进行数据拉取和更新（event监听）。

![](flux.jpg)

&emsp;&emsp;既然是一种思想，那就意味着不同的开发者会有各种实现和理解，无法统一在某些场景的处理方案。外加其中存在很多冗余代码，于是乎有了后续在社区中脱颖而出的Redux。

&emsp;&emsp;Redux同样是类Flux设计，它简化了Flux的一些冗余代码，其本质上就是一个叫`redux`的npm包，内置了不少API让我们建立`store`，构建`action`、组织`reducer`等。当然完整的数据管理，光有`redux`库是不够的，如果把`store`理解为数据库，那我们需要一个东西将数据与我们的React应用连接起来，那就是`react-redux`，它是由Redux官方提供的React绑定，可以放心食用。

&emsp;&emsp;先聊聊几个`redux`的核心API：`createStore`、`combineReducers`、`applyMiddleware`、`compose`、`bindActionCreators`。

#### createStore

&emsp;&emsp;通过阅读源码，可以知道`createStore`接收三个参数，最终返回一个对象，其中有如`dispatch`、`getState`等关键状态改变获取的方法：

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

&emsp;&emsp;接着我们一个个分析参数，第一个参数`reducer`，在项目中我们通常会使用`combineReducers`组合成一个大的reducer传入，那`combineReducers`做了什么呢？

#### combineReducers

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

&emsp;&emsp;`combineReducers`接收一个对象，里面的`key`是每一个小`reducer`文件或函数导出的namespace，value则是与其对应的reducer函数实体。然后它会将这些不同的reducer函数合并到一个reducer函数中。它会调用每一个合并的子reducer，并且会将他们的结果放入一个state中，最后返回一个闭包使我们可以像操作之前的子reducer一样操作这个大reducer。对于我们开发者来说只要注意导入的子`reducer`文件名，即`key`值便可。

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

&emsp;&emsp;关于`applyMiddleware`，是一个组合中间件的API，社区中也有诸多辅助的库如`redux-logger`（派发`action`时，在控制台打印）、`redux-thunk`（支持`function`类型的`action`）、`redux-saga`（采用`Generator`语法的异步流程处理方式，避免了callback hell）等等。

&emsp;&emsp;下面我们先看看源码，再看看通常是如何使用的。

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

```javascript
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

&emsp;&emsp;从源码中分析，可以比较直观地理解API意图，如`redux`中的工具方法`compose`是为了优雅地进行高阶函数嵌套；假设我们有高阶函数A、B、C ，要实现A(B(C(...args)))的效果，如果没有`compose`，就需要不断地将返回结果赋值，调用。而使用`compose`，只需要一次赋值`let HOC = compose(A, B, C)`;，然后调用`HOC(...args)`即可。

&emsp;&emsp;而`applyMiddleware`的作用也很自然得到是用来增强我们生成的`store`对象的`dispatch`方法，比如增加识别`function`类型的`action`、支持Generator写法，输出日志等等。

&emsp;&emsp;前文源码中的`middlewareAPI`内的属性初见者可能会比较迷，不过我们结合一下`redux-thunk`的源码就很好理解了：

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

&emsp;&emsp;通过代码，我们可以得知一般middleWare的内部构造都遵从一个`({ getState, dispatch }) => next => action => {...}`的范式，并且导出的时候已经被调用了一次，即返回了一个需要接收`getState`和`dispatch`的函数。这样就很好解释`middlewareAPI`的数据结构了。综合`applyMiddleware`调用易得其中的`next`方法即我们传入的`store.dispatch`，通过这般应用中间件的方式支持`function`类型的`action`派发。

#### bindActionCreators

&emsp;&emsp;这个方法本质上就是一个帮我们将`action`直接进行`store.dispatch`包裹，方便我们直接进行调用。其实将`dispatch`注入后再按照我们自定义逻辑去做也完全可以，看个人喜好~

&emsp;&emsp;下面看看这部分源码中做了哪些处理：

```javascript
// 返回一个函数，内部帮我们进行dispatch调用
function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments))
  }
}

export default function bindActionCreators(actionCreators, dispatch) {
  // 如果传入的是一个函数，直接返回封装后的调用方法
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  // 为空 或 不是对象 抛出错误
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${
        actionCreators === null ? 'null' : typeof actionCreators
      }. ` +
        `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  // 传入一个对象时，遍历对象的key，并对每一个key对应的actionCreator进行封装，最后集中在一个对象下返回
  const boundActionCreators = {}
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}
```

&emsp;&emsp;根据官方提供的示例，这个API主要应用在将包裹的多个`actionCreator`传入子组件中方便调用：

```javascript
// TodoActionCreators.js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  };
}

export function removeTodo(id) {
  return {
    type: 'REMOVE_TODO',
    id
  };
}

// SomeComponent.js
import { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as TodoActionCreators from './TodoActionCreators';
console.log(TodoActionCreators);
// {
//   addTodo: Function,
//   removeTodo: Function
// }

class TodoListContainer extends Component {
  constructor(props) { 
    super(props);

    const {dispatch} = props;

    // 这是一个很好的 bindActionCreators 的使用示例：
    // 你想让你的子组件完全不感知 Redux 的存在。
    // 我们在这里对 action creator 绑定 dispatch 方法，
    // 以便稍后将其传给子组件。

    this.boundActionCreators = bindActionCreators(TodoActionCreators, dispatch);
    console.log(this.boundActionCreators);
    // {
    //   addTodo: Function,
    //   removeTodo: Function
    // }
  }

  componentDidMount() {
    // 由 react-redux 注入的 dispatch：
    let { dispatch } = this.props;

    // 注意：这样是行不通的：
    // TodoActionCreators.addTodo('Use Redux')

    // 你只是调用了创建 action 的方法。
    // 你必须要同时 dispatch action。

    // 这样做是可行的：
    let action = TodoActionCreators.addTodo('Use Redux');
    dispatch(action);
  }

  render() {
    // 由 react-redux 注入的 todos：
    let { todos } = this.props;

    return <TodoList todos={todos} {...this.boundActionCreators} />;

    // 另一替代 bindActionCreators 的做法是
    // 直接把 dispatch 函数当作 prop 传递给子组件，但这时你的子组件需要
    // 引入 action creator 并且感知它们

    // return <TodoList todos={todos} dispatch={dispatch} />;
  }
}

export default connect(
  state => ({ todos: state.todos })
)(TodoListContainer);
```

&emsp;&emsp;当然如果只是想对单一的`action`封装并且不涉及往子组件传方法，后文`react-redux`中提供的方式会更为简便。

### React Redux

&emsp;&emsp;前文中讲解了`redux`的比较关键的一些API，同时也提到了`redux`仅是构建`store`的一步，我们还需要有一座桥梁将其与我们的应用连接，那就是`react-redux`。官方提供了清晰的使用DEMO，核心是一个提供全局`store`的`Provider`组件及一个关联`store`的`state`内容到组件的`connect`API：

#### Provider

```javascript
import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import store from './store'

import App from './App'

const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
```

#### connect()

```javascript
import { connect } from 'react-redux'
import { increment, decrement, reset } from './actionCreators'

// const Counter = ...

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    counter: state.counter
  }
}

const mapDispatchToProps = { increment, decrement, reset }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)
```

&emsp;&emsp;可以看到`Provider`组件是嵌套在我们应用最外层的，这样的结构要让全局组件去获取其中的属性很自然能够联想到React的`context`，从源码中分析，新版本`react-redux`已经使用HOOKS语法重构了，不过原理是一样的，`ReactReduxContext`即通过`React.createContext(null)`导出的初始`context`，`useMemo`用以构造两个监听`store`变化触发更新的值，`contextValue`及`previousState`。`useEffect`在两值发生变动时进行事件订阅，如果状态改动会通知嵌套的关联子组件。最终是返回一个`Context.Provider`组件，将`contextValue`交给嵌套的消费者使用。

```javascript
import React, { useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription
    }
  }, [store])

  const previousState = useMemo(() => store.getState(), [store])

  useEffect(() => {
    const { subscription } = contextValue
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    context: PropTypes.object,
    children: PropTypes.any
  }
}

export default Provider
```

&emsp;&emsp;`connect()`涉及到的源码内容比较复杂，这里就不作过深讨论，简单来说就是通过HOC的方式将`store`的`state`内容映射到我们的组件`props`属性上。

&emsp;&emsp;前文内容了解得差不多了后，下面说说我个人使用过的一些方式。

#### 目录组织

&emsp;&emsp;一般我个人习惯下图这样组织`redux`的内容结构，因为`store`是C位，`action`和`reducer`都是辅助：

![](menu.jpg)

#### 拆分合并reducer

&emsp;&emsp;根据业务场景进行对应文件`reducer`的合并（`combineReducers`），`connect`中通过`state.xxx.xxx`绑定。

#### connect传参风格

&emsp;&emsp;`connect`的入参有多种处理方式，得到的效果也不同（主要是是否根据绑定内容`rerender`），我们需要结合自身场景决定哪种使用：

![](connect.jpg)

&emsp;&emsp;另外官方推荐在`mapDispatchToProps`中采用传对象的**简写**格式（`dispatch => bindActionCreators({ xxx }, dispatch)`的简写）。这些处理都可以通过`this.props.xxx`直接进行`dispatch`。当然在不传`mapDispatchToProps`的情况下，也会为你默认绑定一个`dispatch`方法到`props`上，交由开发者手动处理。

![](intro.jpg)

&emsp;&emsp;PS，`connect`也可以使用装饰器的写法。

#### 异步历程

[传送门](https://chrisdeo.github.io/2019/12/02/redux%E5%BC%82%E6%AD%A5%E5%8E%86%E7%A8%8B/)

#### 架构图

![](infra.jpg)