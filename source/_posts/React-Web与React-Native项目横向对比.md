---
title: React-Web与React-Native项目横向对比
date: 2020-11-29 11:20:32
tags:
  - React
  - React-Native
---

> &emsp;进行RN开发也差不多有1年的时间了，这篇文章是篇阶段性的总结文章，主要进行React在web和native应用上的对比。

<escape><!-- more --></escape>

### 渲染工作（Renderers）

&emsp;&emsp;React诞生之初仅是为了进行DOM视图渲染。它以“数据即视图”的哲学去进行大型项目页面的复杂状态维护，提高项目的鲁棒性。随后React也开始兼容支持native端的编写，`react-dom`继续支持web的renderer工作，以`react-native-renderer`去进行React-Native的renderer工作。随后社区生态越来越繁盛，也有类似京东的taro同样以React的语法通过babel进行ast转换成支持各种小程序（微信、支付宝、字节）的语法格式。

&emsp;&emsp;以上都是官方文档那句**Learn Once, Write Anywhere**的具现。

### JS运行环境（Engine）

&emsp;&emsp;在Web端主要看是什么浏览器，像我们最常接触的Chrome，运行环境就是大名鼎鼎的V8。而在IOS、Android的模拟器或是真机上，React-Native使用的是[**JavaScriptCore**](http://trac.webkit.org/wiki/JavaScriptCore)，它同时也是Safari的WebKit引擎内置的JS运行环境。由于在IOS上众所周知的访问权限因素，JSCore在IOS中是没有使用[JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation)的。

&emsp;&emsp;值得注意的是，从`0.60.4`rn版本开始，Android已经有新的JS引擎可以替换使用了。它就是Hermes，这篇文章不进行更多的引擎解释，大概意思就是提升了不少js运行的性能，贴一篇[携程的文章](https://cloud.tencent.com/developer/article/1492194)。至于IOS，还是由于平台的审核🚫等问题，在引擎上未作出调整。

&emsp;&emsp;PS，React-Native之于原生App，其实就相当于我们编写的一个组件，`<RNContainer></RNContainer>`承载了我们RN的运行环境。这同时也意味着**原生Appd端可以直接在我们的最外层`props`上挂载属性**。

### 打包（Build）

&emsp;&emsp;在Web端的项目中，目前主流的打包方案都是使用Webpack，而Webpack版本也更新的非常快，写这篇文章时已经到[Webpack5](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)了。而在1年前我才把前东家的打包方式从3升到了4，提升了一定打包效率🤷‍♂️。不过升级5还是要谨慎，之前看一个技术群的小伙伴们讨论，阿里的`antd`里面使用了很多`babel-runtime`的内容在升级5后都扑街了。

&emsp;&emsp;Webpack涉及很大一部分的知识体系，其实在官方文档中都有，想要提升，阅读官方文档➕实践是最理想的方式。不过根据现在的一些脚手架发展，我们可以发现很多配置社区已经帮你集成好了，即形成了沙盒，让业务开发者专注于业务上的内容。这样其实有利有弊，利肯定就是项目从零开始那段空白“开荒”时间，大大减少。另外集成的约束规范（lint、commit-hook、ts等）会帮助我们统一编码风格，减少一些麻瓜错误。弊端也很显著，不利于开发者自身对完整项目构建的掌控，想要自定义改造升级Webpack困难。

&emsp;&emsp;在Native端的项目中，其实React维护团队也对📦方式进行了一定的封装，Metro是React-Native集成的打包方案，里面初始情况下就自带了很多es next的语言特性兼容。不需要我们再在config文件中引入额外的`babel-runtime`或`polyfill`。默认情况下和Webpack的打包方式类似，同样是一个入口`entry`文件（默认是`index.js`)，最终输出一个`bundle`文件（`main.jsbundle`），里面是所有js代码及相关依赖。

### 业务（Coding）

&emsp;&emsp;如果你是有经验的React开发者，我想完成基本的业务实现是没有问题的...

#### 语法（Language）

&emsp;&emsp;其实都是在写React。

#### 事件（Event）

&emsp;&emsp;习惯了Web端的开发者，一开始切换到Native上玩，对于那些点击事件都会下意识的整个`onClick`上去，不过区别于Web端的合成事件系统，Native已经是另外一个体系了。通常的点击是`onPress`, 当然也有长按支持`onLongPress`等等，建议先完整过一遍React-Native的文档再开始动手。

&emsp;&emsp;在Web端我们可以在全局或者具体的DOM节点上挂载某个事件的监听（冒泡or捕获，还要视浏览器的兼容），在Native端则没有了这些能力。那在不同组件我怎么知道是否触发了这些事件呢？通常我们会实现一个比较简单的`EventEmitter`类，配置一个全局的观察者模式进行事件监听、触发、移除等操作。当然也有现有的库支持，如Node自带的`events`。

#### 布局（Layout）

&emsp;&emsp;在Web页面中我们常用`div`进行布局，在RN中最主要进行布局的盒子则是`View`组件。

&emsp;&emsp;在RN中，官方文档推荐的布局样式是使用`flex`，并且RN默认的方向是**纵向的**，习惯了横向的开发者别忘记先设置`flex-direction`。

&emsp;&emsp;`position: absolute`定位在安卓上表现有时会出现异常，如点击不到，对比IOS，此时是正常的。这个时候往往需要设置`z-index`。

&emsp;&emsp;在看常见的Web布局:

![](normal-web-layout.png)

&emsp;&emsp;移动端的页面布局:

![](app-layout.jpg)

&emsp;&emsp;其实我们可以看见比较明显的差异在于，native端在进行布局的时候还需要对顶部的状态栏（通过`StatusBar`组件）进行定制，常见是顶部状态栏是否显示(`hidden`属性)、背景颜色(`backgroundColor`属性，该属性只有Android能配置)、字体颜色(`barStyle`，支持三种模式选择`enum('default', 'light-content', 'dark-content')`)，半透明处理（`translucent`，该内容仅Android支持，作用在于将状态栏与我们的app页面主题背景颜色统一）等。

&emsp;&emsp;处理了`StatusBar`后，就是我们的导航栏样式设置。对于笔者目前的React-Natvie项目而言，使用的是`react-navigation`3.x版本，导航栏的样式相关配置首先得先通过`createStackNavigator`路由堆栈处理相关页面组件，再在对应组件的静态属性`navigationOptions`上进行导航栏配置。具体如何配置可以查阅[官方文档](https://reactnavigation.org/docs/3.x/header-buttons)。

&emsp;&emsp;这里主要想提及的是如何兼容IOS及Android的顶部导航栏高度，因为Android的`StatusBar`有一个`currentHeight`高度，所以在按GUI还原页面时，Android端高度须要减去这个状态栏高。而IOS状态栏高度可以理解为0。

```javascript
    static navigationOptions = ({ navigation }) => {
        return {
            // 返回导航栏的相关配置参数
            headerStyle: {
                height: Platform.OS === 'ios' ? tabBarHeight : tabBarHeight + StatusBar.currentHeight,
                paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
                elevation: 0,
            },
            headerTransparent: true,
            headerTitle: '',
            headerTitleStyle: {},
        }
    }
```

#### 错误捕获（Error Capture）

&emsp;&emsp;相同点是，同步方法中我们可以使用`try...catch...`的方式进行抓取，`render`异常可以通过React的[**错误边界**](https://reactjs.org/docs/error-boundaries.html)进行抓取进行降级处理。不同点是，引发渲染异常时，web表现是白屏，native则会造成rn容器崩溃（闪退）。调试模式下，native端会报红屏，`console.error`同样可以触发红屏，`console.warn`则是黄屏。

&emsp;&emsp;在web应用中，对于那些没有进行捕获的异常最终会冒泡到全局上。可以在全局统一对这类问题进行处理，Web端处理这类型问题一般需要做两件事情: 挂载`onerror(message, source, lineno, colno, error)`以及`onunhandledrejection`事件监听，前者是全局的错误捕获，但是无法处理异步，如`promise`内部的`reject`，该异常需要通过`onunhandledrejection`进行捕获，这个监听回调会收到一个`event`对象，内部有`reason`及`promise`属性，分别可以拿到抛出的异常及对应异常的`promise`，还能通过`preventDefault`方法进行事件冒泡拦截，取消输出到控制台。

&emsp;&emsp;在RN中也有相近的做法，它同样也得做两件事。不过在RN中分了两个工具库去做对应的事情，它们分别是`global.ErrorUtils`及`promise/setimmediate/rejection-tracking`。具体降级处理方案见《React-Native疑难踩坑记录》一文中的[错误捕获](https://chrisdeo.github.io/2020/02/14/React-Native%E7%96%91%E9%9A%BE%E8%B8%A9%E5%9D%91%E8%AE%B0%E5%BD%95/#more)章节。

#### 路由（Router)

&emsp;&emsp;在SPA应用中我们进行页面跳转，本质上是没有再像过往的多页应用那样重新向服务端请求`Content-Type: text/html`的新页面。而是通过路由`hash`，`history`事件trigger进行局部内容替换（卸载->挂载）来达到“跳转”的目的。

&emsp;&emsp;之前进行web端开发时使用的是`react-route`v3.x版本，现在去npm官方查了下已经到5.x版本了。中间4.x版本记忆比较深的改动是，将原本耦合的路由嵌套结构独立了出来。5.x后续有时间可以去看看官方的changelog。

&emsp;&emsp;RN端的路由跳转我个人觉得和Web端差别还是比较大的，从实现角度来说，RN使用的路由库是`react-navigation`，并且原生的路由跳转本质上是一个堆栈结构，对标RN路由配置也能看出来：

```javascript
// In App.js in a new project

import React from "react";
import { View, Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

class HomeScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen
  }
});

export default createAppContainer(AppNavigator);

// 被createStackNavigator配置的组件props会被注入navigation对象，支持回退、跳转到具体路由等功能
```

&emsp;&emsp;那么React Web端人员转到React-Native端进行路由page开发的时候可能遇到什么问题呢？

&emsp;&emsp;这个问题也是直觉上的问题: **堆栈结构导致进行路由跳转后，之前的页面不一定会被卸载**。这也就意味着我们的`componentWillUnmount`周期内的一些逻辑有可能不会被执行。所以在编写业务逻辑时要注意该问题。

#### 状态管理 (State)

&emsp;&emsp;这个倒是一致的，本质上是React生态的补充。`redux`、`mobx`等选择取决于你的开发团队的历史背景。

#### 自适应（Responsive）

&emsp;&emsp;在移动端H5应用中我们可以配置`rem`，根据设计稿及实际手机长宽比设置根`font-size`大小，统一以`rem`进行大小比例响应。当然有时候少部分机型可能有兼容性问题，我们可以通过原始的`@media screen`进行补充设置。

&emsp;&emsp;RN端同样是通过进行GUI设计稿和手机屏幕宽高进行比例计算得到缩放系数再应用到实际布局中。具体是结合`Dimensions.get('window')`拿到可视窗口宽高计算。目前已知问题有：

- `Dimensions.get('screen')`拿到的屏幕宽度不精确。
- 部分安卓机有底部虚拟按键占用屏幕高度，并且该值无法精确获取。

#### Mock

&emsp;&emsp;除了一些像`roadhog`、`umi`框架自己封装好的本地代理Mock方案，自己处理的话，一种是直接引后端配置的远程mock数据，如Yapi；另一种就是自己手撸一个本地的mock服务（不推荐）。