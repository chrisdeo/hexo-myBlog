---
title: Promise你搞懂了么
date: 2019-06-15 21:33:21
tags:
  - Javascript
  - Promise
---

> &emsp;这篇文章就让我们来聊聊Promise的前世今生。

## 什么是Promise？

&emsp;&emsp;Promise封装了依赖于时间的状态，等待底层值的完成(resolved)或拒绝(rejected)，故Promise本身是与时间无关的，它能够按可预测的方式组合而无需关心时序或底层结果。一个Promise在决策后，将会Immutable化，并且当前Promise上通过then注册的回调都会在下一个异步时机点上（Event Loop见另一篇博文<<Event-Loop一次盘清楚>>）依次被立即调用。

<escape><!-- more --></escape>

### 构造函数下的Promise是什么状态？

&emsp;&emsp;我们知道Promise在得到决策结果前有一个`pending`状态，表明当前Promise处于等待状态。我们通过Promise构造函数得到的Promise实例就是处于pending状态，如下图所示：

![](Promise你搞懂了么/pending.jpg)

&emsp;&emsp;**注：Promise构造函数中的函数执行是同步的。**

&emsp;&emsp;当然这里处于`pending`也与我们实例化时内部没有进行指定状态有关：

```javascript
let initPromise = new Promise((res, rej) => {
    if (/* 异步成功操作逻辑 */) {
        res(/* 生成实例then方法中指定resolved状态的入参 */);
    } else {
        rej(/* 错误时的异常信息 */);
    }
}) 
```

### 指定决策后状态的回调

&emsp;&emsp;在我们的实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数，如下代码所示：

```javascript
initPromise.then(function(value) {
  // resolved
}, function(error) {
  // rejected
});
```

&emsp;&emsp;到这里你大概觉得已经明白Promise的基本用法了，那可以看看下图中的输出结果是什么：

![](Promise你搞懂了么/console1.png)

&emsp;&emsp;最终输出的只有**a c**，推理也很简单，答案的推论都在前文的叙述中有所提及，再结合上一篇文章Event Loop的基础：第一个和第二个分别输出`a`，`c`应该是不会有异议的，两者均属于同步，有人的疑问可能是为什么`b`没有输出？从前文我们知道实例化的then是可以接收2个参数的，图中仅传入一个参数那就是对应了`resolved`时的回调，可是在前面实例化Promise时，并没有逻辑指定最后的决策结果，所以Promise还处于一个`pending`状态，所以这个then内的回调自然是无法被触发的，最终输出`a c`。