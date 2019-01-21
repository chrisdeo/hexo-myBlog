---
title: input与label标签的关联
date: 2019-01-21 16:42:38
tags: 
  - CSS
  - 移动端
---

> &emsp;在移动端H5开发的时候，曾经遇到过一个点击选中单选框的问题，这里的点击不仅仅是点击单选框可以选中，如果要求点击其后的文案也能同时选中单选框要如何做呢？

&emsp;&emsp;其实这个场景挺常见的，不过之前我自己没有实践过，核心就是如下代码(关键点在于input的id和label的for对应)：
```html
 <input type="radio" id="bbb"/>
 <label for="bbb">...</label>
```
<escape><!-- more --></escape>
&emsp;&emsp;现在我们已经可以成功关联按钮和文案了，不过我们往往不会使用浏览器原生的单选或复选框的样式(太鸡儿丑了)。此时我们的UI支持已经提供了素材，我们要做的就是进行背景图的替换，然而我就是在这步操作的时候踩坑了，我当时使用了`appearance: none`这个样式来隐藏默认样式，但是这个玩意是CSS3才有的，而且兼容性巨坑，首先IE不支持，CHROME和SAFARI要加-webkit-前缀，FF要加-moz-前缀。最后我在stackoverflow上面看到了一种让我眼前一亮的hack写法如下图，充分利用选择器的方式。

![](hack.png)

&emsp;&emsp;这就完了么？没有...后面还发现一个问题，就是在移动端选中按钮和一些文本框的时候外层会有一个淡色框，这个框其实就是因为`outline`这个属性的影响，我们可以通过如下代码来统一消除：
```css
input, button, select, textarea {
    outline: none;
}
```
&emsp;&emsp;现在我们还想优化一下体验，比如隐藏移动端的滚动条，但还是允许它滚动怎么做呢？
```css
.container {
    overflow-y: scroll;
    &::-webkit-scrollbar: none; /* less兼容写法 */    
}
```