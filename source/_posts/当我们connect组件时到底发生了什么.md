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

## 组件

![](comp.jpg)

&emsp;&emsp;可以看到`react-redux`在组件目录下仅有3个文件，`Context.js`最简单，就是导出通过Context API初始化一个`Context`对象并导出。我们主要看`Provider.js`和`connectAdvanced`做了些什么。


### Provider.js

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

### connectAdvanced.js

&emsp;&emsp;这个文件代码内容就比较多了...494行，慢慢看其实也不复杂，先折叠代码看下整体结构：

![](advancedCon.jpg)

&emsp;&emsp;先从头部导入的内容来说，像那些工具类校验方法的我们就跳过了，这里简单聊一下`hoist-non-react-statics`和`useIsomorphicLayoutEffect`。

#### hoist-non-react-statics

&emsp;&emsp;首先，这是一个进行静态方法拷贝的工具库。主要应用在我们进行HOC高阶组件封装的场景。因为当我们进行HOC设计时，被增强的内部函数上绑定的静态方法是无法被映射到增加后的函数上的，这需要我们手动拷贝。拿官方的例子来说：

```javascript
// Define a static method
WrappedComponent.staticMethod = function() {/*...*/}
// Now apply a HOC
const EnhancedComponent = enhance(WrappedComponent);

// The enhanced component has no static method
typeof EnhancedComponent.staticMethod === 'undefined' // true
```

&emsp;&emsp;我们自己要去重新绑定的话，就会出现类似下面这样的方式：

```javascript
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  // Must know exactly which method(s) to copy :(
  Enhance.staticMethod = WrappedComponent.staticMethod;
  return Enhance;
}
```

&emsp;&emsp;但是一个React组件上绑定的静态属性还是比较多的，不同类型间还需要区分。目前社区中其实已经有比较成熟的库做了这件事，就是`hoist-non-react-statics`，通过该库，我们可以比较容易的通过设置我们返回的高阶函数组件`targetComponent`以及需要拷贝的源函数组件`sourceComponent`进行静态内容拷贝(若是有不想拷贝的静态方法，也可以传第三个可选参数，进行过滤表设置)。

```javascript
// official usage
import hoistNonReactStatics from 'hoist-non-react-statics';

hoistNonReactStatics(targetComponent, sourceComponent);

hoistNonReactStatics(targetComponent, sourceComponent, { myStatic: true, myOtherStatic: true });

// react documents usage
import hoistNonReactStatic from 'hoist-non-react-statics';
function enhance(WrappedComponent) {
  class Enhance extends React.Component {/*...*/}
  hoistNonReactStatic(Enhance, WrappedComponent);
  return Enhance;
}
```

### useIsomorphicLayoutEffect

&emsp;&emsp;其实这个方法就是一个使用`useEffect`还是`useLayoutEffect`的问题，两者的差别主要是执行时机上的，前者异步发生在`Render`阶段，后者同步发生在`Commit`阶段。而根据这个方法的`isomorphic`我们也知道这其实是一个兼容同构的api。从源码的判断和注释也可以分析出来，另外在`react-native`中和`node`一样也是直接使用`useLayoutEffect`。

```javascript
// useIsomorphicLayoutEffect.native.js
import { useLayoutEffect } from 'react'

// Under React Native, we know that we always want to use useLayoutEffect

export const useIsomorphicLayoutEffect = useLayoutEffect

// useIsomorphicLayoutEffect.js
import { useEffect, useLayoutEffect } from 'react'

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect
```

#### 庖丁解牛

&emsp;&emsp;了解了上述内容后，我们继续源码的阅读，先看折叠的第13行，发现其实是一个将组件字符串化的方法，目的是为了后面校验高阶函数入参是否符合标准`React`元素，如果不符合会抛出一个`Error`字符串，将我们传入的组件信息以字符串格式输出。了解后，发现没什么营养，继续往后面看第21行。

##### storeStateUpdatesReducer

```javascript
function storeStateUpdatesReducer(state, action) {
  const [, updateCount] = state
  return [action.payload, updateCount + 1]
}
```

&emsp;&emsp;`storeStateUpdatesReducer`方法实际上是后面React Hooks`useReducer`的第一个入参。

```javascript
const EMPTY_ARRAY = []
const initStateUpdates = () => [null, 0]
const [
[previousStateUpdateResult],
forceComponentUpdateDispatch,
] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)
```

&emsp;&emsp;结合前后文，我们可以发现这个`useReducer`真实目的就是为了获取一个`dispatch`执行句柄，便于后续`store`状态更新后，子组件的`rerender`。

##### useIsomorphicLayoutEffectWithArgs

&emsp;&emsp;下面的`useIsomorphicLayoutEffectWithArgs`也比较简单，它是将前文我们提到的`useIsomorphicLayoutEffect`进行了一个工厂化处理，支持传入这个hook需要的函数、函数需要的入参以及重新触发函数的依赖。

```javascript
function useIsomorphicLayoutEffectWithArgs(
  effectFunc,
  effectArgs,
  dependencies
) {
  useIsomorphicLayoutEffect(() => effectFunc(...effectArgs), dependencies)
}
```

##### captureWrapperProps

&emsp;&emsp;`captureWrapperProps`这个方法实际上是用在后面HOC函数`wrapWithConnect`中的一个hook回调，每当这个高阶组件重新渲染时，`captureWrapperProps`就会被重新执行：

```javascript
function captureWrapperProps(
  lastWrapperProps,
  lastChildProps,
  renderIsScheduled,
  wrapperProps,
  actualChildProps,
  childPropsFromStoreUpdate,
  notifyNestedSubs
) {
  // We want to capture the wrapper props and child props we used for later comparisons
  lastWrapperProps.current = wrapperProps
  lastChildProps.current = actualChildProps
  renderIsScheduled.current = false

  // If the render was from a store update, clear out that reference and cascade the subscriber update
  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null
    notifyNestedSubs()
  }
}
```

&emsp;&emsp;从`captureWrapperProps`内部的使用来说，我们可以很容易发现`lastWrapperProps`、`lastChildProps`、`renderIsScheduled`、`childPropsFromStoreUpdate`都是通过`useRef`进行黑盒状态保存的。其中的值不会被`rerender`所改变。代码块干的事情主要为：


1. 在每次`render`中更新最新的我们导出HOC的入参`props`，实际上它是解构后的属性，第一个入参是操作当前节点的`ref`：

```javascript
      const [
        propsContext,
        reactReduxForwardedRef,
        wrapperProps,
      ] = useMemo(() => {
        // Distinguish between actual "data" props that were passed to the wrapper component,
        // and values needed to control behavior (forwarded refs, alternate context instances).
        // To maintain the wrapperProps object reference, memoize this destructuring.
        const { reactReduxForwardedRef, ...wrapperProps } = props
        return [props.context, reactReduxForwardedRef, wrapperProps]
      }, [props])
```

2. 在每次`render`中更新最新的返回函数的`props`
3. 标记正在进行`render`
4. **如果发现是由`store`更新引起的`rerender`，通知所有子订阅节点进行更新**

##### subscribeUpdates

&emsp;&emsp;`subscribeUpdates`同样在`wrapWithConnect`的一个hook回调中，不过它只有在它的`deps`即`[store, subscription, childPropsSelector]`改变后才重新触发。

```javascript
function subscribeUpdates(
  shouldHandleStateChanges,
  store,
  subscription,
  childPropsSelector,
  lastWrapperProps,
  lastChildProps,
  renderIsScheduled,
  childPropsFromStoreUpdate,
  notifyNestedSubs,
  forceComponentUpdateDispatch
) {
  // If we're not subscribed to the store, nothing to do here
  if (!shouldHandleStateChanges) return

  // Capture values for checking if and when this component unmounts
  let didUnsubscribe = false
  let lastThrownError = null

  // We'll run this callback every time a store subscription update propagates to this component
  const checkForUpdates = () => {
    if (didUnsubscribe) {
      // Don't run stale listeners.
      // Redux doesn't guarantee unsubscriptions happen until next dispatch.
      return
    }

    const latestStoreState = store.getState()

    let newChildProps, error
    try {
      // Actually run the selector with the most recent store state and wrapper props
      // to determine what the child props should be
      newChildProps = childPropsSelector(
        latestStoreState,
        lastWrapperProps.current
      )
    } catch (e) {
      error = e
      lastThrownError = e
    }

    if (!error) {
      lastThrownError = null
    }

    // If the child props haven't changed, nothing to do here - cascade the subscription update
    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs()
      }
    } else {
      // Save references to the new child props.  Note that we track the "child props from store update"
      // as a ref instead of a useState/useReducer because we need a way to determine if that value has
      // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
      // forcing another re-render, which we don't want.
      lastChildProps.current = newChildProps
      childPropsFromStoreUpdate.current = newChildProps
      renderIsScheduled.current = true

      // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render
      forceComponentUpdateDispatch({
        type: 'STORE_UPDATED',
        payload: {
          error,
        },
      })
    }
  }

  // Actually subscribe to the nearest connected ancestor (or store)
  subscription.onStateChange = checkForUpdates
  subscription.trySubscribe()

  // Pull data from the store after first render in case the store has
  // changed since we began.
  checkForUpdates()

  const unsubscribeWrapper = () => {
    didUnsubscribe = true
    subscription.tryUnsubscribe()
    subscription.onStateChange = null

    if (lastThrownError) {
      // It's possible that we caught an error due to a bad mapState function, but the
      // parent re-rendered without this component and we're about to unmount.
      // This shouldn't happen as long as we do top-down subscriptions correctly, but
      // if we ever do those wrong, this throw will surface the error in our tests.
      // In that case, throw the error from here so it doesn't get lost.
      throw lastThrownError
    }
  }

  return unsubscribeWrapper
}
```

&emsp;&emsp;内容比较多，我们一点点看：

1. 首先有个标记变量`shouldHandleStateChanges`用于判断我们是否需要处理该回调，而该参数我们没配置`connectOptions`时，默认情况为`true`。
2. 通过`didUnsubscribe`和`lastThrownError`进行组件是否卸载以及是否抛出异常的记录。
3. `checkForUpdates`是挂载给消息订阅实例`subscription`的`onStateChange`方法上的。在该方法内:
- 首先判断了当前组件是否已卸载，卸载了就直接`return`否则会继续执行，否则根据最近`store`状态进行`selector`，得到最新的孩子`props`。
- 如果最新的孩子属性和之前的相同，则进行级联的子节点订阅器消息通讯（本质上是一个链表结构，后文会看），否则会更新组件内部的`ref`快照属性`lastChildProps`、`childPropsFromStoreUpdate`、`renderIsScheduled`。
- 此时确认属性确实发生了更新，会调用前文我们说的`dispatch`句柄，进行当前组件的`rerender`。
- 至于为什么会`rerender`，因为这个`useReducer`返回的更新内容作为了`actualChildProps`的`deps`，而`actualChildProps`又作为了我们最终返回渲染元素的`deps`。

```javascript
      const actualChildProps = usePureOnlyMemo(() => {
        // Tricky logic here:
        // - This render may have been triggered by a Redux store update that produced new child props
        // - However, we may have gotten new wrapper props after that
        // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
        // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
        // So, we'll use the child props from store update only if the wrapper props are the same as last time.
        if (
          childPropsFromStoreUpdate.current &&
          wrapperProps === lastWrapperProps.current
        ) {
          return childPropsFromStoreUpdate.current
        }

        // TODO We're reading the store directly in render() here. Bad idea?
        // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
        // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
        // to determine what the child props should be.
        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])
```

```javascript
      // Now that all that's done, we can finally try to actually render the child component.
      // We memoize the elements for the rendered child component as an optimization.
      const renderedWrappedComponent = useMemo(
        () => (
          <WrappedComponent
            {...actualChildProps}
            ref={reactReduxForwardedRef}
          />
        ),
        [reactReduxForwardedRef, WrappedComponent, actualChildProps]
      )

      // If React sees the exact same element reference as last time, it bails out of re-rendering
      // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.
      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {
          // If this component is subscribed to store updates, we need to pass its own
          // subscription instance down to our descendants. That means rendering the same
          // Context instance, and putting a different value into the context.
          return (
            <ContextToUse.Provider value={overriddenContextValue}>
              {renderedWrappedComponent}
            </ContextToUse.Provider>
          )
        }

        return renderedWrappedComponent
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue])

      return renderedChild
```

##### connectAdvanced

&emsp;&emsp;终于回到正主了...首先`connectAdvanced`接收两个入参`selectorFactory`和`connectOptions`。

###### selectorFactory

&emsp;&emsp;`selectorFactory`实际上内容存在于`src/connect/selectorFactory.js`中，此处我们简单说下是做什么的，其实`react-redux`作者也在源码中提供了注释：**返回了一个提供了从新`state`、`props`、`dispatch`变化中计算新`props`能力的函数**。

###### connectOptions

&emsp;&emsp;`connectOptions`主要是一些对于该`connect`生成函数的配置项：

- 计算生成获取HOC函数名的`getDisplayName`方法。
- HOC的方法名`methodName`，默认值为`connectAdvanced`。
- `renderCountProp`，结合`react devtools`分析是否有冗余的`render`，默认值为`undefined`。
- `shouldHandleStateChanges`，决定当前HOC是否订阅`store`变化，默认值为`true`。
- `storeKey`，`props`和`context`通过该`key`值可以访问`store`，默认值为`store`。
- `withRef`，旧版本的`react`通过`refs`访问，默认值为`false`。
- `forwardRef`，通过`react`的`forwardRef`API暴露`ref`，默认值为`false`。
- `context`，Context API消费者使用的`context`，默认值为前文我们生成的`ReactReduxContext`。

###### ConnectFunction

&emsp;&emsp;代码主体内容，其实可以分为三部分：

1. 传参校验
2. **主体`ConnectFunction`方法实现**
3. HOC恢复处理（`displayName`及静态属性复制等）

&emsp;&emsp;1，3其实没什么好说的，我们主要看`ConnectFunction`做了什么：

1. 提取传入的`context`属性，因为除了`react-redux`本身自定义初始化的属性外，用户自己也可能会传一个自定义的。获取`ref`，及其余`props`。
2. 根据真实获取到的`context`进行后续判断使用。
3. 判断`store`属性是否存在，会从`props`和`context`中尝试读取，若没有则抛出异常。
4. `childPropsSelector`每次会在`store`更新后重新生成一个`selector`方法供相关取其作`deps`的钩子进行新`props`映射。
5. **`subscription`订阅构成链式**。

&emsp;&emsp;5中的`subscription`订阅器构造链表结构我认为是`connect`步骤中最核心的一步，没有它我们就无法完成整个状态树的更新。先看代码：

```javascript
      const [subscription, notifyNestedSubs] = useMemo(() => {
		// const NO_SUBSCRIPTION_ARRAY = [null, null]
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY

        // This Subscription's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        const subscription = new Subscription(
          store,
          didStoreComeFromProps ? null : contextValue.subscription
        )

        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `subscription` will then be null. This can
        // probably be avoided if Subscription's listeners logic is changed to not call listeners
        // that have been unsubscribed in the  middle of the notification loop.
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(
          subscription
        )

        return [subscription, notifyNestedSubs]
      }, [store, didStoreComeFromProps, contextValue])
```

&emsp;&emsp;`shouldHandleStateChanges`这个控制是否订阅的标记，实际上就是对齐了我们`connect`组件时，如果仅是为了使用其`dispatch`的能力，而不需要订阅`store`中的值进行`rerender`的：

```javascript
    return connectHOC(selectorFactory, {
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: (name) => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      // any extra options args can override defaults of connect or connectAdvanced
      ...extraOptions,
    })
```

&emsp;&emsp;核心就是看你有没有配置`mapStateToProps`，所以我们平时使用要注意场景，无需订阅的，传`null`就行。

```javascript
export default connect(null, {
	// 绑定dispatch
})(App)
```

&emsp;&emsp;之后就是根据`store`, `didStoreComeFromProps`, `contextValue`这些`deps`进行`subscription`实例的重新构造，其中有一个判断主要是**区分`store`是从`props`数据源来的还是`context`中获取的。**然后提取实例方法`notifyNestedSubs`绑定当前实例上下文，返回`tuple`供后续的钩子使用。这里的钩子就是指前文中我们聊过的进行`subscribeUpdates`回调的钩子，在里面会重新发起`trySubscribe`订阅。

&emsp;&emsp;要了解`subscription`是怎么产生关联的我们就要分析`Subscription.js`文件了。

### Subscription.js

&emsp;&emsp;`Subscription.js`主要由两部分组成，一个是链表结构生成器，里面提供了基本的清空、通知调用、获取所有订阅内容以及订阅和取消订阅的方法。另外一部分就是暴露出去的`Subscription`类，用于前者的调度操作。

#### createListenerCollection

&emsp;&emsp;该函数中实际上只有`notify`和`subscribe`方法值得我们留意一下：

```javascript
	const batch = getBatch()
	let first = null
	let last = null

    notify() {
      batch(() => {
        let listener = first
        while (listener) {
          listener.callback()
          listener = listener.next
        }
      })
    },
    subscribe(callback) {
      let isSubscribed = true

      let listener = (last = {
        callback,
        next: null,
        prev: last,
      })

      if (listener.prev) {
        listener.prev.next = listener
      } else {
        first = listener
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return
        isSubscribed = false

        if (listener.next) {
          listener.next.prev = listener.prev
        } else {
          last = listener.prev
        }
        if (listener.prev) {
          listener.prev.next = listener.next
        } else {
          first = listener.next
        }
      }
    },
```

&emsp;&emsp;`notify`其实很简单，就是从头指针，遍历整个链表，执行所有回调。`subscribe`则进行一个`listener`实体的构造，由`prev`、`next`和`callback`组成，是我们消息订阅节点的基本结构。另外它最终会返回一个取消当前节点订阅的句柄方法，供我们使用。细节结合`Subscription`看会更清晰。

#### Subscription

&emsp;&emsp;`Subscription`要理解其实要分初始化，及和后代子节点建立关联的情景来看：

```javascript
export default class Subscription {
  constructor(store, parentSub) {
    this.store = store
    this.parentSub = parentSub
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }

  notifyNestedSubs() {
    this.listeners.notify()
  }

  handleChangeWrapper() {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)

      this.listeners = createListenerCollection()
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}
```

&emsp;&emsp;构造函数中主要是传入最新的`store`内容及上一个订阅器节点`parentSub`。核心代码主要是`trySubscribe`方法，它做了这么几件事：

1. 当该`subscription`实例未订阅时（通常都是初始化情况，也有可能被手动取消了订阅），判断是否有`parentSub`传入，即确认下是否为根订阅器。
2. 如果是根订阅器，则我们直接使用`react-redux`的`store`自带的`subscribe`方法进行订阅，这个方法会在`store`内容改变时进行回调。同样这个`store`自带的订阅方式也会返回一个移除监听的句柄。
3. 如果非根订阅器，就会走我们的`createListenerCollection`构造的链表节点的`subscribe`订阅方法，同样也会拿到取消订阅的句柄。这里要注意的是，如果存在父订阅器传入，实际上是在父订阅器上添加`callback`。

&emsp;&emsp;看到这里，实际上`connect`要了解的代码也看得差不多了，我的疑惑是，我们不同组件的`connect`是如何关联到一起的呢？下面细品一下：

1. HOC中通过`useMemo`获取一个`[subscription, notifyNestedSubs]`的tuple。每次`deps`更新，其中的实例和方法会重新生成和绑定。
2. 同样通过`useMemo`计算一个能够重载更新的`context`值，功能主要是为了将1中生成的`subscription`作为`context`值关联进去：

```javascript
      // Determine what {store, subscription} value should be put into nested context, if necessary,
      // and memoize that value to avoid unnecessary context updates.
      const overriddenContextValue = useMemo(() => {
        if (didStoreComeFromProps) {
          // This component is directly subscribed to a store from props.
          // We don't want descendants reading from this store - pass down whatever
          // the existing context value is from the nearest connected ancestor.
          return contextValue
        }

        // Otherwise, put this component's subscription instance into context, so that
        // connected descendants won't update until after this component is done
        return {
          ...contextValue,
          subscription,
        }
      }, [didStoreComeFromProps, contextValue, subscription])

```

3. 这个新的`context`值`overriddenContextValue`会被我们最终`connect`的组件所访问：

```javascript
      // If React sees the exact same element reference as last time, it bails out of re-rendering
      // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.
      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {
          // If this component is subscribed to store updates, we need to pass its own
          // subscription instance down to our descendants. That means rendering the same
          // Context instance, and putting a different value into the context.
          return (
            <ContextToUse.Provider value={overriddenContextValue}>
              {renderedWrappedComponent}
            </ContextToUse.Provider>
          )
        }

        return renderedWrappedComponent
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue])

      return renderedChild
```

4.  `contextValue`通过源码分析，我们可以得到它本质上是生成后的HOC传下来的属性`props.context`。这里有同学就表示很迷惑了，我们不是只是`connect`一个组件嘛，哪里传了这玩意？我们先按下不表，往后看。

5. 前文中我们知道在实体方法`ConnectFunction`中还进行了`subscription`的更新。`subscribeUpdates`回调中进行了订阅器`subscription`上的`listeners`链表节点的`callback`更新。这个`callback`做了什么呢？如果传入`connect`组件的属性没有发生改变，会使用1中的`notifyNestedSubs`，将链表上的`callback`依次执行。否则就会更新属性并进行当前组件的`rerender`。另外它除了绑定在当前`subscription`的`listeners`上外，钩子触发时，也会拉取一次，**目的是在首次`render`后拉取一次，以防这之间`store`发生了改变。**

6. 在阅读源码的过程中我发现了一个干扰因素，实际上就是`context`的入参问题，我们使用`react-redux`时，显少会直接将`context`作为`props`往下传，所以内部的`context`均视作`ReactReduxContext`会使逻辑更为清晰。

7. 事实上，作为项目入口顶层的`Provider`已经将`store`和根`subscription`配置到了`context`内，即我们组件内的`useContext`可以直接读取，加以操作。

```javascript
// 通常项目入口
import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import BasicLayout from '@/layouts/BasicLayout';
import { BrowserRouter as Router } from 'react-router-dom';

let App = () => {
	return (
		<Provider store={store}>
			<Router>
				<BasicLayout />
			</Router>
		</Provider>
	)
}

export default App;

// react-redux中的Provider

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

  useIsomorphicLayoutEffect(() => {
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

8. 综上，我们发现实际上进行`connect`的组件，内部是一个独立的`subscription`。并且其中的链表结构是为了处理多个HOC`connect`组件嵌套的消息同步的：

```javascript
<RootProvider>
	<HOCConnA>
		<HOCConnB>
		</HOCConnB>
	</HOCConnA>
</RootProvider>
```