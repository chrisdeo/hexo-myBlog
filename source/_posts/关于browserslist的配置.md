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
&emsp;&emsp;4. `> 5% in my stats`：数据采集范围->自身的WEB项目，需要结合`browserslist-ga-export`，该包使我们无需登陆Google账号就能生成我们站点的访问浏览器版本数据，`browserslist-stats.json`。
&emsp;&emsp;5. `cover 99.5%`： 覆盖全球99.5%的浏览器类型，即支持绝大多数的现代浏览器。
&emsp;&emsp;6. `cover 99.5% in US`：与前面同理。
&emsp;&emsp;7. `cover 99.5% in my stats`：与前面同理。
&emsp;&emsp;8. `maintained node versions`：兼容所有仍被支持的NODE版本。
&emsp;&emsp;9. `node 10 and node 10.4`：兼容最新的`10.x.x`或`10.4.x`版本。
&emsp;&emsp;10. `current node`：兼容当前环境下的NODE版本。
&emsp;&emsp;11. `extends browserslist-config-mycompany`：从`browserslist-config-mycompany`中继承配置。
&emsp;&emsp;12. `ie 6-8`设置兼容IE版本范围。 
&emsp;&emsp;13. `not ie <= 8`设置不支持的IE版本范围。
&emsp;&emsp;14. `Firefox > 20`设置FF版本范围，同理也支持`>=`，`<`及`<=`。
&emsp;&emsp;15. `iOS 7`：设置支持的iOS浏览器版本。
&emsp;&emsp;16. `last 2 versions`：每个浏览器支持的最新2个版本。
&emsp;&emsp;17. `last 2 Chrome versions`：Chrome浏览器支持的最新2个版本。
&emsp;&emsp;18. `last 2 major versions`：每个浏览器支持的最新2个主分支版本。
&emsp;&emsp;19. `last 2 years`：最近2年支持的版本。
&emsp;&emsp;20. `since 2015`：自2015年来支持的版本。
&emsp;&emsp;21. `dead`：一年内未被官方维护更新的版本。
&emsp;&emsp;22. `defaults`：`browserslist`的默认配置（`> 0.5%, last 2 versions, Firefox ESR, not dead`）。

&emsp;&emsp;**以上条件可以进行集合操作，通过`or`或`,`进行并集操作，通过`and`进行交集操作，`not`取非包含关系集合。**