---
title: reselect初探
date: 2021-03-24 21:27:29
tags:
  - redux
  - reselect
---

> &emsp;在Redux的官网文档中，我们可以看到一些结合社区库实现渲染优化的方案，如`reselect`、`immutable.js`等。今天这篇文章主要是对其源码的阅读，便于理解为何可以起到优化的作用。

<escape><!-- more --></escape>

&emsp;&emsp;