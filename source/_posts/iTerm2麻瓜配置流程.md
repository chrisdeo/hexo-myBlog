---
title: iTerm2麻瓜配置流程
date: 2021-06-07 15:48:12
tags:
  - Mac
  - iTerm2
---

&emsp;&emsp;收集记录下网络上一些博文中iTerm2的下载及定制流程。

<escape><!-- more --></escape>

&emsp;&emsp;使用Mac的同学，最开始使用的终端工具一般都是系统自带的Terminal，长下面这样：

![](Terminal.jpg)

&emsp;&emsp;你要说它丑吧，我其实还能接受- -，也一直用过一段时间。刚买Mac那会也搜过一些开发者使用Mac需要装些什么东西的资料，其中就有一条推荐安装一个别的终端工具替换自带的Terminal，即本文记录的iTerm2。

&emsp;&emsp;之前为什么没有装呢？emm，实际上是网络问题，懂得都懂🤷‍♂️。

### 配置流程

#### 安装iTerm2

&emsp;&emsp;这个简单，直接走[传送门官网🔗](https://iterm2.com/index.html)下载，解压，拖到`Application`内。

&emsp;&emsp;但此时的终端样式依旧比较简单，只不过变成了暗色主题，缺少一些高亮效果。

#### 下载oh my zsh

&emsp;&emsp;Oh My Zsh是一个开源、社区驱动、用起来舒服的shell配置框架，它集成了非常多工具方法、插件和主题。

&emsp;&emsp;下载方法通常有以下两种：

1. 外网可访问情况下：

```javascript
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

2. 走github拉取源码或者直接下载压缩包：

```javascript
// 下载 oh-my-zsh 源码
git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
// 并且把 .zshrc 配置文件拷贝到根目录下
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
// 让 .zshrc 配置文件生效
source ~/.zshrc
```

```javascript
cd ~/Downloads
mv ohmyzsh-master ~/.oh-my-zsh
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
source ~/.zshrc
```

&emsp;&emsp;这里有一个细节，就是`.zshrc`文件。Mac初始情况下安装oh-my-zsh是不会带这个文件的，所以需要我们手动操作一下：

```javascript
touch ~/.zshrc
vi ~/.zshrc
```

#### 懒人配色主题iTerm2-Color-Schemes

&emsp;&emsp;直接先去github上拉取项目代码保存到某个文件目录下or下载软件包解压：

```javascript
mkdir iterm2
cd iterm2
git clone https://github.com/mbadolato/iTerm2-Color-Schemes
```

&emsp;&emsp;导入iTerm2：

![](step1.jpg)

![](step2.jpg)

![](step3.jpg)

![](step4.jpg)

&emsp;&emsp;导入后，在图二中选择我们新导入的主题配置。

#### 安装字体PowerFonts

&emsp;&emsp;这一步主要是为了应对一些乱码显示异常的场景，同样我们可以通过拉取源码库进行编译下载：

```javascript
git clone https://github.com/powerline/fonts.git --depth=1
cd fonts
./install.sh
```

&emsp;&emsp;选择带有`Powerline`字样的字体。

![](font.jpg)

#### 卸载oh-my-zsh

```javascript
cd ~/.oh-my-zsh/tools
chmod +x uninstall.sh
./uninstall.sh
```

#### 可能会突然出现什么颜色都无法应用的场景

&emsp;&emsp;对策如下：

1. 修改`./bash_profile`内容，见外网博客 [Color scheme not applied in iTerm2](https://superuser.com/questions/399594/color-scheme-not-applied-in-iterm2/448892#448892)。

2. 重装一遍oh-my-zsh，卸载和安装步骤见前文。

#### zsh-syntax-highlighting

&emsp;&emsp;准确来说这是一个来判断你的命令行是否拼写正确的zsh插件，完整正确会显示绿色，否则为红色：

![](error.jpg)
![](correct.jpg)

&emsp;&emsp;安装直接用`brew`就好：

```javascript
brew install zsh-syntax-highlighting
```

&emsp;&emsp;`vi ~/.zshrc`编辑，添加以下内容：

```javascript
source ~/.zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
plugin(git zsh-syntax-highlighting)
```

### 效果

![](display.jpg)