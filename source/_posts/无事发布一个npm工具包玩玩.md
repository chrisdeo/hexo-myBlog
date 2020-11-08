---
title: 无事发布一个npm工具包玩玩
date: 2020-09-28 15:58:17
tags:
  - npm
  - link
  - nodejs
---

> &emsp;之前一直想整个发布到npm上的工具，方便之后的某个项目使用，不过公司这方面的设施比较全面，且都架设在内部服务器上固没什么机会。直到后续接手海外项目，发现多语言处理的时候，都依赖一个老的Excel宏脚本进行js静态文件生成，灵活性非常差，只要原本文档格式或结构改变就会失效，而且由于历史原因，目前文档都上了云维护（结构大改），以前会写Excel脚本的兄弟也跑路了。致使一段时间开发人员在做海外需求的时候疯狂cv，效率低下还容易出错。于是抽空用node开发了一个简单的符合我们业务场景的解析excel生成静态js资源的cli，并发布到npm上，自己维护着玩，顺道提升一下开发体验。

<escape><!-- more --></escape>

### 包的构建

&emsp;&emsp;开发一个npm包的第一步那肯定是先通过`npm init`创建一个新的`package.json`描述，生成后大致内容如下：

```json
{
  "name": "language_excel_parser",
  "version": "1.0.0",
  "description": "a transform utility for multi-language project",
  "keywords": [
    "npm",
    "cli",
    "translation"
  ],
  "main": "index.js",
  "bin": {
    "translation-cli": "index.js"
  },
  "scripts": {
    "clean": "rm -rf src/assets/languages",
    "prebuild": "npm run clean",
    "build": "babel index.js -d lib"
  },
  "author": "chrisleo",
  "license": "ISC",
  "dependencies": {
    "xlsx": "^0.16.7"
  },
  "devDependencies": {
    "@babel/cli": "^7.11.6",
    "@babel/core": "^7.11.6",
    "@babel/preset-env": "^7.11.5",
    "jest": "^26.5.2"
  }
}
```

&emsp;&emsp;`package.json`内部属性，简单来说就是描述你的包的信息，包括了包名，介绍，版本号，入口，cli运行软链接，作者，版权，代码依赖等内容。

&emsp;&emsp;对于我开发的将Excel转化成适配我项目中多语言的静态资源文本的工具来说，对比那些组件库、sdk，它仅是一个比较简单的CLI工具。*CLI是Command-Line Interface的简称*，**我们可以简单理解成通过一行简单的命令行脚本去实现一类场景下的比较复杂的功能**。

&emsp;&emsp;关于`dependencies`及`devDependencies`的问题，我想这里不用浪费笔墨多说。有一点提一下就是如果你的这个`npm`包是服务于浏览器及一些老版本的node的，需要考虑下兼容问题，即通过babel进行ES5的兼容转化。

&emsp;&emsp;我认为需要重点提的是`bin`及`scripts`。

#### bin

&emsp;&emsp;该属性对应的是可执行文件的路径，比如我们在一个文件夹下新建了一个`index.js`的node脚本，要运行得通过`node index.js`跑。当你配置了`bin`中的命令行指向，使用`npm link`或者**全局安装命令行工具**时，NPM会为`bin`中配置的文件在`bin`目录下创建一个软链接，对于Windows系统，默认会在`C:\Users\{username}\AppData\Roaming\npm`目录下，若是局部安装则会在项目的`./node_modules/.bin`目录下创建一个软链接），MAC会在如下的目录链接：

```shell
/usr/local/bin/translation-cli -> /usr/local/lib/node_modules/language_excel_parser/index.js
/usr/local/lib/node_modules/language_excel_parser -> /Users/chendiyou/FE/language_excel_parser
```

&emsp;&emsp;这样可以达到什么效果呢？链接后我们就可以直接通过命令行执行`translation-cli`达到CLI包文件夹下进行`node index.js`一样的效果。

#### scripts

&emsp;&emsp;其实这个配置我也不太想多提，有点经验的选手都对这个不能再熟了，并且这篇文章是发布一个CLI工具的npm包，`scripts`内的东西使用者其实并不涉及（手动狗头。

&emsp;&emsp;所以...还是去阮老师的博客看吧，很清楚。[原文链接🔗](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)

### 包的发布

&emsp;&emsp;这里你要确认的第一件事是把你的代理改过来，相信大多数国内开发者，都会将npm包下载代理到`taobao`或者别的国内镜像源去下载。但是这样你就无法登陆`npm`官方并进行包的发布。操作方式：

1. 查看目前npm代理情况，`nrm ls` or `npm config ls`;前者要先安装ls；
2. 切换回官方的源，`nrm use npm` or `npm config set registry http://registry.npmjs.org`；
3. 登陆你的npm账号，要去官方注册。`npm login` , `npm adduser`；
4. 打包 `npm pack`；
5. 发布 `npm publish`；
6. 后续更新了，可以手动修改`package.json`中的`version`或者直接用命令`npm version patch`更新，然后再走 4 5步；

### 开发中会遇到什么问题

&emsp;&emsp;相信每个人初次开发都会遇到不一样的问题，这里只记录下我自己遇到的问题。

#### 须要头文件声明

&emsp;&emsp;因为我是MAC上开发的，全局执行bin的遇到了个找不到node类的错误，解决对策:

```shell
// 头文件声明，通过env来找到操作系统中的Node启动路径，并将Node作为可执行文件的环境解释器
// 这里没有头文件，require开始执行就会报错
#! /usr/bin/env node
```

#### 读写程序时相关文件的引入方式

&emsp;&emsp;这个问题就很蛋疼了，比如在我的CLI包里使用了另外一个文件维护了一份国家的key-value映射，在引入的时候，如果是全局安装的CLI和局部安装的CLI会有差异，局部包嵌套在`node_modules`内会有层级问题。这里只能看你想在什么场景生效进行`../`，`./`的取舍了。

#### 全局的unlink

&emsp;&emsp;开发过程中由于我在进行全局和局部的CLI对比，发现全局一开始直接`unlink`移除不了。后面发现得到`/usr/local/lib/node_modules/`下删才行。