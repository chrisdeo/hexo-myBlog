---
title: Event-Loop一次盘清楚
date: 2019-02-22 08:58:57
tags:
  - Javascript
  - Event Loop
---

> &emsp;&emsp;搞懂Event Loop是一件很有意义的事情，不仅仅是你会在一些面试中遭遇，更多的是让你理解JS引擎在执行语句的时，与你预期不一致的“奇异”结果是如何产生的。

<escape><!-- more --></escape>
## 什么是Event Loop？

&emsp;&emsp;在开始讨论前，我们先区分下宿主环境(即当前JS引擎所运行的环境)：本文主要围绕Chrome浏览器和Node两个执行环境进行讨论。

### 浏览器环境(Chrome v8)

&emsp;&emsp;关于Chrome浏览器中以v8为js引擎内核的执行周期图在社区中比较常见，如下图所示：

![](Event_Loop.jpg)

&emsp;&emsp;Web中的Event Loop大致由4部分组成：**MicroTask、MacroTask、Web APIS、Stack** 。在讨论其执行过程时，我们还要区分**异步**和**同步**两种情况。

#### 同步

&emsp;&emsp;同步的情景比较简单，就是个简单的入栈、出栈过程，就以下面这块代码为例：

```javascript
  function a() {
    b();
  }
  function b() {
    c();
  }
  function c() {
    console.log('Hello World!');
  }
  a();
```
&emsp;&emsp;①、a被调用，a入栈；
&emsp;&emsp;②、a中调用了b，b入栈；
&emsp;&emsp;③、b中调用了c，c入栈；
&emsp;&emsp;④、c中调用log，log入栈；
&emsp;&emsp;⑤、log被执行，输出Hello World! ，log出栈；
&emsp;&emsp;⑥、以此类推，c、b、a 依次出栈；

#### 异步

&emsp;&emsp;异步场景中要考虑的东西就比较多，不过第一步一样是入栈；第二步，也就是浏览器发现我们的任务是异步任务后，会将这个任务交给前文图中的Web APIS去维护(此处像`onclick`这样的需要回调的也会交付给Web APIS)，Web APIS可以视作一个回调函数构成的队列，当其中的如`setTimeout`的计时器到时后，**会先检查当前执行栈Stack是否为空**，只有当执行栈清空后，这个回调的任务才会被压入栈中执行。

&emsp;&emsp;就这么简单？肯定不是，因为我们放入Web APIS中的