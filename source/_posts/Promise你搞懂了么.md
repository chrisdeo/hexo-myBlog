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

![](pending.jpg)

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

![](console1.png)

&emsp;&emsp;最终输出的只有**a c**，推理也很简单，答案的推论都在前文的叙述中有所提及，再结合上一篇文章Event Loop的基础：第一个和第二个分别输出`a`，`c`应该是不会有异议的，两者均属于同步，有人的疑问可能是为什么`b`没有输出？从前文我们知道实例化的then是可以接收2个参数的，图中仅传入一个参数那就是对应了`resolved`时的回调，可是在前面实例化Promise时，并没有逻辑指定最后的决策结果，所以Promise还处于一个`pending`状态，所以这个then内的回调自然是无法被触发的，最终输出`a c`。

&emsp;&emsp;**有点感觉了？那再来几个试试？**

```javascript
Promise.resolve(1).then(2).then(Promise.resolve(3)).then(console.log);
```

&emsp;&emsp;开始这个问题的分析前，我们需要先理清一个概念，**Promise.resolve**的作用是什么？它能将现有对象(入参)转化成Promise对象，我们可以分为几种情况讨论：

&emsp;&emsp;①：**参数是一个 Promise 实例**，`Promise.resolve`将会原封不动地返回这个实例。
&emsp;&emsp;②：**参数是一个 `thenable` 对象**，`thenable`对象指的是具有then方法的对象：

```javascript
let thenable = {
  then: function(resolve, reject) {
    resolve('Hello World!');
  }
};

let p1 = Promise.resolve(thenable);

p1.then(function(output) {
  console.log(output);  // Hello World!
});
```

&emsp;&emsp;③：**参数不是对象**，即当我们的入参是个原始值时，它会经过工厂函数转为对应原始值类型对象，然后`Promise.resolve`返回一个状态为`resolved`的新Promise对象，并且该方法的参数会同时传给`then`方法内的回调函数。
&emsp;&emsp;④：**不带有任何参数**，直接返回一个`resolved`状态的Promise对象。

&emsp;&emsp;OK，我们回到正题，第一个`resolve`使这个Promise实例状态变为`resolved`并且基本类型1转化为对象后向后面then中的回调传递，我们看到第一个`then`中只有一个参数2，根据前文我们知道此处走的是`then`的`resolve`回调，入参是2，**但是没有返回值**。再看到第二个`then`内，传入了一个`resolved`的Promise，但同样没有返回，故最后一个`then`的回调内还是接收的第一个`Promise.resolve`往后传的1，最终输出`1`。

&emsp;&emsp;**换言之，`Promise.resolve`的入参会作为后续then的传参；只有在`then`的回调函数内有返回值时，才会覆盖之前的传参往后续的链式`then`中传递**

&emsp;&emsp;注：每次`then`方法调用都会返回一个新的Promise实例。

&emsp;&emsp;既然讨论了**Promise.resolve**，那肯定也少不了**Promise.reject**，该方法也会返回一个新的Promise实例，并且`reject(reason)`的参数会直接作为后续方法参数传下去，不像`resolve()`会有几种情况判定。举个例子：

```javascript
const thenable = {
  then(resolve, reject) {
    reject('出错了');
  }
};

Promise.reject(thenable)
.catch(e => {
  console.log(e === thenable)
})
// true
```

&emsp;&emsp;**感觉自己吃透了？看看下面这个大兄弟？**

```javascript
new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('then11');
  new Promise((resolve) => {
    console.log('promise2');
    resolve();
  }).then(() => {
    console.log('then21');
  }).then(() => {
    console.log('then22');
  })
}).then(() => {
  console.log('then12');
})
```

&emsp;&emsp;先说结果，依次输出`promise1 then11 promise2 then21 then12 then22`，是不是跟想象中的有点不一样？

&emsp;&emsp;记得第一次我看到这个题的时候我也挺懵的，感觉JS白学了。但是现在把一些基础理论搞清楚了，再回来看反而很清晰了...**这里的核心考点就是Promise的`resolved`时会发生什么**：

&emsp;&emsp;①：Promise构造函数内第一行同步方法立即执行，输出`promise1`；
&emsp;&emsp;②：Promise构造函数内第二行调用`resolve`方法，将Promise实例状态从`pending`置为`resolved`，**状态决定的Promise后面的回调将会被立即执行**，所以我们进入第一个`then`，输出第一个同步任务`then11`；
&emsp;&emsp;③：紧接着这个回调函数内部又构造了一个新的Promise，跟①中分析的逻辑类似，我们会先输出`promise2`，然后状态`resolved`，立即执行这个构造函数链式的第一个`then`内的回调，输出`then21`；
&emsp;&emsp;④：**此处就是分歧点了**，最早遇到这个问题的时候前面的输出我是没啥疑问的，但是最后三个输出我就搞不懂了，我当时写的是`then21 then22 then12`，因为当时刚看了点Event Loop的内容，就觉得是按照微任务队列结构输出的；然而这里的真相是什么呢？**这个地方其实跟Event Loop没什么关联，它就是很纯粹的Promise自身特性。**其实在这第二个Promise构造函数内部执行`resolve`方法时，第一个Promise的第一个`then`内的回调返回的Promise实例就`resolved`了，根据我们前面掌握的基础理论，状态确定的Promise的then回调会被立即执行，所以此处会先输出`then12`，最后输出`then22`。

&emsp;&emsp;后记：隔了一段时间回顾了下这篇文章，发现其实上面的④说的也是模棱两可的，有点混。现在的我给出新的解释：**这里就是走的单纯的Promise回调触发逻辑**，之前因为Promise的底子不够扎实，一直没有定位出来。我们先看下面的对比：

```javascript
let promise = new Promise(resolve => resolve()).then(() => {})
// Promise {<resolved>}
let promise = new Promise(resolve => resolve()).then(() => new Promise((res, rej) => {}))
// Promise {<pending>}
```

&emsp;&emsp;发现问题了么？没错，其实就是`then`的回调函数问题，我们知道`then`方法可以接收2个回调函数作为参数，分别用来指定`resolved`状态以及`rejected`状态的回调。前文题目中其实都是默认走了第一个`resolved`的回调，而如果这个回调内没有返回一个`new Promise`，那`then`方法最终返回的那个Promise实例都是`resolved`状态的，都会即刻触发后面链式`then`的回调。因此，前文第二个`new Promise`我觉得可以这么理解：它首先要管理内部的“小弟”，其次它还需要反馈自身状态来继续外层的链式`then`动作。那么，走到内部`resolve`时，由于回调即可执行，会先输出`then21`，此时其实这个Promise的状态已定，对于它自身所在的这个`then`方法回调来说，已经可以确认状态了，于是状态转`resolved`触发最后的`then`回调，输出`then12`，最后才走`then22`...这或许也是异步的魅力？（误）