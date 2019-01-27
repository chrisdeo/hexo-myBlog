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
&emsp;&emsp;14、**格式化宽度**：该宽度仅出现在`position: absolute`或`position: fixed`情形中，这种情形下，宽度表现为"包裹性"，**宽度由内部尺寸决定**。但是对于非替换元素，如果left/right，top/bottom这种对向属性同时存在的时候，宽度将会呈现为"格式化宽度"，表现形式就是相对于最近的具有定位特性的祖先元素计算。
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
<p><img src="./chrome.jpg" style="display: inline-block;margin-left: 120px;"><img src="./ie.jpg" style="display: inline-block;margin-left: 175px;"></p>&emsp;&emsp;76、`border-style: double`上下两线border实线，值为1px和2px时，与solid表现形式一致。当3px开始才有双线表现，所以有笔记73中的medium默认值。
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
&emsp;&emsp;①serif 衬线字体，即那些横竖撇捺、张弛有度，有深有浅的字体。
&emsp;&emsp;②sans-serif 无衬线字体(现在更普适的使用字体)，即那些所有笔画都差不多粗细的字体。
&emsp;&emsp;以上两者还可以和具体字体名写在一块，但是必须写在最后，因为大多数浏览器下，写在这两种属性后面的字体会被忽略。
```css
body {
    font-family: "Microsoft Yahei", sans-serif;
}
```
&emsp;&emsp;③monospace 等宽字体，这种一般针对英文字体而言，即每个字符在同等`font-size`下宽度相同。这种特性的其中一种应用就是在模拟选择栏中的`solid`、`dashed`这些效果时，使它们长度相当，见[穿送门](https://demo.cssworld.cn/8/2-1.php)。`ch`单位结合等宽字体特性进行手机长度校验这类的宽度控制。`ch`本身是一个相对单位，它对应着阿拉伯数字0的宽度，CSS3才开始支持该单位。
&emsp;&emsp;④cursive 手写字体
&emsp;&emsp;⑤fantasy 奇幻字体
&emsp;&emsp;⑥system-ui 系统UI字体
&emsp;&emsp;89、`font-weight`同样支持关键词属性和具体的数值，如`normal`，`bold`，`lighter`，`bolder`，数值从100到900(间隔100为一个关键词)，其中400对应`normal`，700对应`bold`。关于`lighter`和`bolder`是对继承的`font-weight`进行解析的，解析规则如下，这里需要注意的是，系统里面需要安装了该字体家族的全部字重字体才能将所有解析情景呈现，否则缺失的字重字体是无法解析的，即没有表现形式。
<table><thead><tr><th>继承的值</th><th>bolder</th><th>lighter</th></tr></thead><tbody><tr><td>100</td><td>400</td> <td>100</td></tr><tr><td>200</td><td>400</td><td>100</td></tr><tr><td>300</td><td>400</td><td>100</td></tr><tr><td>400</td><td>700</td><td>100</td></tr><tr><td>500</td><td>700</td><td>100</td></tr><tr><td>600</td><td>900</td><td>400</td></tr><tr><td>700</td><td>900</td><td>400</td></tr><tr><td>800</td><td>900</td><td>700</td></tr><tr><td>900</td><td>900</td><td>700</td></tr></tbody></table>
&emsp;&emsp;90、`font-style`属性值有`normal`，`italic`，`oblique`，其中要提的一点差异是`italic`与`oblique`，这两者都是指斜体控制，那么有什么区别呢，答案就是如果当前字体有设定专门的斜体字体，那么`italic`会取那个专门的“样式”，如果没有就会适应成`oblique`，`oblique`仅单纯地让文字倾斜。
&emsp;&emsp;91、缩写的`font`属性：它的基本语法组成有`[ [ font-style || font-variant || font-weight ] ? font-size [ / line-height ] ? font-family ]`，其中`font-size`和`font-family`是必选的。值得注意的是这种缩写的`font`属性将会破坏部分属性的继承性。原文对这块的例子解释，我觉得有点绕人的意思，概括下来就是当你想用`font`内的`font-weight`属性时，`line-height`将会被覆盖成这个值，并且不同浏览器的这个值是不一样的，存在兼容性问题。另外，由于`font-family`是必选项，当这个属性很长的时候，后面继承的时候就会挂很长的列表。文中提供了如下两种解决方式：
&emsp;&emsp;①设置一个不存在的字体名占位，然后再设置`font-family: inherit`来重置这个占位字体。
&emsp;&emsp;②利用`@font face`将我们的字体列表重定义为一个字体。
&emsp;&emsp;92、关于`@font face`，我们常在字体图标技术中应用它：本质是一个定义字体或字体集的变量，它不仅可以简单定义字体，还包括字体重命名，默认字体样式设置等。需要我们关注的属性包括`font-family`，`src`，`font-style`，`font-weight`和`unicode-range`。这里主要记录一下`src`和`unicode-range`，其余的前文我们有过描述。`src`表示引入的字体资源，如果使用系统安装字体可以使用`locale()`功能符，该功能符IE9及以上版本才支持。而`unicode-range`则是可以替换特定字符或者特定范围内的字符为我们指定的字体(IE8不支持)，如下面这个替换前后双引号的demo。

```css
@font-face {
    font-family: quote;
    src: local('SimSun');
    unicode-range: U+201c, U+201d;
}
.font {
    font-family: quote, 'Microsoft Yahei';
}
```

&emsp;&emsp;93、`text-indent`用于对文本进行缩进控制，我们可以使用`text-indent`负值隐藏文本内容，这种操作可以应用在将网站的标记放在`<h1>`这种标题标签中然后隐藏，利于SEO。**关于`text-indent`为负值的情景，要注意百分比和数值的区别：百分比是根据当前元素的包含块来运算的，而数值则是当前内联盒子，见[实例](https://demo.cssworld.cn/8/6-1.php)。**有一点需要注意，一些设备在`text-indent负值`特别大的时候可能会存在卡顿和性能风险，以及对于一些屏幕阅读软件不会读取越界的内容，将给无障碍阅读用户带来困扰。
&emsp;&emsp;94、**`text-indent`仅对第一行内联盒子内容有效。**
&emsp;&emsp;95、**非替换元素意外的`display`计算值为`inline`的内联元素设置`text-indent`无效。**在生效时，注意是否存在嵌套的子元素，由于继承性，如果你还想对其进行别的控制，需要在子元素上覆盖这个值。
&emsp;&emsp;96、`<input>`的`text-indent`值无效，`<button>`的`text-indent`有效但是存在兼容性问题，IE下百分比根据容器计算，Chrome和FF以及其他Shadow DOM元素浏览器百分比按照自身尺寸计算。
&emsp;&emsp;97、`letter-spacing`用来控制字符之间的间距，具有继承性。默认值是`normal`而非0，支持负值，当值足够大的时候，会让字符重叠甚至反向排列。
&emsp;&emsp;98、`word-spacing`与`letter-spacing`特性类似，但前者仅作用在空格字符上。啥意思呢？它生效的条件是你首先得有空格存在。
&emsp;&emsp;99、`word-break`属性有`normal`：默认的换行规则；`break-all`：允许任意非CJK(中日韩)文本单词断行；`keep-all`：不允许CJK单词换行，**只能在半角空格或连字符处换行**。非CJK的文本行为实际上和normal一致。**目前移动端不支持`keep-all`属性**。
&emsp;&emsp;100、`word-wrap`在CSS3中有了另外的命名`overflow-wrap`，但是考虑到兼容性问题我们还是用以前的写法，属性有`normal`，正常换行规则；`break-world`，一行单词中是在没有其他靠谱的**换行点**再换行，这个换行点比较关键，具体见[传送门](https://demo.cssworld.cn/8/6-5.php)。
&emsp;&emsp;101、`white-space`用于处理元素内的空白字符(包含了Space、Enter、Tab产生的空白)。属性有`normal`：合并空白字符和换行符；`pre`：空白字符不合并，并且内容只在有换行符的地方换行；`nowrap`：合并空白字符，但不允许文本环绕；`pre-wrap`：`pre`的作用上同时允许文本环绕；`pre-line`：合并空白字符，但只在换行符的地方换行，允许文本环绕。
&emsp;&emsp;102、`white-space`设置`nowrap`时，元素宽度表现为"最大可用宽度"，换行符和一些空格合并，文本一行显示。以下是常见的应用场景：
&emsp;&emsp;①包含块尺寸过小处理。
&emsp;&emsp;②单行文字溢出点点点效果(配合`text-overflow: ellipsis`)。
&emsp;&emsp;③水平列表切换效果，[DEMO](https://demo.cssworld.cn/8/6-6.php)。
&emsp;&emsp;103、`text-decoration`下划线和文本重叠问题如何解决？结合`text-decoration: none`以及设置`border-bottom`和`padding-bottom`。
&emsp;&emsp;104、`text-transform`这个属性就比较有趣了，它是为英文字符定制的，可以将这些字符进行大小写转化。属性也比较简单`uppercase`和`lowercase`。应用价值也极高，比如我们在输入验证码、身份证这些信息时，如果有强校验大写，这种转化无异于帮我们省了一个重大工序。
&emsp;&emsp;105、`:first-letter`是用来选择首字符进行操作的，不过这里的首字符比较特殊，里面有个比较神奇的设定：就是一些常见的标点符号在`:first-letter`眼中是"附赠品"，什么意思呢？当这些附赠品出现在头部时，它们就像赠品一样默认受我们的选择器影响，然后直到我们真正意义上的首字符(商品)变化为止。其次`:first-letter`生效的前提是`display`值为`block`、`inline-block`、`list-item`、`table-cell`或`table-caption`，其他如`table`、`flex`都无效。另外`:before`伪元素的`content`内容会影响`:first-letter`，即里面的内容将会被优先作用。下面看看它支持的CSS属性：
&emsp;&emsp;①所有字体相关属性。
&emsp;&emsp;②所有背景相关属性。
&emsp;&emsp;③所有margin相关属性。
&emsp;&emsp;④所有padding相关属性。
&emsp;&emsp;⑤所有border相关属性。
&emsp;&emsp;⑥color属性。
&emsp;&emsp;⑦`text-decoration`等修饰用属性。
&emsp;&emsp;不能使用`visibility`、`display`这些去控制显隐性。
&emsp;&emsp;`:first-letter`具有嵌套选择的能力，比如`<p>`下嵌套了一个`<span>`，`<span>`外没内容，能够直接选择到`span`内的首字符。
&emsp;&emsp;`:first-letter`其实是作为子元素存在的，所以在衡量特指度权重的时候，**相同属性声明，它的级别一定会比父级高**，因为先继承再覆盖。
&emsp;&emsp;实际应用：如在字段、金额前加符号标记。
&emsp;&emsp;106、`:first-line`没有笔记105中"附赠品的"操作，两者支持的CSS属性相近。这一类的伪元素选择器视作子元素，跟前文中一样，存在总是高一级样式权重的特征。在标签嵌套的时候有所不一样，它不支持`table`相关属性(`inline-block`/`inline-table`)，[DEMO](https://demo.cssworld.cn/8/7-2.php)。文中对该选择器的应用举了个覆盖父级的例子：按钮具有一个全局的颜色控制，但是按钮的字体不就被遮了么，用`:first-line`指定颜色，就可以规避这个问题。
&emsp;&emsp;107、**关于颜色的关键字：**如果浏览器能够识别关键字，不会有什么问题，但如果浏览器无法识别的话，在HTML和CSS中定义的这个关键字将会产生不同的解析结果。前者，会有特殊的算法替换这个颜色，后者则会直接使用默认颜色。
&emsp;&emsp;108、`background-color: transparent`IE6就开始支持，`border-color: transparent`IE7开始支持，但`color: transparent`从IE9才开始支持(高版本的IE8兼容可以透明化，但是用户实际上使用的都是原生IE8)。
&emsp;&emsp;109、`currentColor`使用当前`color`计算值，但这是个CSS3变量，IE9+才支持。
&emsp;&emsp;110、`rgba`、`hsl`，CSS3属性，IE9+才支持。`rgba`在低版本中可以使用透明度PNG图片以及`filter`渐变滤镜来兼容。
&emsp;&emsp;111、`background-color`背景色永远是最低的。
&emsp;&emsp;112、**一些没见过的隐藏操作：**
&emsp;&emsp;①不占据空间、辅助设备无法访问、同时不渲染，可以使用`<script>`标签。
```html
<script>
    <img src="1.jpg">
</script>
```
&emsp;&emsp;②不占据空间，辅助设备无法访问，显隐的时候可以有`transition`淡入淡出效果(其实这种应用场景我没有接触过，先记录下)。
```css
.hidden {
    position: absolute;
    visibility: hidden;
}
```
&emsp;&emsp;③不能点击，不占据空间，键盘可访问，可使用`clip`裁剪。
```css
.clip {
    position: absolute;
    clip: rect(0, 0, 0, 0);
}
.out {
    position: relative;
    left: -999em;
}
```
&emsp;&emsp;④可以点击，不占据空间，可以使用透明度。
```css
.opacity {
    position: absolute; /* 是否占据空间控制 */
    opacity: 0;
    filter: Alpha(opacity=0); /* 兼容 */
}
```
&emsp;&emsp;113、`display: none`和`background-image`的问题： FF中，`display: none`元素的`background-image`是不加载的；但在Chrome和Safari中，若父元素是`display: none`，图片才会不加载，仅是本身元素的背景图`display: none`，图片依旧会去加载。而IE老哥表示，任何情况他都会去加载图片。`<img>`标签则不受`display: none`影响，所有浏览器都会去请求图片资源。
&emsp;&emsp;114、`visibility`具有继承性，父元素设置`hidden`后子元素也会被隐藏。另外`visibility: hidden`并不会影响CSS计数器的计算，但是`display: none`时，就完全不会参与计算。
&emsp;&emsp;115、`visibility`可以配合`transition`实现显隐的过度效果，如`transition: opacity 延迟时间`。CSS3中的`transition`支持CSS属性`visibility`。这种延迟显示的场景有个比较经典的例子：光标移动的过程中，如果不设置延迟效果将会瞬间触发一些hover动作，可能会造成一些不必要的遮挡，见[传送门](https://demo.cssworld.cn/10/2-3.php)。
&emsp;&emsp;116、关于视觉障碍用户的体验：其实这个问题目前我做的需求都是没有涉及的，作者对`display: none`和`visibility: hidden`两种情景的屏幕阅读进行了对比，即`visibility`的显隐性在视觉障碍用户进行操作时，体验更佳，它能够精准地读取当前操作状态的`title`信息。而`display`显隐无法通知。另外，**普通元素的`title`属性不会被朗读，需要辅助按钮等控件元素，如`role="button"`。**注意:`visibility: hidden`的元素是不会被朗读的。见文中[DEMO](https://demo.cssworld.cn/10/2-4.php)，似乎是个反例，但是其实在从显示到隐藏的这个过程中，区域还没有消失，所以会被朗读出来。
&emsp;&emsp;117、`outline`表示元素的轮廓，语法和border属性非常类似；`outline`与`focus`状态以及键盘访问关系密切。Tab键可以依次不断切换focus元素，包括链接、按钮、输入框等表单，甚至**设置了`tabindex`的普通根元素。**`Shift+Tab`可以反向focus。默认状态下，`focus`元素会通过虚框或者外发光的形式进行区分和提示，**当元素被focus后，敲击回车键相当于触发了该元素的click事件。**现代浏览器，点击链接按钮后已经不会触发`outline`效果了，但通过Tab或`element.focus()`才会触发发光效果。
&emsp;&emsp;118、`outline`的应用：`outline`是真正意义上的不占据任何空间的属性。轮廓宽度设置再厚也不会影响任何其他元素的布局。**并且`outline`轮廓是可穿透的。**书中例子有二，①头像裁剪的矩形镂空效果。②自动填满屏幕剩余空间。
&emsp;&emsp;119、`cursor`光标属性：`auto`，cursor的默认值，会跟着内容而变化成不同的光标形态；`default`系统默认光标形态，不会变化，指那种未选定的情形。`none`，隐藏光标，比如观看视频全屏时，静止几秒我们就将鼠标图标隐藏掉，有`mouseover`再重新显示，注意这里`cursor: none`的兼容性是IE9+，即IE8下要做兼容处理，可以通过自定义透明光标(**Chrome弄一张透明PNG**)实现，[传送门](https://demo.cssworld.cn/11/2-1.php)。代码中出现了`:root`选择器，首先这是一个根元素选择器，`html`就是我们的根，其次这是一个CSS3属性，兼容性IE9+。还有一些常用的如`pointer`、`text`就不全部赘述了。
&emsp;&emsp;120、`direction`主要关注2个属性`ltr`默认值以及`rtl`，分别代表从左到右left to right以及右到左。它负责的东西很关键，就是改变水平流向，比如**交换按钮位置，图片左右互换等等。**
&emsp;&emsp;121、`unicode-bidi`，这个属性是配合`direction`一起使用的，因为`direction`其实只能改变图片或按钮的呈现顺序，**而对纯字符内容无能为力(尤其是中文字符)**,这个时候就需要兄弟`unicode-bidi`帮忙了。`bidi`的全写英文是`bidirectionality`，它意味着**双向性**(阿拉伯文是从右往左读的)，它帮助规范字符出现双向性时该有的表现,默认值为`normal`，表示正常排列，而`embed`只能作用于内联元素上，并且`embed`属性不会受外部嵌套的元素属性设置影响(相当于自身开了个内嵌区域，自己操作)，[传送门](https://demo.cssworld.cn/12/1-4.php)。`bidi-override`，会强制所有字符按照`direction`设置的方向反向排列。**`embed`和`bidi-override`可以使用特殊字符替代。**
&emsp;&emsp;122、`writing-mode`就比较牛逼了，它可以将页面默认的水平流改成垂直流。默认值为`horizontal-tb`很好理解，horizontal水平，tb，topbottom，即水平方向从上到下排列。由于不同浏览器和版本支持的属性都有所不同，作者整理出了几个需要关注的属性：
```css
.example {
    writing-mode: lr-tb | tb-rl | tb-lr; /* IE8+ */
    writing-mode: horizontal-tb | vertical-rl | vertical-lr;
}
```
&emsp;&emsp;123、关于float，**浮动的本质就是为了实现文字环绕的效果**，文章原话。
&emsp;&emsp;124、float特性：
&emsp;&emsp;①**包裹性**，由两部分组成，包裹和自适应性。包裹可以理解为，具有`float`设定的容器的宽高将会以嵌套的内容宽高为表现。自适应则是浮动元素嵌套的元素如果是多个，将会自适应分配剩余空间。
&emsp;&emsp;②**块状化**格式上下文(BFC)
&emsp;&emsp;③破坏文档流
&emsp;&emsp;④无任何margin合并
&emsp;&emsp;125、笔记124中的第二条中，强调了块状化的说法，那么**什么是块状化？**即一旦float属性不为none，则display计算值将是`block`或者`table`。像以下的写法都是冗余的：
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
&emsp;&emsp;126、**行框盒子如果和浮动元素的垂直高度有重叠，则行框盒子在正常定位状态下只会跟随浮动元素，而不会发生重叠。**行框盒子怎么理解呢，其实就是我们内联元素所在的那一层，当浮动元素导致高度塌陷时，其实块盒的确发生重叠了，但是内联元素所在的层则由于有这种特性不会发生重叠。
&emsp;&emsp;127、**文字环绕**其实是由"父级高度塌陷"和"行框盒子区域限制"(笔记126中描述)两方面作用的结果。"父级高度塌陷"可以通过设定高度来cover但是"行框盒子区域限制"就没办法了，所以当你出现设定容器高度与内嵌图片高度一样时，由于内联下图片底部的间隙导致实际高度大于这个高，后面的文本就会产生环绕。见[传送门](http://demo.cssworld.cn/6/1-1.php)。
&emsp;&emsp;128、**IE8以下的浏览器产生浮动，文字会浮动到下一行内容显示。这与我现在的认知IE8+的同行浮动显示不同。**
&emsp;&emsp;129、浮动元素的作用机制：
&emsp;&emsp;①浮动锚点：float所在流中的一个点，这个点本身并不浮动，表现得像一个没有margin、border和padding的**空内联元素**。作用就是产生"行框盒子"：在没有"行框盒子"进行浮动参考时(比如浮动元素前后都是块级时)，提供参考。
&emsp;&emsp;①浮动参考：浮动元素对齐参考的实体。**浮动元素进行对齐的实体就是当前float元素的"行框盒子"，而非外部包含块盒。**
&emsp;&emsp;130、官方文档对clear属性的解释是：**元素盒子的边不能和前面的浮动元素相邻。**所以其实这个值真正意义上定义的是设置了clear属性元素本身的行为，而不是float元素的行为。默认是`none`，即左右浮动正常作用于本身，`left`左侧抗拒浮动，`right`右侧抗拒浮动，`both`两侧抗拒浮动。在我们实际应用场景中使用`clear`来清除浮动其实使用`clear: both`即可，因为`clear: left\right`都可以用前者替代。文中有一个DEMO比较好地阐释了什么`clear`针对的**前面的浮动元素**：
```css
li {
    width: 20px; height: 20px;
    margin: 5px;
    float: left;
}
li: nth-of-type(3) {
    clear: both;
}
```
&emsp;&emsp;以上样式为第三个`li`设置`clear: both`，假设我们有10个`<li>`元素，最终只会形成2行排列而不是三行。首先最基本的一点，`li`是块级元素，在`float: left;`的作用下，才会出现单行的情景，然而`clear: both`事实上只针对前面的浮动，所以第三个`li`本身恢复块级排列到了第二行，其后的浮动不受影响跟着第三个`li`到第二行。综上所述，**当我们遇到需要屏蔽浮动的场景统一使用`clear: both`。**
&emsp;&emsp;131、**`clear`属性只有块级元素才生效，而`::after`等伪元素默认都是内联水平，这就是为什么我们在清除浮动的时候往往还需要同时设置一个`display`属性的原因，比如下面这种：**
```css
.clear:after {
    content:　'';
    display: table/block/list-item;
    clear: both;
}
```
&emsp;&emsp;132、`clear`只能在一定程度上消除浮动的影响，因为`clear: both`这种本质上是使自身不和float元素在一行显示，所以float一些特性还是会被保留。比如：
&emsp;&emsp;①`clear: both`元素前也是浮动元素，即使`margin-top`负值设为-9999px也无效。
&emsp;&emsp;②`clear: both`后面元素依旧可能发生文字环绕现象。
&emsp;&emsp;133、再看看`overflow`，它才是最适合进行清除浮动的控制属性。为什么呢？因为它不会影响原本的流体特性或宽度表现。而其他的CSS声明基本都会让元素产生"包裹性"。
&emsp;&emsp;134、`overflow`属性本身是为了对溢出元素的内容进行裁剪而设计的，并且**裁剪边界的判定是以`border box`为基准而非`padding box`。**，[实例](http://demo.cssworld.cn/6/4-1.php)。