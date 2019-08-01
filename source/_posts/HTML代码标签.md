---
title: HTML代码标签
date: 2019-08-01 17:39:28
tags:
  - HTML
  - 代码标签
---

> &emsp;最近在撸webpack的时候，看到DEMO里放了这样一条语句`<%= htmlWebpackPlugin.options.isDev == 'true'? '<script src="/vendor.dll.js" ></script>' : '' %>`，龟龟，这不是我当年的jsp表达式写法么？现在的前端项目构建背后其实是Node在操作，所以同理，这段代码最终会根据环境动态编译，Node判断在本地开发环境情况下直接使用预编译完的`dll`来提升热更新效率。

<escape><!-- more --></escape>

&emsp;&emsp;本文就简单回忆一下，这种带`%`的标签是如何使用的。

### <% %>

&emsp;&emsp;`<% %>`又称脚本片段，我们可以在其中**编写服务端代码**，当然也可以在内部**编写DOM**。

### <%= %>与<%: %>

&emsp;&emsp;`<%= %>`内部可以写**表达式**或者使用**声明的变量**，像引子中的DEMO其实就是表达式的写法。`<%: %>`同。