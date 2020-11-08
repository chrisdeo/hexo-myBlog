---
title: redux-saga初体验
date: 2020-11-08 11:10:53
tags:
  - redux-saga
  - redux
  - Redux
  - 中间件
---

> &emsp;关于redux生态中循序渐进出现的redux-thunk、redux-promise、redux-saga、redux-observable等异步中间件库其实本质上都是为了处理一个状态追踪管理问题，至于为什么会出现那么多方案，实际上都是为了使我们的组件逻辑表述更加纯粹。

<escape><!-- more --></escape>

&emsp;&emsp;假如说我们完全不需要对我们的全局状态修改进行追踪（对应的`action`派发，Redux Devtools观察），也没有非常复杂的异步处理场景，React自身提供的Context API是完全够用了...

&emsp;&emsp;社区中有一篇文章对渐进式演变的描述我觉得比较贴切，内容我贴在下面，[原文链接🔗](https://zhuanlan.zhihu.com/p/33925435)

### 状态管理渐进式提升使用对比

#### Context

- 我需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据

#### Redux

- 我需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据
- 我需要全程跟踪/管理 action 的分发过程/顺序

#### redux-thunk

- 需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据
- 我需要全程跟踪/管理 action 的分发过程/顺序
- **我需要组件对同步或异步的 action 无感，调用异步 action 时不需要显式地传入 dispatch**

#### redux-saga

- 我需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据
- 我需要全程跟踪/管理 action 的分发过程/顺序
- 我需要组件对同步或异步的 action 无感，调用异步 action 时不需要显式地传入 dispatch
- **我需要声明式地来表述复杂异步数据流（如长流程表单，请求失败后重试等），命令式的 thunk 对于复杂异步数据流的表现力有限**

### saga这个命名怎么来的

&emsp;&emsp;科学上网后的回答解释是`redux-saga`的`saga`这一命名其实来源于后端的概念，在后端领域中`saga`描述的是一个处理分布式事务的概念，而在`redux-saga`中则变成了一个流程管理（process manager）一样的概念。

&emsp;&emsp;[传送链接🔗](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34623840#34623840), 原文其实讨论的是一个为什么我们要在Redux下整那么多异步中间件的话题讨论，下面的回答都非常专业及具有指导意义，推荐阅读。

### redux-saga初体验（伪）

&emsp;&emsp;严格来说，我并不是初次接触`redux-saga`（的语法），曾经做过的一个后台管理系统用的是阿里的dva全家桶搭建的，他们内部集成的状态管理就是封装的saga的东西。不过那个时候，只是一个单纯的，它提供的是这个方法，我就用它的脑回路。自身没有一个系统性的考量，为什么用它，仅是因为就当时而言比较新？现在review回过去的代码，其实也发现当时并没有使用到任何`redux-saga`真正具有优势的东西，也就是跟着以前的`redux-thunk`照猫画虎的简单替换了一下。

&emsp;&emsp;回到正题，学习一门库的最快方式肯定是去官方文档查阅，基本上成熟的库的官方都会集成完成的使用api说明和提供给接触者的demo。

&emsp;&emsp;官方提供了一个初学者使用的简易计数demo，我们可以通过下面的方式拉取测试。PS,完整功能在sagas分支上，默认启动在9966端口。

```javascript
git clone https://github.com/redux-saga/redux-saga-beginner-tutorial.git
git checkout -t origin/sagas
npm i 
npm run start
打开 localhost:9966
```