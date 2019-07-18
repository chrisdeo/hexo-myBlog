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

&emsp;&emsp;最终输出结果是`1 3 4 2`，为啥呢？首先调用栈先调用了`async1()`，然后内部先输出同步的1，然后调用`async2`，`async2`返回一个`promise`同时它内部的输出一样是同步输出，再加外层的4，就是`1 3 4`的顺序，最后`async2`返回的promise`resolved`了，输出`2`。
