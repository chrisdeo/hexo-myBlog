---
title: HTML代码标签
date: 2019-08-01 17:39:28
tags:
  - HTML
  - 代码标签
---

> &emsp;最近在撸webpack的时候，看到DEMO里放了这样一条语句`<%= htmlWebpackPlugin.options.isDev == 'true'? '<script src="/vendor.dll.js" ></script>' : '' %>`，但是`<%=%>`这种标签用法以前并没有接触过。当即借助搜索引擎整理了一下相关内容，其实功能很简单，就是运行js code的，并且可以使用server side的一些变量名。

<escape><!-- more --></escape>