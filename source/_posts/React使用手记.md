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

&emsp;&emsp;在实际使用上，借助于JSX的特性，我们可以更像编写原生JS一样去敲React，而Vue则内部集成了一系列的指令和数据收集机制来使我们同样轻松直接地进行逻辑编写；在数据同步上，React需要手动地进行`setState`，而Vue由于内部代理的机制（过去的`Object.defineProperty`到`Proxy`代理）我们无需关注具体更新操作，使用提供的指令即可；另外在大型项目中比较重要的状态管理问题我们会在后文讨论。

## React初期易混淆点

### setState问题

&emsp;&emsp;这里我只讲表现形式，底层原理有时间各位可以自行研究~

1. **合并更新问题**，即当我们在一个函数内对**同一属性**进行多次`setState`时，仅会以最后一次的属性变化进行更新；

2. **引用类型更新问题**，该问题可以大致总结为修改引用类型的`state`属性，再对其`setState`不会重新`render`；

```javascript
let { arr } = this.state; // arr = [1,2,3]
arr[0] = 5;
this.setState({arr}) // arr = [5,2,3]
// 虽然 arr 内部元素改变了 但对React而言 它还是指向一个引用 即未发生改变 不会触发render
```

&emsp;&emsp;对于对象通常可以采用`Object.assign({}, this.state.xxx)`、`{...this.state.xxx}`的方式、数组则可以使用解构或拼接重新赋值`[...this.state.xxx]`，`[].concat()`的方式。

&emsp;&emsp;PS. 在React-Native中似乎有一些别的处理，实践发现引用类型的`setState`可以正常触发变化（不过PC端项目是肯定不行的，希望注意，尽量统一修改方案）

3. **如何同步获取更新后的数据**，`setState`由于其底层的批更新和判断机制，会给我们一种“异步”的感觉，但本质上它还是同步实现的，我们经常会遇到一种场景是先对`state`内的数据进行更新（如`fetch`我们的数据然后在组件中保持状态），再对该数据操作。假如我们按下面的操作肯定是不行的，拿到的还是初始状态值：

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

&emsp;&emsp;这种情况可以简单理解为在`setState`机制内部无法对Event-Loop的执行顺序控制，走了同步行为的分支判断，最终以同步表现。

4. 原生事件下的`setState`也表现为同步，何谓原生事件，即通过`addEventListener`这种方式绑定的，与之对应的是React自身封装构造的合成事件（见下文）； 

### 合成事件与函数绑定问题

&emsp;&emsp;先说**合成事件（SyntheticEvent）**，对Web应用来说，存在很多不同浏览器的兼容问题，过去需要我们根据不同环境做兼容处理，而现在React内已经帮我们做好了统一的封装，所以在React中的一些如`onClick`触发的回调已经不是我们原生的点击事件了。就拿事件冒泡来说，过去我们可以直接`return false`阻断继续冒泡，但是从`v0.14`版本开始就无效了，须要严格执行`e.stopPropagation()`或者`e.preventDefault()`。原生的绑定即前文提到的`addEventListener`。

&emsp;&emsp;React组件声明时，第一个字母须大写；

&emsp;&emsp;React中的事件、属性命名须遵守驼峰规范；

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

### 生命周期

&emsp;&emsp;React的生命周期要分版本看，目前我们的项目版本是v16.8.x，以下对比v16.3前的周期和v16.3后的周期：

![](oldLifecycle.jpg)

![](lifecycle.jpg)

&emsp;&emsp;对比看来，在未来新版本中有意移除以下周期函数（目前可以使用`UNSAFE`前缀进行标记来提示自己未来某个时间节点或许会被移除）：

![](unsafe.jpg)

&emsp;&emsp;原因在于React在v16版本中采用了新的异步Fiber架构，这种架构下，React的渲染是切片式的，有点像计算机系统中的任务调度，它会将渲染分为两个阶段：`render`和`commit`。在`render`阶段，如果遇到紧急任务，会将之前做的事情全部舍弃，优先执行，然后再重新执行之前的任务。这也是为什么不要在`componentWillMount`中进行AJAX请求的原因。显然我们不会期望多次进行请求。不过`componentWillMount`也是React进行SSR时唯一能介入的生命周期函数。官方也建议在`constructor`内初始化`state`，而不要在`componentWillMount`内`setState`:

![](willMount.jpg)

&emsp;&emsp;服务端请求、一些事件订阅也应当放在`componentDidMount`中执行，订阅类须在`componentWillUnmount`中取消订阅：

![](didMount.jpg)

&emsp;&emsp;你或许会对获取请求数据后在`componentDidmount`中`setState`触发额外的`render`抱有疑惑，我当年也有，不过上图也给出了解答：额外的`render`会在浏览器更新屏幕前进行触发，所以即便有多次`render`用户也不会感知。

### 数据管理

&emsp;&emsp;React的数据管理也是一个逐步演化、进步的过程：单向数据流方面，从`flux`到`redux`，再到社区一系列的成熟中间件`thunk`、`saga`、`observable`等辅助；观察者方面，有类似Vuex的`mobx`。