---
title: 浅析lodash中的throttle与debounce
date: 2021-05-29 22:52:47
tags:
  - lodash
  - throttle
  - debounce
---

&emsp;&emsp;`lodash`中的`throttle`函数比较有意思，观察源码，会发现它本质是调用了一次`debounce`实现的返回结果。并且该结果上还有`cancel`和`flush`两个方法可以使用。它们分别对应**取消**及**立即调用**该`debounce`方法。

<escape><!-- more --></escape>

&emsp;&emsp;那我们先从`debounce`看起，我们知道`lodash`中`debounce`入参的`options`支持`leading`和`trailing`两种模式（默认不配置情况下，`leading`为`false`，`trailing`为`true`）。前者表明我们试图让这个被`debounce`处理过的函数在定时器生效时，第一次就触发。后者就是我们传统理解上的当多次触发时，以最后一次触发为延后响应，常见场景如**移动端窗口变化触发的`resize`**、**输入框输入的搜索场景，触发`ajax`**。

&emsp;&emsp;所以一般我们自己实现的`debounce`就是`lodash`中默认配置入参模式下的`debounce`：

```javascript
 function debounce(fn, wait = 400) {
     let timer;
     return function(...args) {
        let _this = this;
        clearTimeout(timer);
        timer = setTimeout(fn.bind(_this, ...args), wait);
     }
 }
```

&emsp;&emsp;表现效果就如下，上面一行表明我们触发的响应事件频率，下面一行表明真正函数被执行的时机。
&emsp;&emsp;P.S. 相关图片引用外网这篇[《Debouncing and Throttling Explained Through Examples》](https://css-tricks.com/debouncing-throttling-explained-examples/)。

![](demo1.png)

&emsp;&emsp;上述的表现就是`lodash`中的`trailing`模式，即**对后回调进行防抖处理**。

&emsp;&emsp;那`leading`模式又是什么？

&emsp;&emsp;在`lodash`中，当我们配置`leading`为`true`，`trailing`为`false`，就会有下面的表现。

![](demo2.png)

&emsp;&emsp;可以看到`leading`模式下，同样具有防抖的机制，但是它的时机提前了，在每次触发开始就会执行（前提是已经超过了这个`wait`时长）。

&emsp;&emsp;我们不妨自己思考下`leading`如何实现，既然要让函数在最初执行，那我们就不能把执行的函数放到定时器里面，但是又需要保证这个防抖的机制怎么办呢？我的答案是设置一个哨兵变量进行是否立刻执行的判断并将哨兵变量放到防抖的定时里面去操作，结合闭包访问的能力，就能达到该效果，代码如下：

```javascript
function debounceWithLeadingOpt(fn, wait = 400) {
  let shouldInovke = true, timer = null
  return function(...args) {
    let _this = this
    if (shouldInvoke) {
      fn.apply(_this, args)
      shouldInvoke = false
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      shouldInvoke = true
    }, wait)
  }
}
```

&emsp;&emsp;下面我们不妨看看源码是怎么做的：

```javascript
function debounced(...args) {
  const time = Date.now()
  const isInvoking = shouldInvoke(time)

  lastArgs = args
  lastThis = this
  lastCallTime = time

  if (isInvoking) {
    if (timerId === undefined) {
      return leadingEdge(lastCallTime)
    }
    if (maxing) {
      // Handle invocations in a tight loop.
      timerId = startTimer(timerExpired, wait)
      return invokeFunc(lastCallTime)
    }
  }
  if (timerId === undefined) {
    timerId = startTimer(timerExpired, wait)
  }
  return result
}
```

&emsp;&emsp;我们对大体结构进行解读，函数内部做了几件事：

1. 获取当前时间，判断是否函数正在调用过程中
2. 如果正在调用中，判断是否存在定时器，不存在则会通过`leadingEdge`进行`lastInvokeTime`的更新和定时器生成。该方法内，在我们的`leading`配置打开的场景下，会通过`invokeFunc`立即执行我们要调用的函数，并更新对应的时间`lastInvokeTime`。
3. 存在定时器，则我们会先通过判断`maxing`变量判断是否用户在`options`中配置了`maxWait`，如果配置了，会生成一个定时器去执行`timerExpired`。然后立即执行`invokeFunc`调用函数。
4. 如果不在调用中，且没有定时器，则初始化定时器。

&emsp;&emsp;参数初始化：

```javascript
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true
```

&emsp;&emsp;下面一个个看过来，先看`shouldInvoke`：

```javascript
function shouldInvoke(time) {
  const timeSinceLastCall = time - lastCallTime
  const timeSinceLastInvoke = time - lastInvokeTime

  // lastCallTime 初始生成即 undefined，所以该方法首次调用就会 return true 进入立即执行判断中
  // lastCallTime在首次调用后才会开始赋值 并且在首次调用中由于短路判断 不会走到第二个判断语句中
  // timeSinceLastCall大于我们设置的等待时间好理解，小于0这个判断可以理解为我们宿主环境的系统时间被往前修改了，就会出现小于0的情况，此时也应当立即执行
  // 最后的判断是指是否满足最后invoke时间达到我们设置的最大等待时长
  return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
    (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
}
```

&emsp;&emsp;我们发现其中涉及到两个记录内部时间的变量，`lastCallTime`和`lastInvokeTime`，它们分别记录了上一次`debounced`函数调用时间和`invokeFunc`函数调用时间。

&emsp;&emsp;该函数返回一个`boolean`，用于判断是否进行我们函数的`invoke`。

&emsp;&emsp;下面看看`leadingEdge`：

```javascript
function leadingEdge(time) {
  lastInvokeTime = time
  // 设置trailing模式的定时器
  timerId = startTimer(timerExpired, wait)
  // 如果设置了leading模式，直接返回函数执行结果
  return leading ? invokeFunc(time) : result
}
```

&emsp;&emsp;执行包装的目标函数`invokeFunc`，并记录相关时间：

```javascript
function invokeFunc(time) {
  const args = lastArgs
  const thisArg = lastThis

  lastArgs = lastThis = undefined
  lastInvokeTime = time
  result = func.apply(thisArg, args)
  return result
}
```

&emsp;&emsp;设置`trailing`模式下的定时器任务函数`startTimer`：

```javascript
// 在没有传wait的时候 使用rAF进行定时器处理 可以简单理解为16ms的setTimeout 只不过由浏览器接管 严格按照浏览器的frame去回调
const useRAF = (!wait &&  wait !== 0 && typeof root.requestAnimationFrame === 'function')

function startTimer(pendingFunc, wait) {
  if (useRAF) {
    root.cancelAnimationFrame(timerId)
    return root.requestAnimationFrame(pendingFunc)
  }
  return setTimeout(pendingFunc, wait)
}
```

&emsp;&emsp;`trailing`模式设置的定时回调`timerExpired`：

```javascript
// 计算剩余时长
function remainingWait(time) {
  const timeSinceLastCall = time - lastCallTime
  const timeSinceLastInvoke = time - lastInvokeTime
  const timeWaiting = wait - timeSinceLastCall

  return maxing
    ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
    : timeWaiting
}

function timerExpired() {
  const time = Date.now()
  if (shouldInvoke(time)) {
    // 如果已经达到wait，直接执行
    return trailingEdge(time)
  }
  // 重置trailing模式的定时
  timerId = startTimer(timerExpired, remainingWait(time))
}
```

&emsp;&emsp;`trailing`时机触发时，执行对应包装目标函数：

```javascript
  // 该方法比较关键，它并不代表在trailing时机去执行我们的函数
  // 而是说在这个时机会去清空我们之前的定时器以及上一次的入参和上下文
  function trailingEdge(time) {
    timerId = undefined

    // 该方法仅在trailing模式开启情况下调用
    // 且该方法至少须要保证在debounced调用一次的情况下执行
    // 所以判断方式中使用了lastArgs来判断，因为该值仅在debounced中赋值
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }
```

&emsp;&emsp;源码中的处理涉及到的环节比较多，因为其中包含了`leading`及`trailing`双模式。两者都有共同的处理流程。

&emsp;&emsp;如果只看`leading`模式，并且不走`trailing`触发，会有下面这样的流程（本质上我们外层消费的是返回出的`debounced`函数）：

![](leading.jpg)

&emsp;&emsp;根据流程图可以发现`leading`有两个前置判断，除了定时器还会多做一层执行时机的计算判断。并且这个定时器会在后续的流程中进行更新和清空。总体而言比我们实现的要复杂不少，当然其兼容了两种模式，并且很多通道都可以复用，多也是正常的。

&emsp;&emsp;下面我们瞅瞅`throttle`，它从源码上分析其实就是同时启用`leading`、`trailing`并且配置了`maxWait`的`debounce`函数，根据前面的源码和流程综合也好理解，就不进行冗余展开了：

```javascript
function throttle(func, wait, options) {
  let leading = true
  let trailing = true

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    leading,
    trailing,
    'maxWait': wait
  })
}

export default throttle
```

&emsp;&emsp;最后我们在官方文档的docs说明和源码注释中都能看到，当`leading`和`trailing`都为`true`时，必须在我们`trailing`定时的`wait`时间内至少触发一次`deboungced`函数，才会在`trailing`时机再次执行一次目标函数，因为从函数体我们可以看到还依赖了第二个条件参数`lastArgs`，而这个参数只有在`debounced`中会被赋予值。

&emsp;&emsp;到此源码阅读和表现分析已结束，以上。