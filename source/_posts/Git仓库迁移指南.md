---
title: Git仓库迁移指南
date: 2020-12-02 16:42:41
tags:
  - Git
  - 仓库迁移
---

> &emsp;在老东家和现厂都遇到过运维须要更换服务器的情况，那么我们原本的Git仓库提交的url指向就要改变了，以前的文章我曾记录过普通的更换Git仓库指向的方案，但是会丢失以前的提交信息。那么如何在迁移新地址的同时保留我们的commit信息呢？

<escape><!-- more --></escape>

&emsp;&emsp;先回顾一下普通改变指向但是不会保留以前提交信息的做法：`git remote set-url 定制名(一般我们都是给origin) git@xxx.git`。

&emsp;&emsp;要保留commit信息的方式其实就是在上面的操作前多做两步：

&emsp;&emsp;1. `git clone --bare 老仓库.git`，**通过bare拉取**。这种拉取实际拉取下来的是一个`xxx.git`文件目录，里面是我们原本的仓库完整的内容（tag, branch, commit信息等）。

&emsp;&emsp;2. 在这个新的老仓库本地目录下进行**mirror推送**：`git push --mirror 新仓库.git`。

&emsp;&emsp;最后就是执行最开始那段修改远程指向的指令。