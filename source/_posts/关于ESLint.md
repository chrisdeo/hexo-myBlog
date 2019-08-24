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

&emsp;&emsp;ESLint就可以帮我们规避这些问题。通常ESLint的应用是**双重结合**的，第一重是在我们coding的编辑器（本人是`VSCode`）内安装插件，检测到不符合规则的标红警告；第二重则是在代码`commit`时提示问题，并拦截提交（这个需要介入hooks使用，后文会聊）。

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
        ecmaFeatures: {
            generators: true,
        },
    },
    env: {
        browser: true,
    },
    rules: {
        // ...自定义配置
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

#### `Expected linebreaks to be 'LF' but found 'CRLF'.`

&emsp;&emsp;这个问题是由于`Linux`与`Windows`换行符不同所致，在`Linux`中使用的是`\n`，对应`LF`；在`Windows`中使用的是`\r\n`，对应`CRLF`。处理方案：

```javascript
 rules: {
     ...,
     ["linebreak-style"]: [0, 'error', 'windows'], //  在windows环境下关闭该检测
 }
```

#### `Unary operator '++' used.`

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
     'no-plusplus': [0, 'error'],
 }
```

#### JSX中的`Parsing error: Unexpected token {`

&emsp;&emsp;由于我使用的是`React`，在变量写入花括号的时候报了这个校验问题，在社区上看到了相关的内容：`ESLint`如果单独使用就会存在种种困扰，比如兼容性上的坑，像在这种情况下我们需要先安装`babel-eslint`->`npm i -D babel-eslint`，再在`.eslintrc.js`内配置`parser: 'babel-eslint'`，具体讨论见[传送门](https://stackoverflow.com/questions/53609457/eslint-parsing-error-unexpected-token-in-jsx)。

#### `Expected indentation of 12 space characters but found 14.`

&emsp;&emsp;缩进问题，撸过py的朋友应该知道其实真正的缩进应该是一个tab对应两个space的长度，而在windows下通常是一对四，则我们需要在`rules`中定制一下：

```javascript
rules: {
'no-tabs': 'off',
'no-mixed-spaces-and-tabs': 'off',	// 禁止空格TAB混用报错，这个其实在设置了VSCODE的TAB控制后可以去掉了
'indent': [
	'error',
	'tab'   
],
'react/jsx-indent': [
	'error',
	'tab'
],
'react/jsx-indent-props': [
	'error',
	'tab'
],
}
```

#### `Expected indentation of 1 tab but found 4 spaces.`

&emsp;&emsp;这个也挺坑的，同样我们要去`Settings`中配置。相当于把缩进用空格补位的给关了：

![](close.jpg)

#### `JSX not allowed in files with extension '.js'`

&emsp;&emsp;JSX的使用需要我们手动设置兼容的后缀文件，`'react/jsx-filename-extension': [1, { 'extensions': [".js", '.jsx'] }]`。

### 提交拦截

&emsp;&emsp;这一步需要我们介入Hooks，玩过React、Vue的人都对Hooks这个术语有所了解，其实就是对应一个完整的流程中的各个阶段（不同阶段有对应的处理逻辑）。同理，我们要在提交前去根据校验规则拦截住当前不符合规则的部分，我们就需要介入`git hooks`中的`pre-commit`部分。

&emsp;&emsp;我们在项目根目录的隐藏文件夹`.git`内找到相关的一些`hooks`：

![](hooks.jpg)

&emsp;&emsp;具体步骤：
&emsp;&emsp;① `npm i -D pre-commit`。
&emsp;&emsp;② `package.json`中配置`scripts`，写入操作key，这个要与`pre-commit`配置项中的对应。
&emsp;&emsp;③ 对`src`路径下的`js`、`jsx`检查：`"lint": "eslint --ext .js --ext .jsx src"`。
&emsp;&emsp;④ `pre-commit`的值为数组格式，支持多个，这里我们直接塞前面配的`lint`进去：`"pre-commit": ["lint"]`。

&emsp;&emsp;尝试在有格式校验问题的情况下提交：

![](prevent.jpg)

&emsp;&emsp;从上图我们可以得知本次提交并没有通过我们定制的hooks环节，并且输出了具体文件具体代码的问题定位，修改成符合规范的即可。

### 基础的Rules语法

&emsp;&emsp;由于我们在`.eslintrc.js`中`extends`的`airbnb`的配置规则可能有些不满足我们的需求，需要调整。这种情况下，就需要我们自定义地重写或新增`rules`规则。

&emsp;&emsp;具体的`rules`配置可以直接去[官方文档](https://eslint.org/docs/rules/)查阅，这里只讲一些基础的语法认知。`rules`作为自定义规则，内部的元素都是以`k-v`格式构成，`key`为定制的规则名，`value`则是我们具体设置的校验，可以是字符串或数组，如果仅是设置规则开关，字符串格式就可以满足：

&emsp;&emsp;`off`或`0`表明规则禁用。
&emsp;&emsp;`warn`或`1`表明规则警告，该设置仅会提供警告信息，如IDE中标记，控制台输出，但是不会影像`hooks`中的`exit code`（用来判定是否可以进入下一阶段，是否能够提交）。
&emsp;&emsp;`error`或`2`表明规则开启，该设置下规则不通过的无法提交。

&emsp;&emsp;如果是复合情况就比较复杂，首先`value`是数组格式，第一个参数还是以上的规则开关标志，其后的参数可以是字符串也可以是对象，具体要看对应`key`给出的支持情况。e.g.

```javascript
/*eslint object-curly-spacing: ["error", "always", { "arraysInObjects": false }]*/
/* eslint implicit-arrow-linebreak: ["error", "below"] */
/*eslint linebreak-style: ["error", "windows"]*/
```