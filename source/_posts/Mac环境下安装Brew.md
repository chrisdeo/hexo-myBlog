---
title: Mac环境下安装Brew
date: 2021-05-25 15:26:11
tags:
  - Mac
  - Brew
  - watchman
---

&emsp;&emsp;最近RN打包的时候遇到一个`Error: EMFILE: too many open files`问题，直接导致原因就是本人手滑删了一波`node_modules`产生了一些微妙变化。后经科学上网，通过安装`brew`（要有外网，国内比较困难）更新下载了一波`watchman`得以解决。

```shell
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew update
$ brew install watchman
```