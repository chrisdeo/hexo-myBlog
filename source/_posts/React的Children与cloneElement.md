---
title: React的Children与cloneElement
date: 2019-10-30 08:55:54
tags:
  - React
---

> &emsp;介绍俩平常没使用的React API，近日踩雷了，遂借此篇提出来品品...

<escape><!-- more --></escape>

&emsp;&emsp;首先这俩货同属于React的顶层API，即我们`import React from 'react';`后，可以通过`React.xxx`的方式来调用。

&emsp;&emsp;再看官方文档对它们的划分：

![](doc.jpg)

&emsp;&emsp;图中的几个API都是对`React`元素进行操作的，`isValidElement`就不赘述了，用来校验入参是否是一个合法的`React`元素，返回一个布尔值。

### React.Children

&emsp;&emsp;我们都知道在`props`对象中还有`children`这个属性。它能够从某种程度上减少我们在一个组件内的嵌套层级，可能这样描述有点抽象，举个栗子：

```javascript
// 比如我们有个Modal模态框组件
export default class Modal extends React.Component {
    //...
}

// 有很多场景需要在Modal框内展示子组件的东西，最常见的结构类似下面

<Modal>
    <Content />
</Modal>

// 的确可以在定义Modal的文件内import子组件，但我们这是一个公共的组件，它仅是一个套套，所以通常会使用下面这种方案

render() {
    return (
        <div>
            {this.props.children}
        </div>
    )
}
```

&emsp;&emsp;这样来说，我们的父组件就和可能传入的`children`解耦了，各个模块都是独立的，各司其职。更多的关于`props.children`的语法阐释可以阅读[官方文档](https://reactjs.org/docs/jsx-in-depth.html#children-in-jsx)。

&emsp;&emsp;看到这里，我们也发现了一个问题，就是`props.children`对于我们开发者来说就是一个黑盒，我们对它可能传入的数据结构是不可知的（表达式、布尔、`render function`等等），如果我们没有对其进行操作，那其实没什么所谓。但只要我们对其进行操作了，比如下意识以为是个数组进行`props.children.map`这样的调用就要注意，非`Array`就直接报`TypeError`了。那怎么处理类似这样的情景呢？

&emsp;&emsp;其实`React.Children`恰好就是为我们提供处理`props.children`数据结构能力的API。**注意这里`React.Children`的`Children`是大写**。

#### React.Children.map

&emsp;&emsp;`React.Children.map(children, function[(thisArg)])`这个类方法能够cover前文我提到的未知数据结构下的遍历问题，只需要简单修改：

```javascript
React.Children.map(props.children, child => {})
```

&emsp;&emsp;可以看到这个API接收两个参数，第一个就是我们通常要处理的黑盒`prop.children`，第二个入参回调，其实就是我们遍历的元素上下文，通过它，我们能够进行定制化的操作。

&emsp;&emsp;笔者结合源码得到当`props.children`为`null`和`undefined`时，最终会原值返回，其余情景则是返回一个数组。

#### React.Children.forEach

&emsp;&emsp;跟`React.Children.map`类似，都是迭代操作，只不过这个不会返回数组。`undefined`和`null`时的判断逻辑同上。

#### React.Children.count

&emsp;&emsp;返回其中内部元素数，其值与前面两个迭代方法的回调触发次数相等。

#### React.Children.only

&emsp;&emsp;用于判断传入的`children`是否只有一个`child`。注意接收类型是`React element`。不能拿`React.Children.map()`返回的结果再去判断是几个`child`，因为此时你拿到的已然是一个`Array`类型。

#### React.Children.toArray

&emsp;&emsp;这个API会将黑盒的`props.children`数据结构以扁平的`Array`结构暴露给我们，如下面这样：

![](ds.jpg)

&emsp;&emsp;常用在往下传`props`时，重新排序或过滤部分`children`的情景。

### React.cloneElement

&emsp;&emsp;有了上面的铺垫，这个API的引入就比较自然了，前文中我们通过`React.Children`的类方法得到了访问本是黑盒的`props.children`的能力。`React.cloneElement`则是能让我们在操作`React element`时，进行浅层的新`props merge`，传入的新`children`则会替换旧的`children`。原`element`的`key`和`ref`都会保留。

&emsp;&emsp;看下API定义：

```javascript
React.cloneElement(
  element,
  [props],
  [...children]
)
```

&emsp;&emsp;其实跟`React.createElement`的构造有点像：

```javascript
React.createElement(
  type,
  [props],
  [...children]
)
```

&emsp;&emsp;毕竟是拷贝返回一个新的组合元素，`React.cloneElement`处理`element`时可以大致理解成`<element.type {...element.props} {...props}>{children}</element.type>`。

&emsp;&emsp;那这个API到底有啥用呢？举一个场景：

```javascript
<Tabs active=''>
    <Tab id='a' title='a'>
        Content: {Math.random()}
    </Tab>
    <Tab id='b' title='b'>
        Content: {Math.random()}
    </Tab>
    <Tab id='c' title='c'>
        Content: {Math.random()}
    </Tab>
</Tabs>
```

&emsp;&emsp;我希望点击对应`Tab`的时候，再显示Content信息，并且不再修改以上组件结构（不额外在每个子组件上加`onClick`的`props`），实际展示类似下图：

![](display.jpg)

&emsp;&emsp;此时，我们已经了解了前文中介绍的API的能力，大致有两种解决方案，主体思路是一致的，区分在是不是每个子组件都挂一个回调亦或在父组件上挂一个事件代理，去判断。

&emsp;&emsp;这里我使用HOOKS的函数式写法：

```javascript
const Tabs = props => {
    const { children, ...rest } = props;
    const [active, setActive] = useState(rest.active);
    // 事件代理
    let handleClick = e => {
        if (e.target.nodeName === 'A') {
            setActive(e.target.id);
        }
    }
    return (
        <header>
            <nav className={styles.nav}>
                <ul onClick={handleClick}>
                    {
                        React.Children.map(children, child => React.cloneElement(child, {active: active}))
                    }
                </ul>
            </nav>
        </header>
    )
}
```

```javascript
const Tabs = props => {
    const { children, ...rest } = props;
    const [active, setActive] = useState(rest.active);
    // 每一个child 都绑定回调
    let toggleActive = (e, id) => {
        e.preventDefault();
        setActive(id);
    }
    return (
        <header>
            <nav className={styles.nav}>
                <ul>
                    {
                        React.Children.map(children, child => React.cloneElement(child, {active: active, toggleActive: toggleActive}))
                    }
                </ul>
            </nav>
        </header>
    )
}
```

&emsp;&emsp;主体思想都类似，就是把子组件需要的属性和回调函数通过`cloneElement`的方式`merge`进去。

### 小结

&emsp;&emsp;`React.Children`提供了我们直接访问黑盒`props.children`数据结构的能力；
&emsp;&emsp;`React.cloneElement`接收一个`React element`并支持往其中浅层合并`props`，替换旧`children`；笔者看来该API可以从一定程度上减少代码的重复书写，使组件标签表达更加清晰。