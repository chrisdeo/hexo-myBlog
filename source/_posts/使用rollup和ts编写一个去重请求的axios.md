---
title: 使用rollup和ts编写一个去重请求的axios
date: 2021-06-14 12:38:49
tags:
  - rollup
  - typescript
  - axios
---

&emsp;&emsp;近期看了些社区关于`axios`一些增强封装的文章，就想着也动手玩玩（先随便实现个去重请求 feature。打包工具准备选择`rollup`，语言则直接使用`ts`，选型单纯是扩展技术体系，在实（踩）践（坑）中提升熟练度。

<escape><!-- more --></escape>

## TypeScript

### 优缺点

&emsp;&emsp;社区上对`ts`的讨论其实是非常多的，结合个人分析整理的优缺点如下：

&emsp;&emsp;优点：

- 在`coding`过程中，IDE 可以提供成员属性、类型等智能提示
- 静态校验（JS 本身只有运行时才会抛出异常），主要走 AST 词法分析那一套，在我们编写逻辑代码时，进行一些引用（比如常见的变量拼写错误低级问题）、句法问题上的分析，错误会标红并予以可能的解决方案说明
- `interface`、`type`这些对成员类型的定义使后续维护者能够更容易分析整个项目的流程

&emsp;&emsp;缺点：

- 接入成本比较大（学习成本、工作量成本、小组工作人员意愿成本等）
- 打包过程中额外的编译时间
- 可能一些第三方库没有编写`typings.d.ts`之类的类型声明，导致引入后`ts`抛错

### 安装&初始化项目配置

```javascript
// 全局安装ts
npm i -g typescript
// 安装后可以查看下版本，确认下是否安装成功
tsc -v
// 在当前目录下生成 tsconfig.json文件
tsc --init
```

&emsp;&emsp;建议通过命令直接生成`ts`的配置文件，因为其中提供了全量的配置信息并提供了注释声明，我们仅需要在我们的配置行打开注释并设置我们的内容即可：

![](tsconfig.jpg)

## Rollup

&emsp;&emsp;`Rollup`个人最早听说的时候是它有个`tree-shaking`的功能，就是可以移除代码里的一些`dead code`，从而减小你打包出来项目的体积，不过当时我一直使用的是`webpack`进行项目构建，且后续`webpack`新版本中也新增了类似的功能，就没有使用过该打包工具了。

&emsp;&emsp;根据一些社区的说法，`Rollup`似乎在构建应用和构建库之间更适合后者，基本给出的理由都是从代码体积、打包后的可读性上来说。比如`webpack`会写入依赖构建图谱，里面会有类似`__webpack_require__`的工具方法编织的`IIFE`等。

&emsp;&emsp;当然，在我个人看来理由还是比较牵强...`Rollup`和`Webpack`都是工程化上的一种选型，技术细节决定了它们最后打包出来的产物不同，并且没有在数据上达到一个量级的差距。所以我认为从开发者做事的角度来说，相关社区配套资源的物料是否丰富才是更大的影响我们选型的因素。

### 安装&初始化项目配置

```javascript
// 全局安装rollup
npm i -g rollup
// 创建rollup.config.js配置文件
touch rollup.config.js
```

&emsp;&emsp;下面看下我的具体配置，关键点是其中的`plugins`，如果缺少了其中的任意一个都会抛出异常：

```javascript
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'lib/main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [typescript(), resolve(), json(), commonjs()],
}
```

&emsp;&emsp;`input`没什么好多说的，写个入口文件就完事，跟我们在`webpack`里的`entry`配置差不多；在`output`中要注意的是**如果我们导出的是`umd`风格的包，就须要在`output`中配置`name`、`globals`以及第一层配置添加`external`项。**

&emsp;&emsp;我所说的`output`的细节可以看下`react-redux`的配置：

```javascript
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const env = process.env.NODE_ENV

const config = {
  input: 'src/index.js',
  external: Object.keys(pkg.peerDependencies || {}).concat('react-dom'),
  output: {
    format: 'umd',
    name: 'ReactRedux',
    globals: {
      react: 'React',
      redux: 'Redux',
      'react-dom': 'ReactDOM',
    },
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**',
      babelHelpers: 'runtime',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    commonjs(),
  ],
}

if (env === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  )
}

export default config
```

&emsp;&emsp;`plugins`的配置我认为是和`webpack`差异最大的地方，在`webpack`中的`plugins`是用来在`tapable`派发的不同的 hooks 中进行特定时机额外操作的，诸如`HtmlWebpackPlugin`入口模版配置，`ProgressBar`显示打包进度等。

&emsp;&emsp;而在`Rollup`中的`plugins`更像是`webpack`里的`loader`，它们的功能都是进行模块解读，没有这块辅助，我们的打包流就无法正常工作。

&emsp;&emsp;下面说说我在配置中遇到的`plugins`问题。

### Rollup 的 plugins 配置

&emsp;&emsp;最全的配置见[官网](https://github.com/rollup/awesome)。

- @rollup/plugin-node-resolve: 用于协助`Rollup`找到外部依赖的模块如`axios`、`lodash`等，不添加就会报`Unresolved dependencies`问题，即无法将第三方依赖打入我们的代码中。
- @rollup/plugin-commonjs: 使用这个插件主要是因为社区里实际上很多库还是打包成`cjs`格式的，当我们想通过 es 的`import`方式导入就需要通过该插件进行转化才行，如`qs`等。
- @rollup/plugin-json: 提供了`json`格式文件的处理能力，在引入`axios`时，如其中的`package.json`文件无法读取，命令行会提示安装该插件辅助。
- '@rollup/plugin-typescript: 由于我们使用了`ts`，可以直接通过该插件替代`tsc`的命令动作。

## Axios 封装

&emsp;&emsp;由于本文仅实现一个重复请求取消的简单功能，所以大概讲下思路和记录遇到的一些问题。

&emsp;&emsp;先说说思路，之前实际上写过一篇[axio 源码阅读](https://chrisdeo.github.io/2019/11/30/axios%E6%BA%90%E7%A0%81%E9%98%85%E8%AF%BB/)的文章，里面有一个非常关键的细节就是`interceptors`的实现。这个方法可以让我们在请求过程中进行中间件的定制，也就意味着我们可以在中间判断请求是否重复，从而进行取消。

&emsp;&emsp;那么取消重复请求问题就可以拆解成两步：**是否重复**及**如何取消**。

&emsp;&emsp;判断请求是否重复，我们可以通过将请求`url`、请求方法`method`及请求参数`data`(post)或者`params`(get)进行字符串序列化（借助第三方库`qs`）并生成请求`Map`来进行后续过滤。

&emsp;&emsp;取消请求的本质是`xhr`的`abort`方法，当然设置`timeout`的情况下超时请求也会被`canceled`。

&emsp;&emsp;编写完代码逻辑再结合前阵子文章[一套完整的代码规范需要什么](https://chrisdeo.github.io/2021/06/08/%E4%B8%80%E5%A5%97%E5%AE%8C%E6%95%B4%E4%BB%A3%E7%A0%81%E8%A7%84%E8%8C%83%E9%9C%80%E8%A6%81%E4%BB%80%E4%B9%88/)后，我们有如下目录结构：

![](tree.jpg)

&emsp;&emsp;打包：`rollup -c`生成`bundle.js`。

&emsp;&emsp;压缩：`npm pack`生成`.tgz`压缩包，可以直接发布`npm`也可以本地安装调试。

### 遇到的问题

- `Could not find a declaration file for module`：出现在安装我的方法库后，查阅资料后发现是我的`ts`缺少对文件的描述说明文件`typings.d.ts`。设置方案如下：

```javascript
// package.json中
// 配置typings项并指向我们代码中的说明文件
"typings": "lib/index.d.ts",

// index.d.ts
// 简单声明一下，但是要注意tsconfig.json中的配置
declare module 'with-wrapped-axios'

// tsconfig.json
"declaration": true,                   /* Generates corresponding '.d.ts' file. */
"declarationMap": true,                /* Generates a sourcemap for each corresponding '.d.ts' file. */
"sourceMap": true,                     /* Generates corresponding '.map' file. */
"outDir": "./dist",                        /* Redirect output structure to the directory. */
```

### 效果

&emsp;&emsp;启一个`umi`的`demo`，安装本地编写的依赖包，在`mock`目录下设置一个`1.5s`超时的`mock`接口，点击模拟试验一下：

![](mock.jpg)

&emsp;&emsp;可以发现连续点击五次按钮，仅最后一次正常到了超时才响应`timeout`并且`canceled`，前4个重复请求都被监测到并且主动`abort`，符合预期。