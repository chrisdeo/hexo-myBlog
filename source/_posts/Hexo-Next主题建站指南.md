---
title: Hexo+Next主题建站指南
date: 2018-11-14 10:11:25
tags: Hexo
---

> &emsp;本篇博文主要是记录通过Hexo搭建个人博客的历程以及遇到的一些坑，当然也提供了填坑方案 :laughing:。

## 相关依赖

### Node.js&Npm

&emsp;&emsp;此处的相关依赖指的不仅是***Node.js***和***Npm***，以及后面我们进行一些配置时需要在package.json中写入的依赖，通常我们通过
`npm i 依赖包@版本号 --save`命令来安装，版本号不加会默认下载最新版本的，可能会造成一些兼容性问题，同时可能会与你在网络上看到的一些教程有所差异。

&emsp;&emsp;由于Node和Npm是捆绑安装的，我们只需要官方下载Node即可，传送门：[Node官方下载](https://nodejs.org/en/download/)。

<escape><!-- more --></escape>

### Hexo部署依赖

&emsp;&emsp;先看看官方的本地开发启动操作：

```
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo server
```

&emsp;&emsp;启动成功后，会默认在4000端口挂上，当然也可以通过`-p 指定端口号`进行修改，避免一些端口占用的问题。这一点跟其他web开发是差不多的，比如你正在开发React项目，又恰好也挂在了4000端口, :boom:。

&emsp;&emsp;其实一般到这里，按照官方文档以及一些网上的博客都没什么毛病，主要是后面我们需要将本地的Hexo项目给部署到Github Pages上，具体怎么部署，后面小节在描述(差点忘了这节是讲要装哪些依赖的)。

&emsp;&emsp;Hexo的部署指令，非常简单就一句`hexo deploy`，但是我在执行的时候报了个`Deployer not found: git`的Error，这里我们需要装一个依赖，执行`npm install hexo-deployer-git --save`即可。当然这个跟config.yml下的deploy.type也有关系，除了*git*类型外，也有可能是*heroku*、*rsync*等，这些情况要对应装不同的**hexo-deployer**。

#### 通常情况下Hexo的部署

```
hexo clean // 清除缓存文件 (db.json) 和已生成的静态文件 (public)
hexo g // hexo generate的简写 和 npm run build 这种作用结果类似，生成需要部署的静态文件
hexo d // hexo deploy的简写 部署到你的服务器上 
```
### 图片依赖

&emsp;&emsp;在**What is Markdown?**一文中有介绍过如何在markdown中插入图片，但实际我在撰写博文的时候，还是出了问题: 在指定图片路径后发现并没有按预期出现图片，目测是markdown与Hexo发布时引用图片的路径有差异所致，我们通过执行以下命令安装**hexo-asset-image**插件解决该问题。

&emsp;&emsp;`npm install hexo-asset-image --save`

&emsp;&emsp;安装完成后，我们还要在**项目根目录的config.yml**内把`post_asset_folder`设为**true**，这之后再通过命令`hexo new post 文章名`开始文章编写时，`_posts`目录下便会生成一个以该文章名命名的目录，我们将需要使用的图片放在该目录下，通过`![](文章名/你的图片.后缀)`即可成功在文章中显示图片。

## 如何部署到gitHub.io

&emsp;&emsp;以前的博客是WP做的，还弄了台阿里云服务器挂了上去，不过后面服务器到期，莫得钱续费了，上面也没啥货，就不打算迁移了，而且现在身份也从学生变成社畜了，网络上转了一圈发现Hexo大佬们用的比较多，嗯，当然是选择加入了！最关键的是什么呢，挂在github上**免费**啊（破音。

&emsp;&emsp;这里就默认看到本文的人都有github的账号了，没有问题也不大，网上关于github注册、ssh秘钥设置、git flow怎么玩的教程一搜一大把。

***核心步骤：***
*
&emsp;&emsp;1. 在Github的repo下建立一个名为  username.github.io  的库，username请替换为你的账户名
&emsp;&emsp;2. 到根目录的config.yml内，把url的属性替换为 `https://username.github.io/` username请替换为你的账户名
&emsp;&emsp;3. 到根目录的config.yml内，把deploy下的type属性修改为git，repo属性替换为**SSH模式下的项目clone地址**，即以 git@github.com 这种开头格式的，不然会报错（我是遇到了这种情况，别的开发环境不太清楚。branch属性替换为master就好，你要是开了别的命名分支，并在那个分支上开发，请命名成你的那个分支。**最后不要忘了yml语法里键值对冒号后要有一个空格**。
&emsp;&emsp;4. 执行前文中的Hexo部署命令即可成功部署。
*

**PS: Github Pages并不是即时生效的，可能会有延迟，稍等一会即可。**

## 如何开启一些自定义功能

&emsp;&emsp;就我看来，Hexo相当于是一个脚手架帮你把需要的大致结构build出来，然后你选一个主题进行编辑，这个主题已经是前面的开发者的劳动成果了，我们可以更快地输出我们想要的页面效果。

&emsp;&emsp;这个博客使用的是iissnan的Next主题，并在这上面开启了一些自定义功能，诸如文章字数统计、嵌入网易云音乐、canvas动画背景等。这里主要讲一下我开启的功能。

### 添加Live2D插件

&emsp;&emsp;可以看到Blog右下角有一只黑喵，这其实就是`hexo-helper-live2d`这个包里的模型之一，我们可以先执行以下命令：

&emsp;&emsp;`npm i hexo-helper-live2d --save`
&emsp;&emsp;`npm i live2d-widget-model-hijiki --save`

&emsp;&emsp;然后在项目根目录下的config.yml内添加以下内容：

```
live2d:
  enable: true
  scriptFrom: local # 默认
  pluginModelPath: assets/ # 模型文件相对与插件根目录路径
  model:
    use: live2d-widget-model-wanko # npm-module package name
    scale: 1
    hHeadPos: 0.5
    vHeadPos: 0.618
  display:
    superSample: 2
    width: 150
    height: 300
    position: right
    hOffset: 0
    vOffset: -20
  mobile:
    show: true
    scale: 0.5
  react:
    opacityDefault: 0.7
    opacityOnHover: 0.2
```