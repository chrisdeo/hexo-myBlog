---
title: axios源码阅读
date: 2019-11-30 12:10:43
tags:
  - axios
---

> &emsp;没事读读码...

<escape><!-- more --></escape>

&emsp;&emsp;`axios`在业务中请求用得比较多了，这个周末就花点时间阅读下源码，先进`github`开启`sourcegraph`插件，找到核心实现目录：

![](menu.jpg)

&emsp;&emsp;先从外层开始阅读，