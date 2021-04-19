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
- `actions`符合`FSA`标准，即返回的都是一个纯对象(Plain Object)

#### redux-thunk

- 需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据
- 我需要全程跟踪/管理 action 的分发过程/顺序
- **我需要组件对同步或异步的 action 无感，调用异步 action 时不需要显式地传入 dispatch**

#### redux-saga

- 我需要一个全局数据源且其他组件可以直接获取/改变全局数据源中的数据
- 我需要全程跟踪/管理 action 的分发过程/顺序
- 我需要组件对同步或异步的 action 无感，调用异步 action 时不需要显式地传入 dispatch
- **我需要声明式地来表述复杂异步数据流（如长流程表单，请求失败后重试等），命令式的 thunk 对于复杂异步数据流的表现力有限**
- 在`redux-saga/effects`下导出的诸如`take`、`call`、`fork`这些`api`实际上返回的就是一个纯对象，通过`yield`，中间件可以拿到这个副作用的描述并执行对应动作
- `select`类似于直接从`store`映射出制定`key`的状态，`yield select(state => state.id)`

&emsp;&emsp;另外既然是`generator`实现的同步编程异步场景方案，那副作用提供的方法其实相互直接的差异主要在于是否会**阻塞`saga`**。

```javascript
const effect = call(ajax.get, '/userLogin')
// {
//   CALL: {
//     context: null,
//     args: ['/userLogin'],
//     fn: ajax.get
//   }
// }
```

&emsp;&emsp;就拿`call`和`fork`来说，`call`会阻塞当前`saga`执行，直到被调用函数`fn`返回结果，才会执行下一步代码；而`fork`不会阻塞，它会直接返回对应的副作用描述对象。

&emsp;&emsp;`fork`**异步非阻塞特性**更适合在后台运行不影响主流程的代码，

&emsp;&emsp;当然`saga`还有个比较有意思也同样重要的概念：`父子关系`。准确来说，正常嵌套的`task`间会存在父子关系：

```javascript
function* rootSaga() {
  yield fork(saga1)
  yield fork(saga2)
  yield fork(saga3)
}

sagaMiddleware.run(rootSaga)
```

&emsp;&emsp;如果其中有一个`saga`子任务抛出错误了，如`throw new Error('')`这种，那就会导致整个应用无法使用。

&emsp;&emsp;要改进这种场景，就需要将`fork`替换为`spawn`，区别在于后者返回的是一个独立(isolate)任务，不存在父子关系，不会影响父级及嵌套的其他任务正常执行：

```javascript
function* rootSaga() {
  yield spawn(saga1)
  yield spawn(saga2)
  yield spawn(saga3)
}
```

&emsp;&emsp;*当然这样的做法，除了刷新页面无法恢复出问题的`saga`正常运作，所以我们须要一个更好的重试机制：*

```javascript
function* rootSaga() {
  const sagas = [saga1, saga2, saga3]
  yield sagas.map(item => spawn(function* () {
    while (true) {
      try {
        yield call(saga)
      } catch(e) {
        console.log(e)
      }
    }
  }))
}
```

#### dva

- dva是支付宝团队`redux`最佳实践的一个落地方案，它是一个`framework`，我们按照它的设定，**在一个文件下**进行统一副作用处理、事件分发
- 上述的异步处理方案中，我们都发现了一个问题，正如sorrycc所言：*概念太多，并且 reducer, saga, action 都是分离的（分文件）；编辑成本高，需要在 reducer, saga, action 之间来回切换；不便于组织业务模型 (或者叫 domain model) 。比如我们写了一个 userlist 之后，要写一个 productlist，需要复制很多文件。*
- 底层还是saga那一套
### saga这个命名怎么来的

&emsp;&emsp;科学上网后的回答解释是`redux-saga`的`saga`这一命名其实来源于后端的概念，在后端领域中`saga`描述的是一个处理分布式事务的概念，而在`redux-saga`中则变成了一个流程管理（process manager）一样的概念。

&emsp;&emsp;[传送链接🔗](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34623840#34623840), 原文其实讨论的是一个为什么我们要在Redux下整那么多异步中间件的话题讨论，下面的回答都非常专业及具有指导意义，推荐阅读。

### 副作用

&emsp;&emsp;根据Wikipedia的解释，在js世界中，副作用（Side Effects）通常指接口数据请求、读取浏览器本地缓存（Local Storage、Cookie）等。

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