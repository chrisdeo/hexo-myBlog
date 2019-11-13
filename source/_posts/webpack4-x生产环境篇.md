---
title: webpack4.x生产环境篇
date: 2019-11-12 20:43:26
tags:
  - webpack
  - 工程化
---

> &emsp;之前做过开发环境的webpack4.x迁移，但是由于一些原因后续生产的配置改造搁置了...近期正在着手处理这块，本文是对迁移过程的记录分享，包括一些新版本的处理方式和实际改写存在的问题。

<escape><!-- more --></escape>

&emsp;&emsp;想看前期开发环境配置记录的可以走该[传送门](https://chrisdeo.github.io/2019/08/09/%E8%AE%B0%E4%BB%8Eroadhog2-x%E8%BF%81%E7%A7%BB%E8%87%B3webpack4-x/)。

&emsp;&emsp;下面开始正文...

## 踩坑

### mode

&emsp;&emsp;上次的分享中有讨论过在新版本的webpack内，有约定大于配置一说，但是当时其实我配置的部分内容其实是有问题的，比如`process.env.NODE_ENV`在默认情况下将会得到`development`，在生产的`config`文件内，我们可以通过直接设置`mode`属性进行`merge`，它会被关联到`process.env.NODE_ENV`上。

```javascript
let prodConfig = merge(baseConfig, {
    mode: 'production',
    // ...
});
```

&emsp;&emsp;老版本也有类似下面的设置：

```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production')
})
```

### url-loader

&emsp;&emsp;在配置生产环境打包文件的过程中，我发现之前处理文件输出的`loader`写法也存在问题。因为最终我们的静态资源都要放在一个`dist`目录下，并且通常是不会改变的（请结合自身实际业务场景）。那我需要的就是将`url()`引到的文件，原封不动地输出到`dist`中。那我之前的写法是怎么样的呢？

```javascript
{
    loader: 'url-loader',
    options: {
        limit: 1024,
        outputPath: 'images'
    }
}
```

&emsp;&emsp;这样处理会有两个问题：

1. 文件打包时输出路径并不在`dist`下。我们调整时，需关注`output`中的`path`设置。
2. 没有配置`name`。该属性会指定文件输出时的名称，缺省状态下会生成一串哈希值（不包含原文件名）。

&emsp;&emsp;改写：

```javascript
{
    loader: 'url-loader',
    options: {
        limit: 1024,
        name: '[name].[ext]', // 原文件名.后缀  等价于输出原文件名
        outputPath: './'  // 结合path 定位输出目录为dist
    }
}
```

### DllReferencePlugin

&emsp;&emsp;这是一个归属于`webpack`下的插件，通过如下方式配置，会检视`manifest.json`中的映射关系略过已被处理的模块。与开发环境配置一文中的处理相同。

```javascript
new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: require('./dist/vendor-manifest.json')
})
```

### CleanWebpackPlugin

&emsp;&emsp;用于清理文件目录的插件，通常我们会在重新打包编译前清空你存放部署文件的目录，比如我们的`dist`。引入方式务必注意，在`webpack4.x`版本中，我们须要通过`const { CleanWebpackPlugin } = require('clean-webpack-plugin')`的方式引用。

&emsp;&emsp;前文我们有讨论会先打一个`dll`出来，而配置`dll`时，我们已经清理了一次目录，在`build`时，我们同样需要再清理一次之前可能打包过的旧内容，但像`vendor.dll.js`、`vendor.manifest.json`之类的`dll`生成内容需要保留，我们可以结合该插件提供的生命周期属性`cleanOnceBeforeBuildPatterns`介入：

```javascript
new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: ['**/*', '!vendor.dll.js', '!vendor-manifest.json', '!vendors~pdfjsWorker.dll.js'], // 数组格式，通过!保留你要的内容，第一个参数表明当前目录
})
```

### CopyWebpackPlugin

&emsp;&emsp;当然，我们可能有些静态资源不是通过`url`引用的，须要我们手动输出到`dist`下，可以通过`CopyWebpackPlugin`插件拷贝过去：

```javascript
new CopyWebpackPlugin([
    {
        from: './public/',
        to: './'
    }
])
```

### HtmlWebpackPlugin

&emsp;&emsp;这个跟开发环境的配置也类似，不过我们部署时须要写入文件，并且要适当减小体积，可以如下操作：

```javascript
new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './src/index.ejs'),
    filename: 'index.html',
    alwaysWriteToDisk: true,  // 写入磁盘
    chunks: ['vendor', 'index'],  // 配置取决于你的分块内容，有分块加vendor
    minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
    }
})
```

### optimization压缩优化

&emsp;&emsp;过去版本的webpack常采用`UglifyJsPlugin`进行代码压缩，在webpack4.x中则改为在`optimization`下配置`minimizer`的方案，接收一个数组，里面是使用插件。我们主要使用`TerserPlugin`：

```javascript
  optimization: {
      minimize: true,
      minimizer: [
          new TerserPlugin({
              terserOptions: {
                  output: {
                      comments: false, // 配合下面的extractComments，移除代码中注释
                      compress: {}, // 默认 设置false可以跳过压缩环节 想自己定制 见 https://github.com/terser/terser#compress-options
                  },
              },
              // sourceMap: true,
              extractComments: false, // 不单独提取/^\**!|@preserve|@license|@cc_on/i规则的注释，并生成xx.js.LICENSE
              cache: true,  // 开启缓存
              parallel: true, // 是否并发 设置为true 并发数为 os.cpus().length - 1 即你的内核数 - 1 也可以手动指定数字
          }),
      ]
  }
```

### stats

&emsp;&emsp;这个属性是用来控制命令行输出统计内容的，默认情况下我们会看到一堆输出内容，非常冗余。事实上，我们只想看到最后输出了哪些文件以及报错时是什么问题，下面是我的配置:

```javascirpt
stats: {
    all: false, // 不输出全部信息
    assets: true, // 输出最后的打包文件
    errors: true, // 遇到错误时，输出内容
    warnings: false,  // 静默warning
    moduleTrace: true,  // 遇到错误时，定位文件
    errorDetails: true, // 输出具体错误
}
```

## 比较

&emsp;&emsp;以上大致就是本人迁移中遇到的一些问题，下面贴一下操作前后的比较图...

&emsp;&emsp;原本脚手架自带的打包：

![](old.jpg)

&emsp;&emsp;这里可能有同学会问这个`File sizes after gzip`是什么，打出来的体积就是`gzip`压缩体积吗？其实不是的，它只是在`react-dev-utils`库中的一些方法帮助下计算了文件处理后的体积，并非是真实进行了处理。是否开启`gzip`需要服务器的处理。

&emsp;&emsp;迁移魔改后：

1. 打`dll`耗时：

![](newDll.jpg)

2. 生产`build`：

![](newB.jpg)