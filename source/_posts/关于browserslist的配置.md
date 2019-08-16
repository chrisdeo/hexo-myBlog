---
title: 关于browserslist的配置
date: 2019-08-16 14:12:58
tags:
  - webpack
---

&emsp;&emsp;其实上次迁移的过程中有看到`package.json`中有一段`browserslist`的配置，但是也没特别在意，后面又去官方文档研究了一波，输出了这篇文章。

<escape><!-- more --></escape>

## Browserslist

### 目的

&emsp;&emsp;`browserslist`是为了兼容在不同运行环境（不同版本浏览器、服务端Node）下的前端代码的。

### 使用范围（via官方）

&emsp;&emsp;1. Autoprefixer
&emsp;&emsp;2. Babel
&emsp;&emsp;3. postcss-preset-env
&emsp;&emsp;4. eslint-plugin-compat
&emsp;&emsp;5. stylelint-no-unsupported-browser-features
&emsp;&emsp;6. postcss-normalize
&emsp;&emsp;7. obsolete-webpack-plugin

### 配置位置

#### package.json

```javascript
   "browserslist": [
    "last 1 version",
    "> 1%",
    "maintained node versions",
    "not dead"
  ]
```

#### .browserslistrc

```javascript
last 1 version
> 1%
maintained node versions
not dead
```

### 具体参数意义

&emsp;&emsp;首先`browserslist`的配置内容可以理解为一个查询集合，我们根据这个集合组合来定制我们项目的兼容范围。

&emsp;&emsp;1. `> 5%`：兼容全球浏览器使用数量占比5%以上的类型。数值可以根据实际场景自定义，同理，除`>`也支持`>=`，`<`，`<=`。
&emsp;&emsp;2. `> 5% in US`：数据采集范围->国家（双字母构成，`CH`、`JP`等等）。
&emsp;&emsp;3. `> 5% in alt-AS`：数据采集范围->大洲（双字母后缀，`alt-af`、`alt-as`等等）。
