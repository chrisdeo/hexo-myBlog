---
title: 记从roadhog2.x迁移至webpack4.x
date: 2019-08-09 15:43:17
tags:
  - roadhog
  - webpack
  - 工程化
---

> &emsp;最近半周做了一件事，将手上的前端项目从使用dva脚手架自带的roadhog2.x打包工具迁移至使用webpack4.x打包，成功让本人掉了不少头发。

<escape><!-- more --></escape>

## 背景

&emsp;&emsp;先说背景，目前主要做的项目其实都是兄弟姐妹系统（是的没错，就是前端圈位于鄙视链顶层的TO B系统），基于早期的JSP多页应用使用React进行拆分重构；技术选型采用的是`react` + `antd` + `dva`。我从学校回来接入的时候，项目已经开始一段时间了。当时`dva`脚手架还是带的`roadhog2.x`构建包工具，它是在`webpack`之上的封装，大体上就是提供一个开箱即用的傻瓜式构建方案，技术本身是没有问题的，但是难受就难受在相关文档不是那么全，而且扩展性不足（当然如果你是随便改底层的带哥，当我没说...）；比如`roadhog2.x`移除了过去支持的`dll`配置项，同时sorrycc老哥重心也转移到`umi`的开发维护上了...这边随着公司项目版本不断迭代，代码量的日渐增长以及一些工具、第三方库的引入导致项目构建越来越慢，拖了一万年的我终于开始了将`roadhog2.x`对应构建方式迁移至`webpack4.x`的工作。

## webpack4.x

### 基本格调

#### 源文件&Chunk&Bundle三者的联系

&emsp;&emsp;一语蔽之，它们三个就是同一份代码在不同阶段的产物或者说别名，源文件是我们本地coding的代码，chunk则是源代码在webpack编译过程中的中间产物，最终源代码打包出来的就是bundle文件。

### 约定大于配置

&emsp;&emsp;`webpack 4.x`要再装一个`webpack-cli`依赖配合，可以通过`npm i webpack webpack-cli -D`一起安装。

&emsp;&emsp;撸过`webpack 4.x`的兄弟姐妹肯定有见过一个`WARNING`：`The 'mode' option has not been set, webpack will fallback to 'production' for this value.`。现在我们再进行`webpack`命令行操作的时候需要指定模式`--mode production/development`，如果没有指定会使用默认的`production`。两个模式下`webpack`会自动地进行相应的优化操作，比如指定`production`会自动进行代码压缩等等。

#### 默认情况下entry就是src/index.js

&emsp;&emsp;过去我们还需要指定入口文件比如下面这样的：

```javascript
    entry: {
        index: ['babel-polyfill', path.resolve(__dirname, './src/index.js')],
    }   
```
&emsp;&emsp;现在不需要配置，默认就是这个模块了。

#### 默认情况下output被指定为dist/main.js

&emsp;&emsp;emm，这个一般就不能不设置了，