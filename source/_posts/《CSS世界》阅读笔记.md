---
title: 《CSS世界》阅读笔记
date: 2019-01-15 14:42:05
tags:
  - CSS
  - 笔记
---

> &emsp;《CSS世界》这本书感觉可以说是张鑫旭的一本CSS领域的内功心法，阅读这本书其实是为了印证一些自身在CSS学习上的一些东西，所以有了这篇读书笔记，记录一些我不是很清晰的知识点。

&emsp;&emsp;1、伪类选择器：一般指前面有个英文冒号(:)的选择器，如`first-child`或`:last-child`等。
&emsp;&emsp;2、伪元素选择器：就是有连续两个冒号的选择器，如`::first-line`、`::first-letter`、`::before`、`::after`等。
&emsp;&emsp;3、后代选择器：选择所有合乎规则的后代元素。用空格连接。
&emsp;&emsp;4、相邻后代选择器：仅选择儿子(一层后代)元素，用>连接。
&emsp;&emsp;5、`>、~、+`选择器适用于IE7以上版本。
&emsp;&emsp;6、通常把HTML标签分为两种：块级元素和内联元素。
&emsp;&emsp;7、块级元素和`display: block`不是一回事，但是它们都具备一个基本特征:一个水平流只能单独显示一个元素。
&emsp;&emsp;8、具有换行特性的"块级元素"(笔记7的综合体)，可以配合clear属性来清除浮动带来的影响。
&emsp;&emsp;9、实际开发中不会使用`display: list-item`来配合清除浮动，理由①会出现不必要的项目符号`·`,但是可以通过`list-style: none`规避。理由②IE不支持伪元素设置`display: list-item`，普通元素设置有效。
&emsp;&emsp;10、a标签默认display是inline。
&emsp;&emsp;11、**替换元素：根据其标签和属性来决定元素的具体显示内容**，如`input, textarea, img, video, object`等。
&emsp;&emsp;12、理解样式属性的意义，规避不必要的样式书写，减少性能损耗：
&emsp;&emsp;栗子1：当我们修改a标签成`display: block`的时候，它已经具备了块级特性，即它本身会有流的自然填充性，它会像流一样自动铺满外部容器空间。但是，如果你设置了宽度，不论是百分比还是固定值，它的流动性就丢失了。见书中提供的`width: 100%`流破坏和自然流填充对比[Demo](https://demo.cssworld.cn/3/2-3.php)。
&emsp;&emsp;栗子2：`*{box-sizing: border-box}`，这种通配符的属性选择器应当尽量避免，因为比如search类型的搜索框，其默认的`box-sizing`就是`border-box`，这种重复赋值就是一种损耗，再比如普通内联元素(**非图片**等替换元素)，`box-sizing`无论是什么值，对渲染表现都没有影响，同样设置这种就是无意义的赋值。
&emsp;&emsp;13、在本书中，作者将CSS的盒模型分为了"外盒"以及"内盒"，两者对应具有"外部尺寸"以及"内部尺寸"。流的自然填充性就是依赖于外部尺寸的作用。
&emsp;&emsp;14、格式化宽度：该宽度仅出现在`position: absolute`或`position: fixed`情形中，这种情形下，宽度表现为"包裹性"，宽度由内部尺寸决定。但是对于非替换元素，如果left/right，top/bottom这种对向属性同时存在的时候，宽度将会呈现为"格式化宽度"，表现形式就是相对于最近的具有定位特性的祖先元素计算。
