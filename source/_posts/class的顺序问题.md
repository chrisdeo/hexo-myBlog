---
title: class的顺序问题
date: 2019-07-21 23:05:58
tags:
  - CSS
---

> &emsp;其实之前我一直以为样式表中的class设定，有那么一个规则即相同样式属性的声明，后续声明的会覆盖之前的...然后我就被打脸了。

<escape><!-- more --></escape>

&emsp;&emsp;先说结论：**在CSS文件中，先声明的class具有更高的优先级；我们在HTML元素中列出class的顺序与生效的优先级并无关联**，所以看到以下的`html`，最终输出的是两个蓝色的`hi`，因为样式表中，`.blue`先被声明了。

```html
    <div class='red blue'>
        hi
    </div>
    <div class='blue red'>
        hi
    </div>
```

```css
    .red {
        color: red;
    }
    .blue {
        color: blue;
    }
```

![](blue.jpg)
