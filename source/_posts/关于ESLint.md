---
title: 关于ESLint
date: 2019-08-22 08:58:14
tags:
  - 工程化
  - ESLint
  - 代码规范
---

&emsp;&emsp;ESLint给我个人的体验在于，它能将编程风格不同的程序员写出来的代码尽量格式化统一成像是一个人写的代码。这样的好处在于后期维护人员能较为轻松地进行代码阅读，无论是要进行代码优化亦或是DEBUG。当然这仅是**代码风格上的约束**，也可以称之为**软约束**。那**硬约束**是什么？我认为ESLint带来最大的提升是在**拼写错误校验、冗余模块引入检测**上的。相信很多人都被自己错误拼写变量造成的魔幻BUG坑过，还有冗余依赖引入造成的代码体积扩大等等。

<escape><!-- more --></escape>

&emsp;&emsp;ESLint就可以帮我们规避这些问题。通常ESLint的应用是**双重结合**的，第一重是在我们coding的编辑器（本人是`VSCode`）内安装插件，检测到不符合规则的标红警告；第二重则是在代码`commit`时提示问题，并拦截提交。

### 坑：git commit --no-verify

&emsp;&emsp;为什么要说`--no-verify`，因为这个`git commit`的配置项有毒。由于一些历史原因，负责的部分项目一直都是通过`git commit -nm`进行代码提交...这个操作骚就骚在它能绕过`pre-commit`和`commit-msg`的周期钩子，也就是说它能直接跳过我们的`ESLint`检测。emm，我其实有尝试过正常校验，但是处理完毕后自动格式化了几百个文件，然后...就没有然后了，毕竟没有人想背锅（所以说构建项目的底子一定要硬）。

### 配置ESLint

&emsp;&emsp;当前主要技术栈为`React`，而社区内对`React`项目的`ESLint`已经有非常多成熟的方案了，这里使用`airbnb`的规则来做一个说明：

&emsp;&emsp;1. 查看我们要安装的`eslint-config-airbnb@latest`的依赖：`npm info "eslint-config-airbnb@latest" peerDependencies`。

![](peerDep.jpg)

&emsp;&emsp;2. 根据上图的关联依赖统一通过`@版本号`安装。

&emsp;&emsp;3. 在项目根目录创建`.eslintrc.js`，写入配置：

```javascript
module.exports = {
    root: true,
    extends: ['airbnb'],
    parserOptions: {
        // eslint-config-airbnb: { ecmaVersion: 6, sourceType: 'module' }
        ecmaFeatures: {
            // eslint-config-airbnb: { jsx: true, es6: true  }
            generators: true,
        },
    },
    env: {
        // eslint-config-airbnb: { node: true, es6: true }
        browser: true,
    },
    rules: {
        indent: ['error', 4],
    },
}
```

### VSCode

&emsp;&emsp;在VSCode的左边栏的扩展项内，我们可以配套安装`ESLint`的插件：

![](ESLint.jpg)

&emsp;&emsp;安装后，它会自动应用我们前文加入的配置规则，另外一些编辑器内的如不符合标准标红、`ctrl + s`保存代码自动修复格式等功能需要在`File -> Preferences -> Settings`中，搜索`ESLint`定制配置：

![](settings.jpg)

&emsp;&emsp;简单测试一下，减少一个空格：

![](vsLint.jpg)

&emsp;&emsp;保存代码自动格式化：

![](format.jpg)

### 实践出真坑

&emsp;&emsp;以上弄完了，我们就可以开始踩坑了...

#### Expected linebreaks to be 'LF' but found 'CRLF'.

&emsp;&emsp;这个问题是由于`Linux`与`Windows`换行符不同所致，在`Linux`中使用的是`\n`，对应`LF`；在`Windows`中使用的是`\r\n`，对应`CRLF`。处理方案：

```javascript
 rules: {
     ...,
     ["linebreak-style"]: [0, 'error', 'windows'], //  在windows环境下关闭该检测
 }
```

#### Unary operator '++' used.

&emsp;&emsp;ESLint认为`++`，`--`这些操作在前后存在空格换行的运算中有语义变化的[风险](https://eslint.org/docs/rules/no-plusplus)，由于JS引擎本身会根据语句去自动插入分号，所以有以下的解析歧义例子：

```javascript
var i = 10;
var j = 20;

i ++
j
// i = 11, j = 20

var i = 10;
var j = 20;

i
++
j
// i = 10, j = 21
```

&emsp;&emsp;当然如果团队的开发人员能够深刻理解该潜在风险，我们也可以在`rules`中配置禁止：

```javascript
 rules: {
     ...,
     ["no-plusplus"]: [0, 'error'],
 }
```