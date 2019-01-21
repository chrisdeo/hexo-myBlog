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
&emsp;&emsp;37、content内容生成应用：
&emsp;&emsp;①辅助元素生成，如清除浮动：
```css
.clear:after {
    content: '';
    display: 'block';
    clear: both;
}
```
&emsp;&emsp;再如等分空间的柱状图，[传送门](https://demo.cssworld.cn/4/1-7.php)，核心在于通过`:before`实现底对齐，`:after`实现两端对齐。
&emsp;&emsp;②字符内容生成：[传送门](https://demo.cssworld.cn/4/1-8.php)，原理就是通过`@font-face`自定义字体集合，然后替换文本内容。除此之外，这个`content`也可以为Unicode字符，比如`\A`换行(LF)，`\D`回车(CR)。配合CSS3  animation的loading demo，[传送门](https://demo.cssworld.cn/4/1-9.php)。
&emsp;&emsp;③图片生成，`content: url()`，适用于png、jpg、svg、ico、base64URL等，但是不支持CSS3渐变背景图(`linear-gradient`)。
&emsp;&emsp;④利用content开启符号闭合，一种使用`open-quote`和`close-quote`实现的方式：通过 `选择器 { quotes: '前引号插入内容' '后引号插入内容'; }`配合`选择器:before { content: open-quote; }`以及`选择器:after { content: close-quote; }`实现。另一种则是直接把这种`quote`放到`content`内容中直接书写：`伪元素before/after选择器: { content: '你要加的内容'; }`。
&emsp;&emsp;⑤**通过attr属性设置content内容：`img::after { content: attr(alt) }`，注：attr内可以传入原生HTML属性以及自定义data-X属性且这些属性不能带引号。**
&emsp;&emsp;⑥content计数器：这种应用，需要先掌握几个核心的方法属性，`{ counter-reset: 变量命名1 数值1 变量命名2 数值2 ···; }`这是一个初始化计数器的动作并且**能够同时指定多个计数器**，数值内容在CHROME下可以是负数，如果是小数则向下取整；但在FF和IE下不会识别，视作0处理；除了指定数值，还能够设置`none`和`inherit`来取消重置和继承重置。具体见[传送门](https://demo.cssworld.cn/4/1-11.php)。`counter-increment`属性的值可以是`counter-reset`指定的一个或多个关键字，后面可选跟随数字，表示每一次增加的值，缺省值为1。`counter-increment`可以被多次触发，即在`::before`和`::after`中的该属性都会被触发，然后通过`counter(关键字)`输出结果。`counter()/counters()`方法类似于CSS3的`calc()`方法，比较有意思的一点是，`counter()`还能接收第二个参数`style`，它对应的是`list-style-type`支持的属性值，即递增的显示可以不只是单纯数字，也可以是罗马字、英文等，见[传送门](https://demo.cssworld.cn/4/1-16.php)。**content里可以调用多个counter()**。`counters(name, string，style可选)`的`string`**传参需要引号包围，并且是必传**，它用来表示子序号的连接字符串，那子序号需要重新定义关键字么？其实不需要，`counter-reset`设定的关键字仅对他最近的层级生效(唯一性)，即同一个初始名，但其实不同嵌套初始化的不共享这个值**，见[传送门](https://demo.cssworld.cn/4/1-18.php)。**
&emsp;&emsp;**注：设置了counter/counters方法显示输出样式的DOM在文档流中必须在设置`counter-increment`元素的后面才有技数效果。**
&emsp;&emsp;38、**HTML5可以接受自定义标签，浏览器默认样式没有规范，会被应用缺省inline，向下兼容，IE8等低版本不识别，会直接显示其内容。**
&emsp;&emsp;39、笔记16中，我们知道了设置`box-sizing: border-box`以后，`width`成了真正意义上的总宽度。但如果是具有块状特性的元素且内部padding足够大，怎么样算足够大？比如总宽度是100px，横向左右padding和为120px，那么最终宽度是120px。
&emsp;&emsp;40、对内联元素来说，它们没有可视宽度和高度，即`clientHeight`和`clientWidth`永远是0。垂直方向上的行为表现完全受`line-height`和`vertical-align`的影响。
&emsp;&emsp;41、内联元素的垂直padding，**可以用来扩大链接或按钮的点击区域，同时不会影响到现有布局**，还有一种`登陆 | 注册`管道符的demo，见[传送门](https://demo.cssworld.cn/4/2-2.php)。
&emsp;&emsp;42、对于非替换元素的内联元素，不仅padding不会加入**行盒高度**计算，margin和border也不会参与计算，它们的**表现形式是在内联盒周围发生渲染**。
&emsp;&emsp;43、**padding属性：**
&emsp;&emsp;①不支持负值。
&emsp;&emsp;②支持百分比，块级元素`div { padding: 50%; }`可以撸出一个正方形，但是内联元素由于有假想盒的存在(笔记25)，会有个额外的高度导致最终宽高不等，解决方案很简单，其实就是用控制内联高度的方式即`font-size`解决该问题：
```css
    span {
        padding: 50%;
        font-size: 0;
        background-color: gray;
    }
```
&emsp;&emsp;注：padding百分比无论是水平还是垂直方向上都是**相对于宽度**计算的。
&emsp;&emsp;44、头图兼容性较好的做法(包括IE6在内的大部分浏览器)，[传送门](https://demo.cssworld.cn/4/2-3.php)。
&emsp;&emsp;45、内联元素的padding在文字较多的时候可能会出现断行。
&emsp;&emsp;46、标签元素存在内置padding，`ol/ul`内置padding单位是px。如果列表中的font-size很小，则`li`元素内的`ul`或`ol`左边缘就会离文本内容区域很远，反之font-size很大就会出现项目符号跑到元素外的情况。当`font-size`在12px-14px时，22px是一个较好的padding-left设定值，所有浏览器都能正常显示。不过为了更佳的体验，用content计数器用法更舒服。
&emsp;&emsp;47、button的padding在设置为0的时候，在FF下依旧会保留左右的padding。可以通过`button::-moz-focus-inner { padding: 0; }`来解决这个兼容问题。
&emsp;&emsp;48、IE7下button内文字过多会使左右padding逐渐变大。
&emsp;&emsp;49、**padding可以配合background-clip属性实现一些CSS图形的绘制效果**。
&emsp;&emsp;50、**元素偏移尺寸：**对应元素的border box尺寸，如`offsetWidth`和`offsetHeight`。
&emsp;&emsp;51、**元素内部尺寸：**对应元素内部区域尺寸，即padding box尺寸，包括padding但不包括border。如`clientWidth`和`clientHeight`。
&emsp;&emsp;52、**元素外部尺寸：**对应元素外部区域尺寸，包括padding、border以及margin。即margin box尺寸，没有原生DOM API，JQ中可以使用`$().outerWidth(true)`和`$().outerHeight(true)`来控制。
&emsp;&emsp;53、对于margin，元素设定width值或者保持"包裹性"的时候，margin对尺寸没有影响。只有在**空间可被充分利用**的条件下是可以被影响的，那啥是**空间可被充分利用**呢？比如说有父子DOM嵌套关系，分别有`father`和`son`的class，那么如果在`father`设置width，`son`不设置宽度，设置margin就会影响到自身的宽度，以下面代码为例，最后`son`宽度就是340px，并且这种条件下，垂直方向的高度也可以改变。
```css
<div class="father">
    <div class="son"></div>
</div>
.father {
    width: 300px;
}
.son {
    margin: 0 -20px;
}
```
&emsp;&emsp;那这种充分利用的特性带来了什么实际场景中的应用？比如：**一侧定宽的两栏自适应布局**，见[传送门](https://demo.cssworld.cn/4/3-1.php)。其实本质就是`margin`来扩充了父级的宽度，然后内部两栏，一栏为固定死的，另一栏自适应剩余部分的结果。再比如**表格间隙多余的最后一项消除的替代方案**，举个例子，我们想要我们的每一条`li`之间产生20px的间隙，那么一般来讲会设置一个`margin-right: 20px;`，但事实上，换行的时候，最后一项就会多出一个间隙，消除手段通常是在这个元素上生成的时候，附加一个`margin-right: 0;`的样式类或用CSS3的nth-of-type选择器(不考虑IE8)。**现在充分利用margin这种改变布局的特性，我们可以在父容器给一个`margin-right: -20px;`，子元素则根据剩余部分自适应，那么多余的20的px相当于就被抹除了！**
&emsp;&emsp;54、**不同浏览器的滚动条触发规则：**Chrome是子元素超过content-box尺寸触发，IE和FF则是超过padding-box触发。这种规则会导致`padding-bottom`在IE和FF下失效。
&emsp;&emsp;55、笔记54中我们知道了`padding-bottom`有兼容性问题，即在页面底部留白时，我们不应使用`padding`来控制，而可以转投笔记53中的利用特性，使用`margin`扩充纵向留白。
&emsp;&emsp;56、**利用margin外部尺寸来实现等高布局，[传送门](https://demo.cssworld.cn/4/3-2.php)，核心见下面代码：**
```css
.column-box {
    overflow: hidden;
}
.column-left,
.column-right {
    margin-bottom: -9999px;
    padding-bottom: 9999px;
}
```
&emsp;&emsp;57、**margin的百分比值同padding一样，无论是水平还是垂直方向上都是相对于宽度计算的。**
&emsp;&emsp;58、**像`<h1>、<p>、<ul>`这些标签是有默认垂直方向的`margin`值的，并且单位是`em`这种相对字体的单位。**这里作者说了他的理解，我觉得没啥毛病，即如果`margin`使用`px`这种绝对单位，当字体`font-size`变大了，那么整个容器其实宽高还是那么大就会造成内容臃肿在一起。而使用`em`它是根据父元素的`font-size`按比例算的，所以`margin`会跟着自适应变大，整个容器的排版依旧能够保持一致。
&emsp;&emsp;59、**margin的合并问题：**
&emsp;&emsp;①：只发生在块级元素上(不包括那些通过浮动和绝对定位产生块级特性的元素)。
&emsp;&emsp;②：只发生在垂直方向上(前提是不通过`writing-mode`改变方向)。
&emsp;&emsp;60、**margin的合并场景：**
&emsp;&emsp;①：相邻兄弟元素margin合并。
&emsp;&emsp;②：父级和第一个子元素或者最后一个子元素的合并(**如果父级没有声明垂直`margin`，子级声明的垂直`margin`将被合并到父级去，[传送门](https://demo.cssworld.cn/4/3-3.php)**)。
&emsp;&emsp;③：空块级元素的margin合并(这里这个空的块提不提供margin垂直方向上的值，它都会产生合并特性)。
&emsp;&emsp;61、引出笔记61前，让我们先温习一下啥是**BFC**，BFC英文全称是Block Formatting Context，即**块状**格式化上下文。BFC指的是页面布局中的一块区域，它拥有自己独有的内部渲染规则，**不受外部影响，同时也不会影响到外部区域**，所以BFC元素是不会发生margin重叠的情况;另外BFC也可以清除浮动带来的影响，原因也是那个不影响外部区域，假设它无法清除，那就会造成高度坍塌，破坏外部结构。除此之外，BFC还有一个很关键的用处：**自适应布局**，怎么自适应？当我们的元素形成BFC以后将不受外部影响，打个比方，如果他们同在一块浮动容器控制下，那么这块BFC将脱离控制，自动填满刨去其他浮动元素的剩余空间。
&emsp;&emsp;62、**如何触发BFC？**
&emsp;&emsp;①根元素(即html)。
&emsp;&emsp;②float属性不为none。
&emsp;&emsp;③position属性为absolute，fixed(不为relative和static)。
&emsp;&emsp;④display为inline-block,table-cell,table-caption,flex,inline-flex。
&emsp;&emsp;⑤overflow不为visiable时(auto、scroll或hidden)。
&emsp;&emsp;63、**消除margin合并的方式：**
&emsp;&emsp;***对于margin-top合并的情况:***
&emsp;&emsp;①父元素设置为BFC。
&emsp;&emsp;②父元素设置border-top。
&emsp;&emsp;③父元素设置为padding-top。
&emsp;&emsp;④父元素和第一个子元素之间添加内联元素进行分隔。
&emsp;&emsp;***对于margin-bottom合并的情况:***
&emsp;&emsp;①父元素设置为BFC。
&emsp;&emsp;②父元素设置border-bottom。
&emsp;&emsp;③父元素设置为padding-bottom。
&emsp;&emsp;④父元素和最后一个子元素之间添加内联元素进行分隔。
&emsp;&emsp;⑤父元素设置height、min-height或max-height。
&emsp;&emsp;64、**margin合并后的计算值：**
&emsp;&emsp;①正正取大。
&emsp;&emsp;②正负相加。
&emsp;&emsp;③负负最负(转成绝对值，取大)。
&emsp;&emsp;65、**margin合并的意义：**
&emsp;&emsp;①兄弟元素合并：和em作用类似，为了排版更加舒适。
&emsp;&emsp;②父子元素合并：在页面任何地方嵌套或直接插入空div都不会影响原本的块状布局。
&emsp;&emsp;③自身margin合并：避免不小心遗落或者生成的空标签影响原本的排版和布局。
&emsp;&emsp;66、**margin: auto的问题：**这个问题我觉得可以分为两种情况，第一种是元素**没有设置`width`和`height`**，**注意这里的设置即便值是`auto`也算设置**，它会自动填充父容器。另一种则是设置了宽高，这个时候前者的填充性被覆盖，根据"剩余空间"进行分配。
&emsp;&emsp;67、关于利用margin: auto来进行水平垂直居中的应用，我在[<<到底怎么样才能水平垂直居中喔>>](http://www.chendiyou.com/2019/01/07/%E5%88%B0%E5%BA%95%E6%80%8E%E4%B9%88%E6%A0%B7%E6%89%8D%E8%83%BD%E6%B0%B4%E5%B9%B3%E5%9E%82%E7%9B%B4%E5%B1%85%E4%B8%AD%E5%96%94/)一文中有对其进行应用的例子，但是那只是在**水平方向上**利用了该特性，垂直方向上其实使用的是`transform`来移动。那为什么**容器定高，元素定高，`margin: auto`无法垂直方向上居中呢？**因为触发`margin: auto`计算的一个前提条件是**当width或height为auto时，元素是具有对应方向的自动填充特性的**。见笔记66中第二种情况，设置宽高后该特性将被覆盖。所以没办法在按这种规则计算分配空间。在前文我提到的另一篇博客中有另一个方案对绝对定位元素的垂直居中进行控制，即在**对向属性上同时设置值**，这个时候该元素会表现为"格式化宽度和格式化高度"，见笔记14。
&emsp;&emsp;68、`margin: auto`的计算需要IE8及以上的浏览器才能支持。
&emsp;&emsp;69、内联非替换元素的垂直margin无效，但替换元素的垂直margin有效，并且没有margin合并的问题，所以**图片永远不会发生margin合并**。
&emsp;&emsp;70、`tr`，`td`或者`display: table-cell`，`display: table-row`的元素margin都是无效的。
&emsp;&emsp;71、绝对定位元素非定位方向的margin值无效。
&emsp;&emsp;72、**定高容器的子元素的margin-bottom或定宽容器的子元素的margin-right无效**，这个就比较经典了，我自己在写需求的时候，就有一个地方需要使用绝对定位设置`margin-right`定位，但是却发现无效了。怎么理解这个问题呢？当我们想通过margin属性改变自身位置时，**必须是和当前元素定位方向一样的margin属性才行，否则设定的margin只能影响后面的兄弟元素或父元素**。这里的定位方向又是啥？对一般元素，默认流是左侧以及上方，那么只能通过`margin-left`和`margin-top`来影响元素定位。但是如果通过`float: right`或者绝对定位设置`right`属性，就会改变定位方向，就可以通过另一侧设置了。
&emsp;&emsp;**附：当absolute遇到left/top/right/bottom属性时，才变成真正的绝对定位元素。**其实这里涉及到一个相对性问题，当设置了一个方向的属性，那么那个水平或者垂直方向上的相对性将丢失，那这个相对性到底是个啥呢？
&emsp;&emsp;73、`border-width`不支持百分比值，除了使用固定数值，还支持关键词如`thin`，等同1px；`medium`，默认值等同3px；`thick`，等同4px。
&emsp;&emsp;74、`border-style`默认值为`none`。**你也可以通过设置`border-width: 0`来重置。**文中描述说如果同时对这两种属性进行设置，渲染性能最高？
```css
div {
    border: 1px solid;
    border-bottom: 0 none;  /* 渲染性能高的写法 */
}
```
&emsp;&emsp;75、`border-style: dotted`在IE下和在CHROME、FF下表现形式不同，前者是小圆点，后者是小方点。由于CSS的`border-radius`是在IE9浏览器才开始支持的，所以之前版本的IE圆角实现可以利用这种特性来hack模拟，本质就是结合`overflow: hidden`来隐藏多余点(当我们想单独得到一个圆的时候)。
```css
    .box {
        width:150px;
        height: 150px;
        overflow: hidden;
    }
    .dotted {
        width:100%;
        height: 100%;
        border: 149px dotted #cd0000;
    }
```
```html
    <div class="box">
        <div class="dotted"></div>
    </div>
```
![](chrome.jpg)
![](ie.jpg)
&emsp;&emsp;76、`border-style: double`上下两线border实线，值为1px和2px时，与solid表现形式一致。当3px开始才有双线表现，所以有笔记73中的medium默认值。
&emsp;&emsp;77、`border-color`在没有设定时，默认取color色值。
&emsp;&emsp;78、`border`与`transparent`的巧妙配合：`color: transparent`在IE9以上才支持，而`border-color: transparent`在IE7就支持了。
&emsp;&emsp;①右下角background定位：现在CSS3操作直接`background-position: right 数值 bottom 数值`即可。 文中提到的下面这种操作...em...我没实践出来。
```css
.box {
    border-right: 50px solid transparent;
    background-position: 100% 50%;
}
```
&emsp;&emsp;②**增大移动端点击按钮的可触区域：**第一种是在外层嵌套标签专门控制区域，第二种则是利用其自身的`padding`或`bottom`扩充区域大小。而设定`padding`在我们使用外部font库时，可能会造成中间图案定位问题，所以最佳方案是**使用透明border增加点击区域[传送门](https://demo.cssworld.cn/4/4-2.php)。**
&emsp;&emsp;③三角形等图片绘制。
```css
div {
    width: 0;
    border: 10px solid;
    border-color: #f30 transparent transparent;
}
```
&emsp;&emsp;79、块级元素负责结构，内联元素负责排版。
&emsp;&emsp;80、`line-height`行高的定义是两条`baseline`的间距，而`baseline`又对应着英文字母x的下边缘。`vertical-align`的默认值为`baseline`。而CSS中有一个概念`x-height`，它对应字母x的高度，等于等分线`mean-line`到基线`baseline`的距离。、
&emsp;&emsp;81、我们常用的`vertical-align: middle`并不是等分线`mean-line`处，而是基线往上1/2个`x-height`处。**所以我们有通过`vertical-align: middle`来进行垂直居中时，其实它并不是容器的垂直居中，而是我们字体样式的垂直居中。**
&emsp;&emsp;82、`ex`单位对应的就是`x-height`的高度，它是一个相对单位，不管字体字号如何改变，永远相对于这个变化。那么这个单位可以怎么利用呢？比如**基于ex单位的天然垂直居中对齐效果实例页面**，见[传送门](https://demo.cssworld.cn/5/1-1.php)。
&emsp;&emsp;83、`<div>`内容为空的情况高度为0，当添加文字后，高度被撑起，但本质上这个撑起的高度是由行高`line-height`属性绝对的而不是`font-size`。
&emsp;&emsp;84、前面我们提到了`font-size`，现在我们来看看`font-size`到底作用在啥子地方。首先，`line-height`的数值属性和百分比属性值都是相对于`font-size`计算的。而`vertical-align`又是根据`line-height`计算的，见笔记80。以下面的代码块为计算样例，最终的`vertical-align = 16px *　1.5 *　-0.25 = -6px`。
```css
p {
    font-size: 16px;
    line-height: 1.5;
}
p > img {
    vertical-align: -25%;
}
```
&emsp;&emsp;然后我们看看`font-size`的关键字属性值。
&emsp;&emsp;相对当前元素`font-size`计算的有：
&emsp;&emsp;①larger，`<big>`标签对应`font-size`大小。
&emsp;&emsp;②smaller，`<small>`标签对应`font-size`大小。
&emsp;&emsp;与当前元素`font-size`无关，**仅受浏览器设置的字号**影响：
&emsp;&emsp;①xx-large，和`<h1>`元素计算值一样。
&emsp;&emsp;②x-large，和`<h2>`元素计算值一样。
&emsp;&emsp;③large，和`<h3>`元素计算值相似(偏差值在1px以内)。
&emsp;&emsp;④**medium**，`font-size`的初始值，和`<h4>`的元素计算值一样，为16px。
&emsp;&emsp;⑤还有与large相对格式的small。
&emsp;&emsp;85、浏览器默认`font-size`大小是16px，所以设置`font-size: 87.5%`和`font-size: 14px`是等价的。
&emsp;&emsp;86、**Chrome下有一个12px的字号限制**，就是文字的font-size计算值不能小于12px，由于Chrome的特殊性，我们通常进行移动端em、rem适配的时候，就不能直接设置
```css
html {
    font-size: 62.5%;
}
```
&emsp;&emsp;这样计算结果是10px，换算成em，如果是直属父级，或rem就是1em/1rem，但是Chrome老哥说，我觉得不行，因为只要小于12px且不为0的大小我就觉得它是12px大小的，什么？你问是0的时候Chrome怎么看？那当然是0咯。那怎么弄呢，可以设置成625%，即100px。既便于计算又不会有之前的问题。
&emsp;&emsp;87、**希望隐藏logo对应元素内的文字，除了`text-indent`缩进隐藏外，还可以通过设置`font-size: 0`。**
&emsp;&emsp;88、`font-family`默认值由操作系统和浏览器共同决定。它支持两类属性值，一类是“字体名”，一类是“字体族”，如果字体名包含空格需要使用引号包裹，不区分大小写，且如果有多个字体设定将遵从从左往右依次匹配本地是否有对应的字体。
&emsp;&emsp;字体名用法：
```css
body {
    font-family: simsun;
}
body {
    font-family: 'Microsoft Yahei', 'PingFang SC';
}
```
&emsp;&emsp;字体族分类：
&emsp;&emsp;①serif衬线字体
&emsp;&emsp;②sans-serif无衬线字体
&emsp;&emsp;③monospace等宽字体
&emsp;&emsp;④cursive手写字体
&emsp;&emsp;⑤fantasy奇幻字体
&emsp;&emsp;⑥system-ui系统UI字体
&emsp;&emsp;89、关于float，**浮动的本质就是为了实现文字环绕的效果**，文章原话。
&emsp;&emsp;90、float特性：
&emsp;&emsp;①**包裹性**，由两部分组成，包裹和自适应性。包裹可以理解为，具有`float`设定的容器的宽高将会以嵌套的内容宽高为表现。自适应则是浮动元素嵌套的元素如果是多个，将会自适应分配剩余空间。
&emsp;&emsp;②**块状化**格式上下文(BFC)
&emsp;&emsp;③破坏文档流
&emsp;&emsp;④无任何margin合并
&emsp;&emsp;91、笔记85中的第二条中，强调了块状化的说法，那么**什么是块状化？**即一旦float属性不为none，则display计算值将是`block`或者`table`。像以下的写法都是冗余的：
```css
span {
    display: block;  /* 多余 */
    float: left;
}
span {
    float: left;
    vertical-align: middle; /* 无效 控制内联的你还指望在块级里搞事情？ */
    text-align: center; /* 无效 */
}
```
