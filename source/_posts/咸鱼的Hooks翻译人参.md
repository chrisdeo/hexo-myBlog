---
title: 咸鱼的Hooks翻译人参
date: 2018-12-25 11:49:34
tags:
  - Javascript
  - React
  - Hooks
---

> &emsp;本文并不全是按照React官方文档中关于Hooks提案部分的翻译，最终由本人总结整理顺序思考总结所得。

## 什么是Hooks?

&emsp;&emsp;在官方文档中，是这么描述hooks的：hooks是一个新的功能提案，它允许你在class外使用state和其他的React特性。hooks是许多方法的集合，它们使你能够在函数组件内使用React的状态(state)和生命周期(life cycle)特性。你可以在**Reactv16.7.0-alpha**版本里面使用它（不过在实际发布的Reactv16.7.0版本中并没有实装该特性）。

## 为什么要使用Hooks?

&emsp;&emsp;1、React本身是没有提供给我们逻辑复用的方式的，我们开发中多是借助redux的connect方法，将全局Store中对应类型的state绑到我们当前组件的props中。那么hooks能够做到什么呢？它不仅可以将含有state的逻辑从组件中抽象出来，而且不必重构先前的代码（**渐进式**），同时这些抽象出来的逻辑能够跨组件复用。

&emsp;&emsp;2、Hooks允许我们根据相关部分(例如设置订阅或获取数据)**将一个组件分割成更小的函数，而不是强制基于生命周期方法进行分割**。我们还可以选择使用一个reducer来管理组件的本地状态，**使其预测性更强**。

&emsp;&emsp;3、class本身就是一块语法糖，其中涉及的this上下文绑定会带来初学者的一些学习成本，除此之外，它目前并不能很好的被minify，同时会造成很多不必要的组件更新。虽然这一问题还未得到根本解决，但是hooks的出现提供了额外的操作空间，它使我们**能够在class之外使用更多React的特性**。

<escape><!-- more --></escape>

## Hooks有什么规则限制?

&emsp;&emsp;Hooks本身是JS 函数，它还具有两个额外的规则：
&emsp;&emsp;1、**必须在顶层作用域被调用**，这意味着它不能被诸如条件、循环语句嵌套在内部。
&emsp;&emsp;2、只有在**函数组件（见后文解释）内**才能够调用Hooks函数（或者在自己的自定义的Hooks中）。
&emsp;&emsp;**PS： 这只是一种理念上的规范，而非语法层面的规范，你需要配合EsLint来控制**
&emsp;&emsp;安装对应的eslint来强制校验：`npm install eslint-plugin-react-hooks@next`
&emsp;&emsp;ESLint配置:```{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error"
  }}```

## 什么是函数组件(Function Component)

&emsp;&emsp;之前，我们在学习React中的过程中有了解过无状态组件，大家都知道无状态组件中间多是产生复用价值的一些渲染结构并且不会有内部state，一般通过父组件的props取得需要的参数。现在我们可以通过hooks的能力在这些无状态组件中使用state，文档中称这种“**通过hooks方法使用state的无状态组件**”为函数组件。

## Hooks有哪些API?

### useState

&emsp;&emsp;1、基本使用方法
&emsp;&emsp;useState 是Hook的一种，我们通过在函数组件中调用它来为该组件添加一些本地状态。并且在重新渲染的时候，这个状态能够被记录。

&emsp;&emsp;调用useState会返回一对变量`[当前state, 对该state进行更新的函数]`。这个API的使用场景跟this.setState在class中作用的场景一致，当然它不会像setState那样合并新旧state。

&emsp;&emsp;2、如何声明多个state
&emsp;&emsp;同样在函数组件中，通过解构的方式多次调用即可，如下：
```javascript
    const [age, setAge] = useState(42);
    const [fruit, setFruit] = useState('banana');
    const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
```
&emsp;&emsp;`useState(initialState)`,useState的唯一入参是它的初始state，并且该state**只有第一次render的时候被使用**。除此之外，**这个state的类型没有限制**，而class内的this.state必须是object类型。解构后拿到的state变量我们现在可以直接通过JSX`{变量名}`来访问，而无需再添加前缀this.state。

&emsp;&emsp;我们已经知道了useState和state的联系，但是在函数组件中可以出现多次的useState调用，即多个state，那React是如何将它们关联起来的呢？

&emsp;&emsp;答案就是：**Hooks的调用顺序**。

&emsp;&emsp;每一次render不论是初次还是之后的更新中，hooks调用顺序都会保持一致，useState，在初次render后会直接读取该属性变量而忽视其中的参数，useEffect则会替代之前的Effect。

&emsp;&emsp;为什么前文规则中会限制不能将hooks放到嵌套、条件、循环这些语句中就是因为它们会破坏之后的顺序，比如条件判断下，可能会造成顺序前移而导致bug。


### useEffect

&emsp;&emsp;`useEffect(didUpdate);`

&emsp;&emsp;看到Effect这个词，第一念头是什么？副作用。副作用其实就是那些会影响我们组件并且无法在render中完成的操作。

&emsp;&emsp;该函数接收一个包含命令式、可能含有副作用的代码的函数，像数据逻辑改变、订阅事件、定时、注册等其他可能引起副作用的函数都不被允许放在函数组件的主体内，如果这么做将会导致bug或者UI处理上的矛盾。


&emsp;&emsp;useEffect提供了能够在函数组件中完成副作用任务的能力，它与class内的componentDidMount,componentDidUpdate,componentWillUnmount的周期目的一致，但被整合到了一个API中。

&emsp;&emsp;当你调用useEffect时，发生了什么？React会在DOM完成刷新变化后，执行你的副作用函数，并且因为你的副作用函数在组件内声明，它可以访问其（作用域）中的state和props，我们可以把effects理解为React从纯函数世界通往命令式世界的一扇小窗。

&emsp;&emsp;默认情况下，React在每次render后（包括首次render）执行我们的副作用函数。

&emsp;&emsp;Effects可以有选择性的区分如何卸载其本身，我们可以通过在useEffect函数中返回一个函数来操作:

```javascript
  useEffect(() => {    
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);    
    return () => {      
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id,handleStatusChange);   
    };  
  });
```
&emsp;&emsp;文档这里说这里的`props.friend.id`如果没有发生改变，可以选择跳过这一次重新订阅。

&emsp;&emsp;与`useState`一样，一个函数组件内部也可以调用多个`useEffect`。

&emsp;&emsp;不同于ComponentDidMount和ComponentDidUpdate,**useEffect不会在更新屏幕的时候锁定浏览器**，它使我们的应用更容易响应。大部分的副作用函数无需同步发生，但是在一些不常见的场景下，比如测量DOM的布局宽高，就需要同步进行，为此React提供了专门的hooks api **useLayoutEffect**（与useEffect效果相同，但是被设计来专门处理这种问题）来进行。

&emsp;&emsp;在这个返回函数demo中，React 会在**组件卸载(componentWillUnmount)**和在**随后render(rerender)**中重新执行这个副作用函数的环节取消其中的订阅事件。

&emsp;&emsp;文档中陈述了在React中通常有2种副作用类型，**一种需要清理，另一种不需要。**

&emsp;&emsp;通常我们会在DOM更新完后进行一些额外的操作，比如网络请求、手动DOM操作、注册操作等，这些就是属于**不需要清理**的操作。

&emsp;&emsp;在render中不应该存在会产生副作用的操作，我们通常在DOM更新完成后执行我们的副作用操作。这也是我们为什么在class内的componentDidMount和componentDidUpdate中进行副作用操作。

&emsp;&emsp;在官方演示的DEMO中，在以上2个生命周期中出现了重复的语句，这是因为有时候我们会有一些使用场景，不仅是发生在初次渲染完成触发的，也有可能会在之后的更新重新render后触发。React并没有为此提供一个统一的每次render触发的方法。

&emsp;&emsp;useEffect能够告诉React你在每一次render后都需要做些什么(即**每次render都会触发（能够优化见后文的使用Effect技巧）**，包括初次渲染和之后的更新渲染)，其实就是解决了上述的问题。

#### 什么时候需要清理操作?

&emsp;&emsp;当我们需要**订阅外部数据源**时，就有必要进行清理操作，否则会导致不必要的内存泄露问题。

&emsp;&emsp;在传统的react class内，我们通常在componentDidMount中进行订阅，在componentWillUnmount内取消订阅，而这一对操作其实都是对应同一个副作用，我们不得不拆分理论上针对一个副作用操作的逻辑到两个生命周期中。

&emsp;&emsp;我们不需要额外的effect来进行清除动作，由于添加和移除订阅操作联系过于紧密，useEffect设计将它们放在了一块处理。我们可以在原本的effect中return 一个清理方法，这个方法会在需要进行清理动作的时候执行。那清理时机又是什么时候呢，自然是组件卸载的时候进行清理。前文中，我们已经知道副作用函数每一次render都会触发，所以React也会在每一次render后清理上一次的effects。

&emsp;&emsp;PS. 这个返回的清理方法是可选的，并且它的命名并不重要，可以是箭头函数返回的匿名函数，它的实际意义就是为了我们进行清除操作。

#### 使用Effect的一些技巧

&emsp;&emsp;1、声明多个Effects来解耦一些不同逻辑的操作。
&emsp;&emsp;2、就像componentDidUpdate中能够通过(prev,next)来跳过没必要的更新，Effects也有类似的方式，我们通过第二个参数来判断差异变化（文档中说未来版本可能会移除第二个参数，放到内部去进行处理）：```javascript
useEffect(() => {
    document.title = `You clicked ${count} times`;
    }, [count]); // Only re-run the effect if count changes```

&emsp;&emsp;**PS. 当使用这种优化的时候，需要确认第二个参数的数组内涵盖了所有外部被effect使用并发生改变的变量，否则将会一直引用之前render的变量。如果想只进行一次副作用函数操作和清除，可以在第二个参数内传一个空数组。这会告诉React你的effect不会依赖任何属性和state的变化，所以它不需要重新渲染。**

#### 为什么在函数组件内调用useEffect?

&emsp;&emsp;在useEffect内我们能够直接使用我们的state变量而不需要在使用api去取，因为它已经存在于该作用域内了。Hooks规避了专门的React API去对state进行操作，而使用了原生的js闭包方案。
&emsp;&emsp;在每一次React进行组件渲染时，它都会记住我们使用过的副作用函数，并且在DOM更新后使用。
&emsp;&emsp;我们每一次进行调用的useEffect都不是相同的引用（其中的匿名箭头函数都会返回一个不同的）。这样的设置其实也是刻意而为，它使我们不必担心其中的state不刷新，因为其每次rerender都会取得一个新的effect来代替之前的。从某种角度上来说，这种返回方式使得effect更像每一次render后结果的一部分。

### useContext

&emsp;&emsp;`const context = useContext(Context);`

&emsp;&emsp;接收一个通过React.createContext方法创建的context对象(将由最近一层的provider提供)，并且返回一个最新的context。

&emsp;&emsp;***不需要嵌套结构即可订阅到Context内容。***

### useReducer

&emsp;&emsp;`const [state, dispatch] = useReducer(reducer, initialState);`

&emsp;&emsp;reducer 以(state, action) => newState格式传入。

&emsp;&emsp;***可以使用reducer进行复杂组件的局域状态管理。***

#### 懒初始化

&emsp;&emsp;useReducer有一个可选的第三参数，initialAction，如果提供了该参数，在第一次render过程中将会使用该actoin，这在进行含有传递来源属性values的初始state计算时非常有用。

### useCallback&useuseMemo

&emsp;&emsp;都是返回一个记忆版本的回调，并且只有当其中一个输出发生改变以后回调函数才会发生改变。它优化了需要依赖这些回调引用的的子组件，避免了不必要的渲染。（比如shouldComponentUpdate）。```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],);```

&emsp;&emsp;useCallback(fn, inputs)与useMemo(() => fn, inputs)两者等价。

### useRef

&emsp;&emsp;`const refContainer = useRef(initialValue);`

&emsp;&emsp;useRef函数会返回一个新的不变对象，且它会具有一个current属性，值就是你传入的initialValue入参。这个返回对象在组件的整个生命周期中都会存在。

&emsp;&emsp;一个常见的使用场景：```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );}```

&emsp;&emsp;使用useRef()比我们之前的ref属性更加方便，它更贴近于类中的实例属性和方法使用。

### useImperativeMethods

&emsp;&emsp;`useImperativeMethods(ref, createInstance, [inputs])`

&emsp;&emsp;useImperativeMethods在使用ref时 自定义了一个向父组件暴露的实例值。在大多数情景下，我们不应该使用命令式编程来使用refs。useImperativeMethods应该与forwardRef配合使用。

```javascript
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeMethods(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;}
FancyInput = forwardRef(FancyInput);
```

&emsp;&emsp;这样会返回一个`<FancyInput ref={fancyInputRef} />`父组件（HOC）。

&emsp;&emsp;此时`fancyInputRef.current`指向了input引用。

### useMutationEffect

&emsp;&emsp;它的语法使用也是跟useEffect一致的，但是它会同步地在兄弟组件更新完成前，React执行DOM变化时被调用。我们可以使用这个hook来定制DOM变化，值得注意的是，我们应该避免在useMutationEffect中读取DOM，这将会导致执行问题（布局抖动）。如果真的需要计算样式和布局信息，我们应该使用useLayoutEffect。

### useLayoutEffect

&emsp;&emsp;它的语法使用也是跟useEffect一致的，但是它会同步地在所有DOM变化发生完成后被调用。我们可以使用它来读取DOM布局Layout信息并且同步地进行rerender。在该函数内的更新操作将会在浏览器重绘前同步发生变化。

&emsp;&emsp;如果可能出现锁定view层更新的情况，我们应当使用标准的useEffect方案。

&emsp;&emsp;PS.如果你正在迁移class内的代码，useLayoutEffect将是风险最低的effect hook，因为它与componentDidMount和componentDidUpdate处在相同阶段。

## 自定义Hook

&emsp;&emsp;以前，我们希望在不同组件中复用相同的状态逻辑，通常我们有两种解决途径，分别是**高阶函数**以及**render props**方式（**指一种在 React 组件之间使用一个值为函数的 prop 在 React 组件间共享代码的简单技术**）。现在我们可以通过自定义Hook来实现，并且不再需要在渲染树上挂更多的组件结点。

&emsp;&emsp;在这一块中，文档对Hooks有了新的描述：**它只是一种重用状态逻辑的方式，而不是重用状态本身**。

&emsp;&emsp;每一次对Hook的调用都会创建一个完全独立的state，所以我们可以在一个组件中使用同样的自定义Hooks多次。

&emsp;&emsp;自定义Hooks比起React特性，更像是一种“习俗”（我有一种特殊的技巧？）。如果一个函数命名以”use”开头，**并且它调用了别的hooks**，我们称其为自定义Hook（并且这种useXXX命名也作为了lint的校验规则）。

&emsp;&emsp;自定义Hooks的应用场景非常多，涵盖了常规的事件句柄操作、动画、声明订阅、定时器等等。

## 总结

&emsp;&emsp;这里写下个人对Hooks的看法，首先我觉得它更像是一种Hack技巧，就像它的命名一样，钩子，它能让我们从Class外部直接进入（钩子挂上去）React的各个特性，诸如state、reducer、context里去进行操作；它是渐进式的，我们使用它并不需要付出高昂的人力开发成本去重构之前的代码，只需要在我们需要使用的地方直接使用即可；它的基本理念与我们以往使用React的一致，只不过写法换了，并且有了些规则限制（后文中有描述）;Hooks的使用无疑让每个函数的分工更加明确，比如以往我们需要在componentDidMount、componentDidUpdate、componentWillUnmount中对相同的一个变量进行控制，就会出现一模一样的代码，即便我们可以抽离成一个函数，但换汤不换药。Hooks中提供的useEffect就能够将这3个Lify Cycle整合到了一起，我可以把我每一次render后要做什么和组件卸载时执行什么操作统一写在useEffect内，一个函数完美实现3个阶段（每一次render以及最后的卸载）的控制效果。