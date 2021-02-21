---
title: Mac上的MongoDB安装与环境配置
date: 2021-02-21 10:31:01
tags:
  - 数据库
  - MongoDB
---

> &emsp;记录下Mac上安装MongoDB与环境配置的过程。

<escape><!-- more --></escape>

### 软件包下载

&emsp;&emsp;直接去官方网站，填写基本信息进行下载，[传送门](https://www.mongodb.com/try?jmp=nav#community)。

&emsp;&emsp;下载完成后我们会得到一个`.tgz`后缀的压缩包，我们需要将解压后的内容放入到`/usr/local/MongoDB`下。

&emsp;&emsp;由于我们之后希望在全局直接使用`mongod`指令，需要像windows那样配置环境变量。

### .bash_profile

&emsp;&emsp;mac的环境变量通常是在`.bash_profile`文件中配置的。

&emsp;&emsp;通常配置流程如下：

&emsp;&emsp;1. 打开`Terminal`
&emsp;&emsp;2. 进入Home目录，`cd ~`
&emsp;&emsp;3. 如果没有`.bash_profile`文件，则进行创建，`touch .bash_profile`
&emsp;&emsp;4. 打开，`open -e .bash_profile`
&emsp;&emsp;5. `command + s`保存后退出
&emsp;&emsp;6. 更新环境配置，`source .bash_profile`

### 添加MongoDB的环境变量

&emsp;&emsp;添加步骤其实就是在上面的第四步，`open -e .bash_profile`时执行，在打开的文件`.bash_profile`内写入`export PATH=${PATH}:/usr/local/MongoDB/bin`即可。

&emsp;&emsp;在保存更新配置后，通过`mongod -version`即可确认是否安装配置成功。

![](mongo.jpg)