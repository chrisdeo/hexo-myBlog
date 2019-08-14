---
title: 记从roadhog2.x迁移至webpack4.x
date: 2019-08-09 15:43:17
tags:
  - roadhog
  - webpack
  - 工程化
---

> &emsp;这半周做了一件事，将手上的前端项目从使用过去dva脚手架自带的roadhog2.x打包工具迁移至使用webpack4.x打包，成功让本人掉了不少头发。

<escape><!-- more --></escape>

## 背景

&emsp;&emsp;先说背景，目前主要做的项目其实都是兄弟姐妹系统（是的没错，就是前端圈位于鄙视链底部的TO B系统），基于早期的JSP多页应用使用React进行拆分重构；技术选型采用的是`react` + `antd` + `dva`。我从学校回来接入的时候，项目已经开始一段时间了。当时`dva`脚手架还是带的`roadhog2.x`构建包工具，它是在`webpack`之上的封装，大体上就是提供一个开箱即用的傻瓜式构建方案，技术本身是没有问题的，但是难受就难受在相关文档不是那么全，而且扩展性不足（当然如果你是随便改底层的带哥，当我没说...）；比如`roadhog2.x`移除了过去支持的`dll`配置项，同时sorrycc老哥重心也转移到`umi`的开发维护上了...这边随着公司项目版本不断迭代，代码量的日渐增长以及一些工具、第三方库的引入导致项目构建越来越慢，拖了一万年的我终于开始了将`roadhog2.x`对应构建方式迁移至`webpack4.x`的工作。

## webpack4.x

### 老生常谈

#### 源文件&Chunk&Bundle三者的联系

&emsp;&emsp;一语蔽之，它们三个就是**同一份代码在不同阶段的产物或者说别名**，源文件是我们本地coding的代码，chunk则是源代码在webpack编译过程中的中间产物，最终源代码打包出来的就是bundle文件。

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

&emsp;&emsp;emm，这个一般就不能不设置了，如果每次打包后的资源文件（html，js，css）名相同，由于强缓存的原因，我们部署在服务器（比如Nginx）上的项目并不会更新，虽然这也可以通过Nginx配置，但其实没啥必要，我们只要使每次打出来的文件名不同（设置hash），浏览器访问的时候就会重新去请求最新的资源。比如：

```javascript
  output: {
    filename: '[name].[hash:8].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/'
  }
```

#### development模式下自动会开启source-map

&emsp;&emsp;作为开发者，我们在开发环境下debug往往需要根据控制台的报错信息定位具体文件，如果没有`source-map`，我们得到的将是一段处理过的压缩代码，无法定位到具体文件具体代码行，这样非常不利于调试，在webpack4.x前，我们需要手动配置：

```javascript
  module.exports = {
    devtool: 'source-map'
  }
```

&emsp;&emsp;而现在在webpack4.x中通过指定模式`--mode development`将会自动开启该功能。

### 基本格调

&emsp;&emsp;在开始讲迁移的踩坑记录前，我先简要讲讲一般webpack的配置文件由哪些部分组成：

&emsp;&emsp;1. `entry`，即我们的总入口文件，我们要打包总得把从哪里开始告诉webpack吧？通常这个文件都在`src/index.js`。举个例子，你配置完所有的组件以后，肯定有一个顶层爹，中间嵌套的用来提供Provider的也好，配置路由的也好，最终都是将这个爹通过选择器挂载到你的根节点上，类似下面这样：

```javascript
  ReactDOM.render(<Father />, document.getElementById('root'));
```

&emsp;&emsp;当然我这边项目看了下之前貌似直接拿的`ant-design-pro`**v1**版本的改的（裂开，现在都到v4了）...入口文件dva有自己的封装，v1版本的大概长下面这样：

```javascript
  const app = dva({
    history: createHistory(),
  });
  app.use(createLoading());
  app.model(require('./models/global').default);
  app.router(require('./router').default);
  app.start('#root');
  export default app._store;
```

&emsp;&emsp;2. webpack现在有文件解析了，但是咋解析，这个方案需要你告诉webpack。我们需要在`module`配置项下的`rules`内通过正则判定文件类型然后根据该类型选择不同的`loader`来进行不同编译，下面以解析`js`和`jsx`文件为例子：

```javascript
  {
    test: /\.(js|jsx)$/,
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true, // 默认false，开启后，转换结果会被缓存，再次编译优先读取缓存内容
        }
    },
    exclude: /node_modules/, // include指定包含文件，exclude除去包含文件
  }
```

&emsp;&emsp;3. 指定了不同类型文件的处理方式以后，我们可能还想要做一些额外的扩展，比如代码压缩、生成`link`、`script`标签、图片拷贝到存放静态资源的目录、编译过程根据库依赖关系自动引入依赖等等。这时候就需要配置`plugins`配置项了，拿生成`script`标签引入我们的`bundle`为例：

```javascript
  new HtmlWebpackPlugin({
      template: path.join(__dirname, '/src/index.ejs'), // 参照模板，bundle会在这个模板中通过插入script的方式引入
      filename: 'index.html',
      hash: true, // 防止缓存
  })
```

&emsp;&emsp;4. 最终我们得到的编译结果需要一个输出，可以通过配置项中的`output`来控制：

```javascript
    output: {
      filename: '[name].[hash:8].js',
      path: path.resolve( __dirname, './dist' ),
      chunkFilename: '[name].[hash:8].async.js', // 按需加载的异步模块输出名
      publicPath: '/'
    }
```

## 实战踩坑

### mini-css-extract-plugin

&emsp;&emsp;`webpack4.x`中推荐使用的CSS压缩提取插件，最终会在我们提供的模板HTML中插入一个link标签引入编译后的样式文件；过去版本中的`webpack`使用的是`extract-text-webpack-plugin`，但是本人最初尝试使用的时候，报了`Tapable.plugin is deprecated. Use new API on .hooks instead`问题，去github对应项目下可以发现如下提示：

![](mini-css.png)

### loader的支持写法以及加载顺序

&emsp;&emsp;`loader`支持很多种写法，具体看实际场景，简单配置的可以直接写在一个字符串内比如`loader: 'style-loader!css-loader'`，匹配顺序**从右向左**。复杂配置的推荐还是用数组，虽然字符串也可以通过类似GET请求那种拼接方案来设置配置项，但是可阅读性太差了。在数组中，具体`loader`我们可以通过对象写法来配置，看上去就清晰明了，例子如下：

```javascript
  module.exports = {
    module: {
      rules: [
        test: /\.css$/,
        use: [
          {
              loader: MiniCssExtractPlugin.loader,
              options: {
                  hmr: true,
              }
          },
          {
              loader: 'css-loader',
          },
        ]
      ]
    }
  }
```

### less处理除了less-loader还需要装less的开发环境依赖

&emsp;&emsp;emm...这其实是我当时睿智了，想想都知道没有装`less`咋处理呢，通过`npm i -D less`解决。

### style-loader与mini-css-extract-plugin存在冲突

&emsp;&emsp;在我自己鼓捣小DEMO的时候，用`style-loader`都是没啥问题的，不过在迁移的项目里，加上就会报错。**这里就要理清一个问题，`style-loader`到底负责的内容是什么**，根据`webpack`官方的文档说明，它最终会将处理后的CSS以`<style></style>`的DOM结构写入HTML。然后思考一下前面的`mini-css-extract-plugin`功能，它俩最终想要的效果是一致的，会有冲突，所以我们移除`style-loader`即可。关联issue可以看下这个[issue](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/173)。

### css和less文件分开解析

&emsp;&emsp;最开始的时候，我对样式的处理都是通过正则`test: /\.(css|less)$/`写在一块的，但是一直编译报错，估计是具体配置项不能共享或者有冲突，分开单独做处理问题解决。

### antd的样式未加载

&emsp;&emsp;之前`roadhog`中在`webpackrc.js`中的处理是：

```javascript
  ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }],
```

&emsp;&emsp;改用`webpack4.x`后，在`.babelrc`文件中同样写入以上配置，**但是要把`style`的值设置为`css`**，修改后，`antd`样式成功载入。

### @connect装饰器报错

&emsp;&emsp;HOC的装饰器写法，需要配置babel支持。现在webpack一般都不直接在自身配置文件里面设置babel了，而是将babel的配置信息抽出来放到`.babelrc`内以JSON格式维护，在`plugins`内加入下面这段即可：

```javascript
  ["@babel/plugin-proposal-decorators", { "legacy": true }],
```

### babel版本

&emsp;&emsp;在转`webpack4.x`的过程中发现有babel报错的问题，后查发现是兼容性的坑，所以将有问题的怼到了`babel7.x`版本配合webpack，7.x版本的babel都带上了`@`前缀。

### CSS-IN-JS

&emsp;&emsp;因为项目内的样式是按照css-modules的规范来写的，所以编译的时候也需要开启支持，在`css-loader`的`options`内设置`modules: true`即可。

### 根据文件目录以及样式类名生成class

&emsp;&emsp;如此生成`class`名可以方便我们定位调试一些样式，比如你想在控制台`Element`的DOM树结构里`ctrl + F`检索对应样式类，然后直接进行调试。这里就需要接着上面的css-modules配置调整了：

```javascript
  {
      loader: 'css-loader',
      options: {
          importLoaders: 1, // 设置css-loader处理样式文件前 允许别的loader处理的数量 默认为0
          modules: {
              localIdentName: '[name]_[local]_[hash:base64:5]', // 修改生成的class的名称 name就是文件名 local对应类名 [path]支持路径
          }
      }
  },
  {
      loader: 'less-loader',
      options: {
          javascriptEnabled: true,
      }
  }
```

&emsp;&emsp;当时改的时候有一个坑，即不能像下面这样设置class：

![](localIndent-error.png)

&emsp;&emsp;改进后前后对比：

<p><img src="./no-classname.png" style="display: inline-block;"><img src="./localIndent.png" style="display: inline-block;margin-left: 55px;"></p>

### React is not defined

&emsp;&emsp;这是我迁移得差不多的时候突然发现的，即部分场景出现了`React is not defined`的报错，然后定位了代码发现的确会缺少依赖，比如我在一个组件中引入了`antd`的UI组件，即便只是对引入的UI组件进行纯函数的操作，但`antd`本身也有对`React`的依赖，那为什么之前`roadhog`处理就没有问题呢？肯定是有额外的插件做了骚操作！最后在stackoverflow上看到一个老哥的回答，又去webpack官方文档对比了下，靠谱！加入对应插件后解决该问题。

![](stack-overflow.jpg)

```javascript
  new webpack.ProvidePlugin({ // 根据上下文，在需要依赖React处，自动引入
      "React": "react",
  })
```

### 路由跳转组件未挂载

&emsp;&emsp;不吹不黑，这东西是我迁移过程中遇到最坑的问题...最早的时候我曾经在webpack输出的内容里看到`Router`的warning，但是后面就消失了，造成当时走了弯路，其实罪魁祸首是这个项目在`.webpackrc.js`内禁用了`import()`这种按需动态引入的方式，就直接导致了我编译出来的文件其实除了根路由的内容，别的内容缺失。找到根源，再定位解决，就容易了，看下`roadhog`内对应配置项是用什么处理的即可，最后引入`babel-plugin-dynamic-import-node-sync`解决：

![](webpackrc.jpg)
![](dynamic-disabled.jpg)

### CommonsChunkPlugin

&emsp;&emsp;webpack4.x中，该用于抽离不同入口文件公共部分的插件已被移除，改用`optimization`配置项下的`splitChunks`选项使用。

## What's more?

### progress-bar-webpack-plugin

&emsp;&emsp;用来在命令行可视化webpack编译进度的插件：

```javascript
  new ProgressBar({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: false
  })
```

### chalk

&emsp;&emsp;用来设置输出颜色的“粉笔”，通过`const chalk = require('chalk');`引入。

### friendly-errors-webpack-plugin

&emsp;&emsp;自定义输出提示工具：

```javascript
  new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
          messages: [`You application is running here http://localhost:3000`],
      },
  })
```

### webpack-merge

&emsp;&emsp;这个库主要是用来进行webpack分包的，针对不同环境和功能，我们完全可以将webpack配置文件拆成多个，比如`base`文件里就是分包的webpack会共用的配置信息，`dev`里就是`webpack-dev-server`和`development`模式下的配置信息，`prod`放生产部署的压缩优化配置，`dll`进行代码预编译，提升首次编译后的代码编译效率，一般结构如下:

![](build.jpg)

### DllPlugin&DllReferencePlugin

&emsp;&emsp;webpack携带的dll预编译插件，它会将几乎不改动的库进行编译（由你指定），然后生成一个编译后的`js`以及负责告知webpack之后编译过程哪些内容不需要再处理的`json`。

### portfinder

&emsp;&emsp;查找可用端口。

## Result

&emsp;&emsp;开发环境编译时长从之前的半分到一分钟不等到现在的10s左右：

![](dev.jpg)

## TODO

&emsp;&emsp;进行生产打包部署的替换。毕竟迁移后的打包结果还需要评估依赖缺失的风险，这中间需要经过大量测试及灰度验证...
