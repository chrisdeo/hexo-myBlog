---
title: Hexo+Next主题建站指南
date: 2018-11-14 10:11:25
tags: Hexo
---

> &emsp;&emsp;本篇博文主要是记录通过Hexo搭建个人博客的历程以及遇到的一些坑，当然也提供了填坑方案 :laughing:。

## 相关依赖

### Node.js&Npm

&emsp;&emsp;此处的相关依赖指的不仅是***Node.js***和***Npm***，以及后面我们进行一些配置时需要在package.json中写入的依赖，通常我们通过
`npm i 依赖包@版本号 --save`命令来安装，版本号不加会默认下载最新版本的，可能会造成一些兼容性问题，同时可能会与你在网络上看到的一些教程有所差异。

&emsp;&emsp;由于Node和Npm是捆绑安装的，我们只需要官方下载Node即可，传送门：[Node官方下载](https://nodejs.org/en/download/)。

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