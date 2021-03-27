---
title: 关于Object.is的polyfill理解
date: 2021-03-24 22:07:18
tags:
  - Javascript
  - polyfill
---

> &emsp;在翻看`react-redux`源码中的一段工具函数代码时候，对其中的逻辑有一丝迷惑，后科学上网一波得到了我想要的答案。本文是一篇关于`Object.is`、`==`、`===`的逻辑梳理。

&emsp;&emsp;`react-redux`库的浅层比较文件（`shallowEqual.js`）内的工具方法`is`其实就是现在ES6的`Object.is`方法的`polyfill`实现，在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is)上我们也可以看到对应的算法描述。

<escape><!-- more --></escape>

![](is.jpg)

&emsp;&emsp;根据上述算法，我们可以发现其实`==`和`===`对值的判断主要有三点不准确的：

&emsp;&emsp;1⃣️：在`==`情景下，发生了隐式转化；

&emsp;&emsp;2⃣️：在`===`情景下，`+0`和`-0`比较返回了`true`；

&emsp;&emsp;3⃣️：在`===`情景下，`NAN`和`NAN`比较返回了`false`。

&emsp;&emsp;综上，我们要做到完全判断是否相同（对象引用地址指向相同），做如下实现即可：

```javascript
if (!Object.is) {
  Object.is = function(x, y) {
    // 全等比较，可以确认大部分情景的值相等
    if (x === y) {
      // 对于 +0 和 -0 的判断
      // 确认x为+0 or -0 后通过 +Infinity !== -Infinity来做差异比对
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // 对于 NAN 的判断
      return x !== x && y !== y;
    }
  };
}
```