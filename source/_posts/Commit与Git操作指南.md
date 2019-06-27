---
title: Commit与Git操作指南
date: 2019-06-27 08:34:42
tags:
  - Commit
  - Git Flow
---

> &emsp;敲代码的肯定不会没有使用过分支管理工具，本文主要聊一聊git。

## 如何维护我们的commit

&emsp;&emsp;为什么要从commit聊起，相信很多人开发的时候，由于担心自己的电脑会因为各种奇葩原因造成代码丢失，会经常进行`git add .`以及`git commit`的动作，这样固然是保证了代码的完整，但是同时也带来了许多冗余的commit信息，当你`push`到远程仓库时，别人看到的就是一大堆commit，对于一个多人维护的项目来说，若是遇到了需要回退的场景，就变得很难定位，下面我们就学习一些`commit`的维护技术。

<escape><!-- more --></escape>

### 修改commit message

#### 修改当前的commit message

&emsp;&emsp;最常见的应该就是我们commit的message写不是很规范，或者说标注错了，就需要我们重新修改一下，这时可以使用`git commit --amend`，该命令可以修改当前`HEAD`指向commit的message，如下图所示：

![](amend.jpg)

![](change.jpg)

#### 修改之前版本的commit message

&emsp;&emsp;这里我们就要使用到`git rebase -i`指令了，该指令可以帮助我们分离头指针，进入交互的控制界面：



### 版本回退

#### commit内容未push到远程仓库

&emsp;&emsp;前面讲的是修改当前指针指向的message，那如果我想修改之前的commit信息呢？你可能会说我们先版本回退回去，这样指针不就指向那个位置了么？**理论上是这样没错，不过你会丢失在那个指针之后的内容**不过我们还是先操作一波理解一些基本命令的实际执行情况（后面会有正经的解决方案），先执行`git log --pretty=oneline`，`--pretty=oneline`将修改日志内容在一行内给你显示出来，方便我们直观地得到想要的信息：

![](log.jpg)

&emsp;&emsp;找到我们想要回去修改commit message的id，如上图中message为`..`处，我们执行`git reset --hard commitId`：

![](resetHard.jpg)

![](resetResult.jpg)

&emsp;&emsp;可以看到我们回退后，头指针已经指向了我们之前的commitId，但是之后的内容就不存在了，我们的确可以在此处修改当前message，但是一旦我们还原到之前的commitId，这里的修改也被还原到了之前的配置，先看如何还原：我们能通过`git reflog`查找到之前的操作日志，其中会包含我们的每一次操作id。

![](reflog.jpg)

&emsp;&emsp;我们再次reset回之前的头指针处，之前的那次修改就不在了，所以我们不会通过这种方式去修改过去的commit的message，但是以上的回退过程是**我们在未push到远端仓库前的基本回滚流程。**

&emsp;&emsp;`git reset`支持三种不同的配置，`--mixed`，`--soft`以及`--hard`。

&emsp;&emsp;1. `--mixed`：不写额外配置时，默认为`mixed`，它会将暂存区的内容和本地已提交的内容全部恢复到未暂存的状态，并且不影响本地文件状态(即你现在还没保存的那些内容都不会发生改变)；
&emsp;&emsp;2. `--soft`：将已提交内容恢复到暂存区，暂存区原先存储内容不变，本地文件状态同`mixed`也不变；
&emsp;&emsp;3. `--hard`：清空暂存区，将已提交内容版本恢复到本地，本地文件内容将会发生变化，会被回滚版本内容替代； 

&emsp;&emsp;根据以上几种模式，我们如果遇到**前几个commit message冗余想要在当前的commit中总结成一条**的场景可以直接使用`git reset HEAD~number`，`number`为你想合并的commit数量，当前头指针也会被纳入计算；比如我现在要回退(合并)5个commit信息：

&emsp;&emsp;1. `git reset HEAD~5`；
&emsp;&emsp;2. `git add .`；
&emsp;&emsp;3. `git commit -nm 'combination'`；

![](half.jpg)
![](reset5.jpg)
![](combine.jpg)

#### commit内容已push到远程仓库

&emsp;&emsp;以上，我们讨论了commit内容未提交到远端时的回滚流程，当你commit内容已经push到远程仓库，如果是个人项目并且是你独立开发，已经推送到远端的后续内容都不想要了，那可以`reset`后再`push`，不过这里要注意的是，由于此时你的本地代码已经与远程仓库的代码不一致了，你需要强制推送，执行`git push -f origin 分支`；但是大部分我们构建的项目是多人参与合作的，可能你往远程推送内容后，后续又有别的合作者提交了新的内容，这时候你如果要进行之前的代码回滚或者commit修改就不是那么容易了。