---
title: 当我们connect组件时到底发生了什么
date: 2021-05-04 15:49:47
tags:
  - react
  - react-redux
---

&emsp;&emsp;使用`redux`进行状态控制的同学对`connect`肯定都不陌生了，我们都知道通过`connect`可以将`store`中的状态绑定到当前组件的`props`上，其中涉及到一些`Context API`的使用，但是究竟是什么触发了我们绑定组件的rerender呢，这个执行时机底层是怎么处理的呢，这成为了本文的研究主题。

<escape><!-- more --></escape>

&emsp;&emsp;本文主要进行`react-redux`源码阅读，基于`7.2.2`版本。

### 组件

![](comp.jpg)

&emsp;&emsp;可以看到`react-redux`在组件目录下仅有3个文件，`Context.js`最简单，就是导出通过Context API初始化一个`Context`对象并导出。我们主要看`Provider.js`和`connectAdvanced`做了些什么。


#### Provider.js

```javascript
function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription,
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
```

&emsp;&emsp;可以看到当前版本下封装的`Provider`组件是基于Hooks构造的，主要做了几件事情：

1. 通过`useMemo`检测`store`是否产生变化，返回一个记忆值对象，它由新的`store`以及对新`store`进行订阅的`subscription`实例组成，其中有一个将`notifyNestedSubs`属性赋值给`onStateChange`的动作，我们后文会分析为什么（`subscription`由`Subscription`构造生成，后文会分析该构造函数，这里可以简单理解成是一个发布订阅模式的实现）。
2. 通过`useMemo`检测`store`是否产生变化，记录变化前的`store`的`state`。
3. 取1，2的记忆值作`deps`，在`useEffect`中进行发布订阅的控制，此处能看到的逻辑是，初始化会对消息订阅器（`subscription`）进行初始订阅，之后当`store`的状态发生改变后，**通知子孙订阅节点（`notifyNestedSubs`）**。后文会集中分析`Subscription`内部实现。

#### connectAdvanced.js

&emsp;&emsp;这个文件代码内容就比较多了...494行，慢慢看其实也不复杂，先折叠代码看下整体结构：

![](advancedCon.jpg)

&emsp;&emsp;先从头部导入的内容来说，像那些工具类校验方法的我们就跳过了，这里简单聊一下`hoist-non-react-statics`和`useIsomorphicLayoutEffect`。

##### hoist-non-react-statics

