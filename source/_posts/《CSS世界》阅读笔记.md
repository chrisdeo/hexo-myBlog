---
title: 《CSS世界》阅读笔记
date: 2019-01-15 14:42:05
tags:
  - CSS
  - 笔记
---

> &emsp;《CSS世界》这本书感觉可以说是张鑫旭的一本CSS领域的内功心法，阅读这本书其实是为了印证一些自身在CSS学习上的一些东西，所以有了这篇读书笔记，记录一些我不是很清晰的知识点。

&emsp;&emsp;1、**伪类选择器**：一般指前面有个英文冒号(:)的选择器，如`first-child`或`:last-child`等。
&emsp;&emsp;2、**伪元素选择器**：就是有连续两个冒号的选择器，如`::first-line`、`::first-letter`、`::before`、`::after`等。P.S：单、双冒号都是现在的规范，为了区分伪类和伪元素。IE8仅支持单冒号的伪元素。
&emsp;&emsp;3、后代选择器：选择所有合乎规则的后代元素。用空格连接。
&emsp;&emsp;4、相邻后代选择器：仅选择儿子(一层后代)元素，用>连接。
&emsp;&emsp;5、`>、~、+`选择器适用于IE7以上版本。<escape><!-- more --></escape>
&emsp;&emsp;6、通常把HTML标签分为两种：块级元素和内联元素。
&emsp;&emsp;7、块级元素和`display: block`不是一回事，但是它们都具备一个基本特征:一个水平流只能单独显示一个元素。
&emsp;&emsp;8、具有换行特性的"块级元素"(笔记7的综合体)，可以配合clear属性来清除浮动带来的影响。
&emsp;&emsp;9、实际开发中不会使用`display: list-item`来配合清除浮动。
&emsp;&emsp;&emsp;理由①:会出现不必要的项目符号`·`,但是可以通过`list-style: none`规避。
&emsp;&emsp;&emsp;理由②:IE不支持伪元素设置`display: list-item`，普通元素设置有效。
&emsp;&emsp;10、a标签默认display是inline。
&emsp;&emsp;11、**替换元素：根据其标签和属性来决定元素的具体显示内容，即内容可被替换**，如`input, textarea, select, img, video, object`等。它们具备了一些其他特性，如**内容的外观不受页面上的CSS影响**，**有自己的尺寸**：像`video、iframe、canvas等`这些默认尺寸为**300X150px**，`img等`则是0，表单无明显规则。**在很多CSS属性上有自己的一套表现规则**：如`vertical-align`的默认值为baseline，在非替换元素，对应西方字符x的下边缘，而替换元素由于几乎不可能出现字符这种，所以变成了元素的下边缘。**替换元素尺寸的计算优先级：CSS样式设置 > HTML内联属性 > 固有。**如果发生了只设置了`width`没有设置`height`的情景怎么办？**最终height = width X 原图高宽比例。**
&emsp;&emsp;12、理解样式属性的意义，规避不必要的样式书写，减少性能损耗：
&emsp;&emsp;栗子1：当我们修改a标签成`display: block`的时候，它已经具备了块级特性，即它本身会有流的自然填充性，它会像流一样自动铺满外部容器空间。但是，如果你设置了宽度，不论是百分比还是固定值，它的流动性就丢失了。见书中提供的`width: 100%`流破坏和自然流填充对比[Demo](https://demo.cssworld.cn/3/2-3.php)。
&emsp;&emsp;栗子2：`*{box-sizing: border-box}`，这种通配符的属性选择器应当尽量避免，因为比如search类型的搜索框，其默认的`box-sizing`就是`border-box`，这种重复赋值就是一种损耗，再比如普通内联元素(**非图片**等替换元素)，`box-sizing`无论是什么值，对渲染表现都没有影响，同样设置这种就是无意义的赋值。
&emsp;&emsp;13、在本书中，作者将CSS的盒模型分为了"外盒"以及"内盒"，两者对应具有"外部尺寸"以及"内部尺寸"。流的自然填充性就是依赖于外部尺寸的作用。
&emsp;&emsp;14、**格式化宽度**：该宽度仅出现在`position: absolute`或`position: fixed`情形中，这种情形下，宽度表现为"包裹性"，宽度由内部尺寸决定。但是对于非替换元素，如果left/right，top/bottom这种对向属性同时存在的时候，宽度将会呈现为"格式化宽度"，表现形式就是相对于最近的具有定位特性的祖先元素计算。
&emsp;&emsp;15、在本书中作者有提到"宽度分离原则"，文中的解释为CSS中的width属性不与影响宽度的padding/border属性共存，即外层容器单独设置width属性，margin、border、padding利用流动性在内部自适应实现。这种设置的目的在于：使宽度严格按照我们预期的设计图宽度生效，用"人话"来说，`width = content-width + padding-width + border-width`。
&emsp;&emsp;16、当然我们实际使用的时候，提供了`box-sizing: border-box`，这种设置的效果与笔记15中的宽度分离原则一致。默认情况下是
`box-sizing: content-box`，即`content-width =  width+ padding-width + border-width`。
&emsp;&emsp;17、对height属性，如果父属性height为auto，只要子元素在文档流中，其设定的百分比值会被完全忽略。举一个冗余的为div设置背景的样式。
```javascript
div {
  width: 100%;  /*多余*/
  height: 100%; /*无效*/
  background: url(bg.jpt);
}
```
&emsp;&emsp;这样设置的结果就是高度永远为0，实践的结果是**百分比高度值要生效，其父级必须有一个可以生效的高度值**。规范中如此描述：**如果包含的高度没有显示指定(即高度由内容提供)，且该内容非绝对定位，则计算值为auto**，而auto自然是没办法跟百分比计算的。
&emsp;&emsp;18、根据浏览器渲染顺序，其实按DOM自上而下渲染，可以看出嵌套的样式外部是先固定下来的，所以不存在那种不断根据自适应改变进行无限的宽高变化。
&emsp;&emsp;19、`max-width`和`max-height`的应用场景一定是自适应布局或流体布局中：以一个最常见的适配场景为例，虽然我们现在使用的显示器大多数都是默认1920X1080分辨率的，但是，还是有很多以前的小屏幕分辨率机型，这种可能是古董台式机，也有可能是小屏的笔记本电脑。我自身在工作时，就遇到过笔记本是1600X900分辨率的业务，此时，通过这两个属性就能让宽度在设定的区间内自适应：
```javascript
.container {
    min-width: 1600px;
    max-width: 1920px;   
}
```
&emsp;&emsp;除此之外，它们的兼容性很好，IE7开始就支持了。
&emsp;&emsp;20、以前我的认知里面`!important`对样式的权重是最高的，但是像`max-width`属性如果小于`width`属性将会直接将其覆盖，如果大于，当然还是以`width`显示。
&emsp;&emsp;21、同时存在`min-width`和`max-width`的描述，那么最大者生效。
&emsp;&emsp;22、`max-width`和`max-height`的初始值是**none**，`min-width`和`min-height`的初始值是**auto**。
&emsp;&emsp;23、`max-height`的一种应用：**任意高度元素的展开收起动画技术**，[传送门](https://demo.cssworld.cn/3/3-2.php)。这种是原生的CSS3实现，传统可以用JQ的`slideUp()`或`slideDown()`。如果元素内容是固定的，即高度固定时，可以用`height`+`overflow: hidden`实现。当内容是不确定的时候，想通过动画操作实现从0到内容高度，那么动画结束的样式应该是`height: auto`，前面我们也记录过，**auto没办法和百分比计算**。此时我们改用`max-height`，只需要保证它是一个比展开的内容高度值更大的值即可。那么在动画计算的时候，取的就是height的计算高度。当然这个`max-height`在文中还有别的限制，因为其在过高的情况下，由于收起恢复到原本高度需要时间，并且在变化过程中区域不会被隐藏，会给人一种延迟感。综上，**max-height的取值应当是一个比内容高度高，同时不能高出太多的值，怎么界定太多呢，即视觉残留不能有明显的延迟感。**
&emsp;&emsp;24、移动端的CSS3动画支持良好，所以移动端的JS框架都是没有动画模块的(原文，本人没确认过)。
&emsp;&emsp;25、**假想盒**：规范中有如此描述，每一个行框盒子前，会有一个宽度为0但是具有元素字体和行高属性的内联盒子，我们把这个假想盒称为支柱。注：假想盒仅在HTML5文档声明中出现。
&emsp;&emsp;26、Web开发时，为了提高加载性能以及节约带宽费用，**首屏以下**的图片会通过滚屏的方式异步加载。常采取的方案是直接使用`<img>`占位，然后设置样式：```css
img { visibility: hidden; }
img[src] { visibility: visible; }
```
&emsp;&emsp;注，此处的`<img>`是直接没有src属性。因为**即便是`src=""`，在很多浏览器下依然会有请求，并且请求的是当页数据。**
&emsp;&emsp;27、内联标签设置宽高样式是无效的，但是可以通过转换display成块级生效。
&emsp;&emsp;28、`img`标签在Firefox下带src属性时，不会被识别为替换元素，而是普通内联元素，即会有笔记27的问题。
&emsp;&emsp;29、**基于伪元素的图片内容区域预处理技术**，这个demo我觉得挺有意思的，见[传送门](https://demo.cssworld.cn/4/1-2.php)。主要的知识点是，`::before`和`::after`这种伪元素作用在`img`上是有限制的，对IE来讲，暂不支持这样操作，对CHROME和FF，有额外的附加条件：**①不能有src属性(Both)，②不能使用content属性生成图片(Chrome)，③需要有alt属性并有值(Chrome)，④`::before`伪元素的content值会被无视，`::after`则无问题(FF)。
**
&emsp;&emsp;30、作者观点：**替换和非替换元素之间只隔一个src属性。**对于CHROME而言，它还需要一个alt不为空的值才会成立。对于IE而言，它的确在没有src属性的时候还是表现为替换元素，这是因为IE有个默认的占位替换内容，当src缺失的时候，会默认用这个占位内容去替换(高版本的IE透明化处理了，IE8下会显示)。
&emsp;&emsp;31、作者观点：**替换元素和非替换元素之间只隔了一个CSS content属性**。见[传送门](https://demo.cssworld.cn/4/1-4.php)，这是一个EMOJI替换的处理，不过这种hover下只是切换样式，实际上img里的资源在渲染的时候已经下载了，所以不管切不切换显示，保存的都是老图。
&emsp;&emsp;32、**替换元素的固有尺寸无法修改**，即使用content设置了背景图后，我们无法调整大小，若是在移动端使用这种方法设置背景，原比例的图会导致图片模糊(retina屏幕需要2倍图)，推荐使用SVG图，矢量图随意缩放不会失真。
&emsp;&emsp;33、使用content属性生成的文本无法被选中也无法被屏幕阅读设备读取也无法被搜索引擎抓取，即不利于SEO，**它只适合用来生成一些无关紧要的内容，如装饰图、序号**。
&emsp;&emsp;34、`:empty`伪类选择器用来匹配无内容的元素，用伪元素`::after`生成的content内容不会影响实体内容。
&emsp;&emsp;35、content动态生成值无法获取。
&emsp;&emsp;36、`getComputedStyle`可以获取伪元素的计算样式，`window.getComputedStyle(DOM，"::after").content`。
&emsp;&emsp;37、content内容生成应用：①辅助元素生成，如清除浮动：
```css
.clear:after {
    content: '';
    display: 'block';
    clear: both;
}
```
&emsp;&emsp;再如等分空间的柱状图，[传送门](https://demo.cssworld.cn/4/1-7.php)，核心在于通过`:before`实现底对齐，`:after`实现两端对齐。②字符内容生成：[传送门](https://demo.cssworld.cn/4/1-8.php)，原理就是通过`@font-face`自定义字体集合，然后替换文本内容。除此之外，这个`content`也可以为Unicode字符，比如`\A`换行(LF)，`\D`回车(CR)。配合CSS3  animation的loading demo，[传送门](https://demo.cssworld.cn/4/1-9.php)。③图片生成，`content: url()`，适用于png、jpg、svg、ico、base64URL等，但是不支持CSS3渐变背景图(`linear-gradient`)。
&emsp;&emsp;38、**HTML5可以接受自定义标签，浏览器默认样式没有规范，会被应用缺省inline，向下兼容，IE8等低版本不识别，会直接显示其内容。**