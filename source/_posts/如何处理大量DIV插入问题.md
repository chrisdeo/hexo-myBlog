---
title: 如何处理大量DIV插入问题
date: 2019-07-22 16:43:46
tags:
  - HTML
  - DOM
  - Javascript
  - Event Loop
---

> &emsp;&emsp;这篇文章真是有一种文艺复兴的感觉；不过从解决问题的角度上看，一些处理问题的方案还是能综合应用到不同的实际场景中的。

<escape><!-- more --></escape>

## 背景

&emsp;&emsp;最早其实是在一次分享会上听到了相关问题的讲解，近期又在一次面试中和面试官讨论了这个问题：**如何处理大量DIV插入问题？**

&emsp;&emsp;那么本文就以这样一个DEMO来进行讨论：**如何优化一个点击button往`container`容器中插入20W个`div`的场景**。

#### 方案一：纯appendChild插入

&emsp;&emsp;纯appendChild插入就是你直接操作DOM树，通过找到父亲节点然后根据要插入的DIV数量循环调用`appendChild`插入，并且在这一个过程中你完全没有进行装饰；这大概是刚接触前端的人才会选择的做法，那么这样的做法存在什么问题呢？首先，从JS性能上而言，直接操作DOM是一件性能很低的事情；其次，我们每一次直接插入DIV都会导致重排（reflow）发生页面重渲染；另外**JS是单线程的，它跑在浏览的主线程中，这条主线程与浏览器的渲染线程是互斥的**，即当我们同步执行按钮回调时，不但页面被锁定，无法进行别的JS交互动作（比如有个别的按钮你想点，此时按钮回调就无法响应），页面渲染也会被阻塞。一旦这个处理环节比较长，用户就会明显感到卡顿，并且期间无法做别的事情，这肯定是不OK的。

&emsp;&emsp;以下是纯`appendChild`方式的渲染截图：

![](raw.jpg)

&emsp;&emsp;通过Chrome的Performance录制我们可以看到总共耗时`13.122s`才将页面渲染出来，这期间别的JS操作响应会被同步阻塞；在整个点击渲染过程中，`Layout`重排这块耗时最长，并且这个`render`过程是不间断的，一条紫柱直到绿柱的绘制位。

&emsp;&emsp;[纯appendChild + 阻塞按钮 DEMO](https://chrisdeo.github.io/divDemo/raw)。

#### 方案二：修改innerHTML插入

&emsp;&emsp;使用`innerHTML`来处理，就是先循环构造出DOM的字符串，再设置父容器的`innerHTML`，使页面重新渲染。这种方案从原理上来看，性能肯定是要比纯`appendChild`插入要高的，首先它只操作了一次DOM，其次它不会多次重排。我们看下分析图：

![](inner.jpg)

&emsp;&emsp;在`render`紫柱和`script`黄柱部分有明显的时间缩减~

&emsp;&emsp;[innerHTML DEMO](https://chrisdeo.github.io/divDemo/inner)。

#### 方案三：创建Fragment插入

&emsp;&emsp;现在可以文艺复兴一波，当年看红宝书的时候其实有这么一个API，我们能够通过`document.createDocumentFragment`的方式，在创建的`Fragment`中进行一些运算量比较大的DOM操作，比如这里的大量DOM插入，在`Fragment`里的插入并不会直接插入到DOM中，待`Fragment`中元素插入完毕，再将这个Fragment插入到父亲节点后，将子元素应用到实际DOM内，`Fragment`则不会出现在实际DOM树内。如此，只存在`Fragment`应用时的一次重排，且也只有最后应用`Fragment`时操作了DOM，与方案二相比，我觉得主要提升体现在无需海量的字符串拼接操作。分析图见下：

![](fragment.jpg)

&emsp;&emsp;与方案一、方案二比较，`render`与`script`过程都大幅缩短。

&emsp;&emsp;[Fragment DEMO](https://chrisdeo.github.io/divDemo/fragment)。

#### 方案四：分批插入

&emsp;&emsp;讲到现在，我们可以看到问题了：一般我们打游戏帧数维持在60帧以上就会比较舒服，玩起来很流畅，因为人能够感知到的变化就差不多是16.7ms，所以我们要确保每一次处理任务到渲染的时间在这个范围内，即keep在16ms以内才能让我们的页面更新看上去“不卡”。那怎么把大批量的任务拆分呢，这就回到了之前我们讲过的`Event Loop`了，我们将分批操作，比如这里的大量DOM插入，变为小部分DOM插入，分别通过宏任务的`setTimeout(func, 0)`放入到每一个Loop当中，然后进入渲染引擎的时间，这里并不一定会马上渲染而是交由浏览器本身去判断（我们无法介入），如果是`RAF`则能确保每一帧进行操作；

&emsp;&emsp;概括一句话来讲，这是一种“动态加载”的方案，能让我们感觉到可视界面是“一瞬间”呈现的，后续内容会紧跟着更新插入，但是本质上JS跑的性能上也是看你采取以上那种方案。这里还是以`appendChild`来操作一下，贴下核心代码，逻辑比较简单，就是在`setTimeout`中执行我们的小批量操作：

```javascript
    function chunkPaint() {
        let root = document.querySelector('.container');
        let LIMIT = 100000;
        let CHUNK = 1000;
        let sum = 0;
        while (sum < LIMIT) {
            setTimeout(function () {
                for (let i = 0; i < CHUNK; i++) {
                    root.appendChild(document.createElement('div'));
                }
            }, 0);
            sum += CHUNK;
        }
    }  
```

&emsp;&emsp;[分批插入 DEMO](https://chrisdeo.github.io/divDemo/chunk)。