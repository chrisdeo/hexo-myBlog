---
title: Hexo+Next主题建站指南
no-emoji: true
date: 2018-11-14 10:11:25
tags: Hexo
---

> &emsp;本篇博文主要是记录通过Hexo搭建个人博客的历程以及遇到的一些坑，当然也提供了填坑方案 {% github_emoji laughing %}。

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

&emsp;&emsp;启动成功后，会默认在4000端口挂上，当然也可以通过`-p 指定端口号`进行修改，避免一些端口占用的问题。这一点跟其他web开发是差不多的，比如你正在开发React项目，又恰好也挂在了4000端口, {% github_emoji boom %}。

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

## 如何挂到自己的域名下

&emsp;&emsp;其实这一步原理就是很简单的DNS解析跳转，首先你需要有一个自己的域名，去阿里云、腾讯云、amazon买都阔以，然后在控制台进行解析，像我是在阿里云买的域名，操作如下图：
![](操作.jpg)

**然后你需要在你的HEXO部署文件生成的目录下（注意这里是hexo g生成静态文件存放的目录，比如说我在使用next主题，就是在themes/next下的source中）新建一个CNAME文件（无后缀格式），我们可以通过linux命令行方式touch一个，vi写入你的域名名称。**

![](CNAME.jpg)

## 如何开启一些自定义功能

&emsp;&emsp;就我看来，Hexo相当于是一个脚手架帮你把需要的大致结构build出来，然后你选一个主题进行编辑，这个主题已经是前面的开发者的劳动成果了，我们可以更快地输出我们想要的页面效果。

&emsp;&emsp;这个博客使用的是iissnan的Next主题，并在这上面开启了一些自定义功能，诸如文章字数统计、嵌入网易云音乐、canvas动画背景等。这里主要讲一下我开启的功能。

### 添加Live2D插件

&emsp;&emsp;可以看到Blog右下角有一只黑喵，这其实就是`live2d-widget-model`这个包里的模型之一，我们可以先执行以下命令：

&emsp;&emsp;`npm i hexo-helper-live2d --save`
&emsp;&emsp;`npm i live2d-widget-model-hijiki --save`

&emsp;&emsp;然后在项目根目录下的config.yml内添加以下内容：

```
live2d:
  enable: true
  scriptFrom: local # 默认
  pluginModelPath: assets/ # 模型文件相对与插件根目录路径
  model:
    use: live2d-widget-model-hijiki # 替换成你装的live2d模型包
    scale: 1
    hHeadPos: 0.5
    vHeadPos: 0.618
  display:
    superSample: 2   
    width: 150
    height: 300
    position: right  # 控制模型在哪一侧展示
    hOffset: 0       # 水平偏移量，想远离main区域，取负值
    vOffset: -20     # 垂直偏移量
  mobile:
    show: true       # 移动端是否显示
    scale: 0.5
  react:
    opacityDefault: 0.7   # 控制看板模型的透明度
    opacityOnHover: 0.2
```

### 嵌入网易云音乐

&emsp;&emsp;在页面上嵌入网易云音乐播放器，其实原理很简单，就是把一个iframe嵌入，当然这样会有一些安全问题，一些博客好像有限制这方面的操作，需要手动配置解除。一般嵌入流程如下：

```
  1. 进入网易音乐，找到自己想要导入音乐的歌单
  2. 进入歌单，点击 生成外链播放器 链接 复制其中的HTML 代码
  3. 在layout目录下找到你想要添加的位置，由于Hexo里的HTML是模板语法构造的，所以推荐在Chrome的控制台Element里找关键词，再在项目内全局检索，这样比较快。
```

### Canvas动画背景

&emsp;&emsp;这个东西其实是Next主题里本身就有配置的，不过大部分在初始构建项目时，是被注释掉的，所以启动时没有加载对应库。然后我们在主题下的config.yml内找到`canvas_nest`的外部加载属性，打开一条注释，或者使用别的可用的CDN，然后再将 `enable` 置为 `true` 便可以在我们的博客中加载出canvas动画效果了。

### 文章字数统计

&emsp;&emsp;要开启字数统计我们需要先通过`npm i hexo-wordcount --save`安装依赖，然后再在主题下的config.yml内加入以下配置属性：

```
post_wordcount:
  item_text: true
  wordcount: true
  min2read: true
  totalcount: true
  separated_meta: true
```

**全站字数统计:  totalcount(site)**
**每篇文章字数统计:  wordcount(post.content)**

配置完毕后，将上述统计函数放置你需要展示的HTML结构处，使用模板的方式调用。

### emoji表情

&emsp;&emsp;在做让页面显示emoji表情功能时是走了不少弯路的...参照网上的一些博文，先把hexo项目初始化自带的渲染markdown的包`hexo-renderer-marked`给卸载了，然后装了个`hexo-renderer-markdown-it`，还装了一些额外的库，最后发现还是无法渲染`:emoji变量名:`这种格式的emoji图片，最后发现其实github本身已经有支持这方面的库了，实现流程如下：

安装依赖：
  `npm install hexo-filter-github-emojis --save `
  ***PS ：***
  1. 如果你跟我一样前面移除了原有的渲染库，可以再执行`npm un hexo-renderer-markdown-it`, `npm i hexo-renderer-marked`恢复原有配置。
  2. 这个命令安装的是最新的稳定版本，网上有些别的博客里使用的是1.X版本的，其内部构造HTML的方式不太一样，请衡量自己版本后再进行后续操作。

主题config.yml配置：

```
githubEmojis:
  enable: true
  className: github-emoji
  inject: true
  styles:        #这里可以配置你的emoji表情大小 粗细，其实就是span的样式
  customEmojis:    #定制你的emoji
    定制的emoji名: url   #会先匹配你的url图片，如果没有匹配到会再到Github Emojis中去找相同命名的emoji
```

***问题：*** 在以上配置完后，通过`:emoji变量名:`的方式我的表情已经能够正常显示了，但是在开启文章折叠功能以后，`:emoji变量名:`似乎是遇到了解析问题，直接以文本形式展示了。

后面在官方文档里看到了另外一种使用方式：

```
---
title: Hello World  #你的文章标题
no-emoji: true  #在标题下添加该配置行，原有的按冒号中间加变量名这种方式将失效
---

:tada: # 不会被解析

{% github_emoji tada %} # 用该方式替代
```

修改后，解析恢复正常。

