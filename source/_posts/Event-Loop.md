---
title: Event-Loop&Repaint/Reflow
date: 2019-02-22 08:58:57
tags:
  - Javascript
  - Event Loop
  - Repaint
  - Reflow
  - requestAnimationFrame
---

> &emsp;写下这篇文章的背景还是挺有意思的，是由我做一个往Modal层上覆盖水印动作遇到的困扰而引发的扩散思考，在前面的<<React开发填坑记录>>一文中我曾记录过这一次的坑和解决方案:由于我在componentDidMount生命周期中无法拿到我的Modal最终渲染的DOM，返回null，目测是这个时候，Modal的整个结构还没有渲染出来，最终通过requestAnimationFrame的回调在下一次重绘前，拿到我们要的东西(水印挂载的DOM)。

<escape><!-- more --></escape>
## 什么是requestAnimationFrame？

&emsp;&emsp;按照MDN的官方解释来说，`requestAnimationFrame`会告知浏览器你希望在下一次重绘前执行一个动画，这个方法需要传入一个回调函数作为参数，这个回调会在下一次重绘前被触发。 **如果想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用window.requestAnimationFrame()。**`requestAnimationFrame`会返回一个`long`整数作为回调的唯一标识，同时它也类似`setTimeout`，`setInterVal`这些函数的返回句柄，可以通过该标识来取消这个回调函数。取消回调的API是`window.cancelAnimationFrame()`。

&emsp;&emsp;换言之，它其实是为了动画更加"柔顺丝滑"而生的，因为它能保证动画每一帧的间隔，像`setTimeout`，`setInterval`由于任务队列的存在，不一定能够保证执行时间间隔。在线程被占用的时候，就可能出现卡顿的情景。而`requestAnimationFrame`完全由系统刷新率决定: 比方说目前主流的显示器都是60HZ的，意味着页面每秒钟能够重绘60次，间隔为1000ms/16=16.7ms，以这个间隔设置的动画将带来最佳的平滑体验，同时保证了每一帧的效果并且`requestAnimationFrame`会把每一帧中的所有DOM操作集中起来，在一次重绘或回流中就完成，并且重绘或回流的时间间隔紧紧跟随浏览器的刷新频率。

&emsp;&emsp;官方使用方法，可以看到`requestAnimationFrame`接收的回调函数，默认会传入当前系统的时间戳。
```javascript
var start = null;
var element = document.getElementById('SomeElementYouWantToAnimate');
element.style.position = 'absolute';

function step(timestamp) {
  if (!start) start = timestamp;
  var progress = timestamp - start;
  element.style.left = Math.min(progress / 10, 200) + 'px';
  if (progress < 2000) {
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
```

## 什么是Repaint&Reflow？

&emsp;&emsp;前面我们所说的`requestAnimationFrame`发生在下一次`repaint`前，对于`repaint`,我们可以理解为只是对页面的某一部分进行样式的调整，不会改变整个页面的DOM排版，比如`color/font-size`这些样式的变动。而`reflow`就如一个原本`display: none`的元素，被切换为`display: block`，改变了整个页面的渲染结构。`visible: hidden`不太一样，它本身就占据了空间，只是样式上被隐藏了，而非不渲染，所以属于`repaint`。
当一帧送到屏幕时，会按照下图的顺序进行：

![](reflow.jpg)

&emsp;&emsp;首先JavaScript运行，然后计算样式，然后再是布局。可以看到中间Layout在Paint之前，所以若是发生了`reflow`，那么`repaint`也是必然会发生的，反过来则未必了。

## 什么是Event Loop？

&emsp;&emsp;Event Loop可以理解为JS是如何在同一时间处理多个任务的判断逻辑。我们知道JS的代码执行分为**同步**和**异步**，前者的问题在于会引起阻塞，我们可以想象一下排队从前门上公交车的场景，大家必须一个个地登上公交然后投币或者滴卡。如果有人在门口因为自己的事情，比如找不到零钱或卡，就会堵住后面想要上车的人。而异步呢就可以想象成现在这个车上还有一名售票员，当要上车的乘客出现了一些麻烦，他们可以先告诉售票员他们的问题，然后由售票员记录，再在他们能够解决自身问题的时候通知售票员，让售票员来重新对他们收费(回调)。

&emsp;&emsp;下面在正式开始讨论Event Loop前引入几个概念：**执行栈、执行堆、宏任务、微任务**。执行堆用来存放`Object`类型的引用数据。执行栈则用来存放基本数据类型以及执行函数，