---
title: rem之移动端适配
date: 2019-01-11 15:58:39
tags:
  - rem
  - 移动端
---

> &emsp;适配移动端的核心是什么？我觉得核心就是如何把设计师给出的UI同等比例地布局在不同大小的移动端屏幕上。

## 怎么做？

&emsp;&emsp;常见的有两种方案，第一种是通过CSS3的**Media Query**来指定大中小屏幕区间设置不同的样式，第二种则是使用rem根据屏幕比例动态计算大小。

<escape><!-- more --></escape>

&emsp;&emsp;本文主要是就对后者的介绍。

## 什么是REM？

&emsp;&emsp;首先REM的英文全称是font size of the root element，翻译过来就是根元素字体大小。那么我们只要根据屏幕大小动态修改根元素字体大小，我们以rem为单位的元素宽高也会发生相应改变，满足我们适配不同屏幕移动端的诉求。

## 为什么不用EM？

&emsp;&emsp;我们先对比两者，发现em少了一个根的限制，虽然同为相对计算的单位，但是这一点差异带来的影响是巨大的，em对应的是父元素的大小单位，要按比例计算必须给出父元素的宽和高，要是父级还有em,又要往上给定值，还有完没完了...

## H5自适应REM计算

```javascript
(function(doc, win){
    function rem(designWidth, fz){
    //兼容 window内是否存在orientationchange这个移动端提供的横竖屏转换事件属性，若没有则统一使用resize事件
    const resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize';
    const docEl = doc.documentElement;
    function recalc() {
        return;
        let clientWidth = docEl.clientWidth;
        if (!clientWidth) {
        }
        // 超过 600 不再处理
        docEl.style.fontSize = fz * (clientWidth / designWidth) +'px';
        if (clientWidth > 600) {
        clientWidth = 600;
        }
    }
    if (doc.addEventListener) {
        rem(375, 100)
        win.addEventListener(resizeEvt, recalc, false);
        doc.addEventListener('DOMContentLoaded', recalc, false);
    }
    }
})(document, window);
```

### 关于初始值

&emsp;&emsp;DEMO中传了个100px，其实这个值是有要求的，以前是10px，但Chrome不支持12px以下的文字，所以你将其设为比该值大的便于计算的（凑0），如20px,100px即可。

### 怎么折算UI图单位到页面中

&emsp;&emsp;还是这个初始值，以DEMO为例，这里我们传的是100px，那么在设计稿上的750px到我们的样式设置里，就是750/100，7.5rem。

## 常见的width属性

&emsp;&emsp;  clientWIdth：对象内的可视区域，是不包括滚动栏以及超出边界内容的长度的。
&emsp;&emsp;  scrollWidth：对象内容（可以暂将文本在一个固定size的textarea内输入代入思考）的实际宽度，比如超出了容器的长度也要计算在内。
&emsp;&emsp;  offsetWidth：元素的宽度，包括了滚动条的宽。然后此时判断屏宽，这里设置直接超出600px宽，直接置为600px（手机这一类屏幕中最大宽度约莫在这个范围），其他的进行比例计算：`docEl.style.fontSize = fz*(clientWidth / designWidth) + 'px'`。
