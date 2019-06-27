---
title: Commit与Git操作指南
date: 2019-06-27 08:34:42
tags:
  - Commit
  - Git Flow
---

> &emsp;敲代码的肯定不会没有使用过分支管理工具，本文主要聊一聊git；

## 如何维护我们的commit

&emsp;&emsp;为什么要从commit聊起，相信很多人开发的时候，由于担心自己的电脑会因为各种奇葩原因造成代码丢失，会经常进行`git add .`以及`git commit`的动作，这样固然是保证了代码的完整，但是同时也带来了许多冗余的commit信息，当你`push`到远程仓库时，别人看到的就是一大堆commit，对于一个多人维护的项目来说，若是遇到了需要回退的场景，就变得很难定位；

&emsp;&emsp;下面我们就学习一些`commit`的维护技术；

### 合并commit

&emsp;&emsp;当我们的commit的信息标记性不够明确时，我认为是可以将其与之后的确认某项进度完成的commit合并的，具体操作：`git rebase -i`