---
title: async与await回味一下
date: 2019-07-17 21:54:03
tags:
  - Promise
  - Async
  - Await
  - Javascript
---

> &emsp;“如果你担心某种情况发生，那么它就更有可能发生。”    —— 墨菲定律

&emsp;&emsp;我们都知道`async`、`await`其实是`promise`的语法糖，在过去还没有`generator`和`async\await`时，只使用`promise`处理异步问题很容易出现多层回调嵌套的情景，比如我们第二个异步操作依赖于第一个异步请求返回的数据，那我们就需要在`resolve`后从第一个`then`的对应回调方法中去传递这个值，同理要是之后还有对前面操作的依赖就会不断嵌套下去...

<escape><!-- more --></escape>

## 回调地狱

&emsp;&emsp;举个例子：假设有一个场景，我们需要先根据用户的申请编号(applyNo)去影像系统拿对应的影像编号(imageNo)再根据这个影像编号去请求影像信息。使用`promise`来实现大概有如下的代码：

```javascript
  fetch('获取影像编号接口', {
    // 请求头配置
  }).then(res => {
    const { imageNo } = res; //
    fetch('获取影像信息接口', {
          // 请求头配置
    }).then(res => {
      const { imageInfo } = res;
      // ...潜在回调地狱
    })
  })
```

## Async和Await带来了什么

&emsp;&emsp;有了`async`和`await`后，我们是如何实现上述的逻辑呢？

```javascript
  async function fetchDocInfo(applyNo) {
    let { imageNo } = await fetchImageNo(applyNo);
    let { imageInfo } = await fetchImageInfo(imageNo);
    return imageInfo;
  }
```

&emsp;&emsp;可以看到，通过这种方式实现，首先嵌套的问题没了，其次它更符合我们思考问题的流程，使我们能够以编写同步代码的方式去进行异步编程；这也是我个人看来`async/await`对开发体验而言带来的最大提升。

## Async做了什么

&emsp;&emsp;**带async的函数最终会返回一个Promise对象，即使你在函数中返回的是一个普通变量，它也会通过`Promise.resolve()`封装后再返回。**其次在我们coding的过程中，`await`需要写在`async`函数内部，否则会报错。

## Await又做了什么

&emsp;&emsp;`await`做了一件事，等！它会等它右侧表达式的结果。而且还要区分结果的类型！**当表达式结果是`Promise`时，它会进入异步的等待流程，直到`Promise`被`resolve`，最后将`resolve`的值作为`await`的等待结果；如果表达式结果就是一个直接量，那这个结果就是`await`要等的值。**

## Async/Await的执行时机

&emsp;&emsp;之前的博客有聊过EL的一些执行输出场景,现在就可以把缺少的`async/await`加进去一起讨论了，首先第一点是我个人对比了几个网络上常见的执行DEMO得出的结论：**`async`函数内部在到达`await`表达式前，可以等价于`Promise`内的构造函数部分，即这块区域的代码是同步执行的。**了解这点后，综合前文讨论的根据`await`等待的表达式结果类型判断即可正确得到我们的执行输出顺序。上个DEMO：

```javascript
async function async1() {
    console.log(1)
    await async2()
    console.log(2)
}
async function async2() {
    console.log(3)
}
async1()
console.log(4)
```

&emsp;&emsp;最终输出结果是`1 3 4 2`，为啥呢？首先调用栈先调用了`async1()`，然后内部先输出同步的1，然后调用`async2`，`async2`返回一个`promise`同时它内部的输出一样是同步输出，再加外层的`4`，就是`1 3 4`的顺序，最后`async2`返回的promise`resolved`了，`await`等待结束，输出`2`。

&emsp;&emsp;我自己在这里也改写了一个DEMO，来看看是否真得理解了：

```javascript
async function async1() {
    console.log(1)
    console.log(await async2())
    console.log(2)
}
function async2() {
	console.log(3)
  return Promise.resolve(4);
}
async1()
console.log(5)
```

&emsp;&emsp;还是一步步看，调用栈执行`async1()`，然后同步输出`1`，然后`async1`内的第二个输出结果需要`await`等`async2`的返回值，然后执行`async2`，同步代码，输出`3`，由于`async2`最终返回的是一个`resolved`的Promise对象，还是一个异步的状态进入`micro task `队列维护，我们会继续执行我们的同步任务，即最外层的`5`，之后`Promise.resolve`传入的值返回被`await`等到，输出`4`，这里等待结束，继续输出之后的`2`，所以有最终结果`1 3 5 4 2`。

&emsp;&emsp;如果你看到这里了，可能已经大概摸得差不多了，那我再把上面这个DEMO的`async2`返回变为直接量会如何呢？

```javascript
async function async1() {
    console.log(1)
    console.log(await async2())
    console.log(2)
}
function async2() {
	console.log(3)
  return 4;
}
async1()
console.log(5)
```

&emsp;&emsp;最终输出结果依旧是`1 3 5 4 2`。

&emsp;&emsp;综上，我们可以得到：**`await`其实就是一个异步等待结果的过程，得到结果才会`resolved`从而执行后续代码，同时我们可以把整个`async`函数视作一个Promise的执行流程，在内部`await`前代码块等价于`Promise`构造中的同步代码块，在`await`后的代码可以理解为`then`方法中对应`resolved`的回调处理部分，当`Promise`被`resolved`后就会被回调。还是那句话，同步优先。**

&emsp;&emsp;真的盘清楚了？那你的Promise基础够硬么？如果我将`Promise.resolve`改成`Promise.reject`呢？

```javascript
async function async1() {
    console.log(1)
    console.log(await async2())
    console.log(2)
}
function async2() {
	console.log(3)
  return Promise.reject(4);
}
async1()
console.log(5)
```

&emsp;&emsp;最后输出`1 3 5`...嗯？没了？

![](reject.png)

&emsp;&emsp;可以看到控制台仅输出`1 3 5`，并且有一个未捕获的Promise值，这是因为我们并没有`catch`获取这个值，`await`也无法接收这个值，自然无法输出`4`，而之后的`2`是`resolved`的回调而不是`rejected`的，自然也莫得~

&emsp;&emsp;最后的最后，我们看一看某条的一道看烂的题:

```javascript
async function async1() {
    console.log("async1 start");
    await async2();
    console.log("async1 end");
}

async function async2() {
    console.log("async2");
}

console.log("script start");

setTimeout(function() {
    console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
    console.log("promise1");
    resolve();
}).then(function() {
    console.log("promise2");
});

console.log("script end");

```

&emsp;&emsp;①同步输出`script start`；
&emsp;&emsp;②`setTimeout`进入宏任务队列；
&emsp;&emsp;③调用`async1`，同步输出`async1 start`；
&emsp;&emsp;④`await`等待`async2`被`resolved`的结果返回；
&emsp;&emsp;⑤执行`async2`，同步输出`async2`；
&emsp;&emsp;⑥此时`await`还处于异步等待环节，`await`之后的等价于`then`中对应`resolved`的回调，进入微任务队列维护，然后继续处理优先级更高的同步问题；
&emsp;&emsp;⑦Promise的构造函数中同步输出`promise1`；
&emsp;&emsp;⑧`resolve`后`then`回调放入微任务队列维护，此时微任务队列中有`async1 end`和`promise2`；
&emsp;&emsp;⑨继续执行调用栈中的同步任务，输出`script end`；
&emsp;&emsp;⑩此时同步任务已经全部跑完，我们回头看异步队列中维护的任务，由于微任务优先级高于宏任务，所以我们有`async1 end`，`promise2`，`setTimeout`的输出顺序；

&emsp;&emsp;那最后输出是否是上面说的这样呢？

![](bytedance.jpg)

&emsp;&emsp;成了！