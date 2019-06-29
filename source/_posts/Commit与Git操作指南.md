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

&emsp;&emsp;这里我们就要使用到`git rebase -i`指令了，该指令可以帮助我们分离头指针，进入交互的控制界面。

&emsp;&emsp;进入交互界面后，会列出最新的几条commit信息，越往下内容越新，并且我们可以看见id前都跟着`pick`，意味着它们被正常选中，下面看看`git rebase`支持哪些操作：

&emsp;&emsp;- `pick`：正常选中；
&emsp;&emsp;- `reword`：选中，并且修改提交信息；
&emsp;&emsp;- `edit`：rebase时会暂停，允许你修改这个commit；
&emsp;&emsp;- `squash`：选中，会将当前commit与上一个commit合并；
&emsp;&emsp;- `fixup`：与squash相同，但不会保存当前commit的提交信息；
&emsp;&emsp;- `exec`：执行其他shell命令；


然后我们使用linux编辑文件的方式在其中选择我们要修改的commit将前面的`pick`修改为`reword`，键入`esc`，输入`:wq`保存，会打开另外一个`edit`的界面，我们在里面可以重新编辑之前的message信息：

![](reword.jpg)
![](changeMsg.jpg)
![](newMsg.jpg)
![](changeRes.jpg)

&emsp;&emsp;现在我们可以看到我们选中的那条`aboutRevert`信息已经被修改成`iChangeThisMsg`了。

### 迁移commit内容

&emsp;&emsp;相信大家都曾遇到过自己开发着开发着...发现分支不对，但是代码都写了，总不能复制粘贴这么low吧，`git`提供了一个操作就是`git cherry-pick`，我们先通过`log`日志找到我们当前操作完成的commitId，再切换回正确的开发分支，执行`git cherry-pick commitId`即可，之前的内容你可以进行代码回滚，如何操作见后文。

![](cherry.jpg)
![](pick.jpg)

### 版本回退

#### commit内容未push到远程仓库

&emsp;&emsp;我们通过执行`git log --pretty=oneline`，`--pretty=oneline`能够将每次commit的改动内容浓缩到一行内，方便我们查阅：

![](log.jpg)

&emsp;&emsp;假如我们的提交内容还没有push到远程仓库，突然遇到了版本回退的问题，我们需要回到那一个正常的版本节点，如上图中message为`..`处，我们可以执行`git reset --hard commitId`：

![](resetHard.jpg)

![](resetResult.jpg)

&emsp;&emsp;可以看到我们回退后，头指针已经指向了我们之前的commitId，但是之后的内容就不存在了。所以根据你的实际情况，可以考虑在回退之前拉一条分支出来做一个备份。那如果你手速太快没备份就切回去了还能再还原到之前的位置么，答案是肯定的：我们能通过`git reflog`查找到之前的操作日志，其中会包含我们的每一次操作id，再借助这个id `reset`回去即可。

![](reflog.jpg)

&emsp;&emsp;`git reset`支持三种不同的配置，`--mixed`，`--soft`以及`--hard`。

&emsp;&emsp;1. `--mixed`：不写额外配置时，默认为`mixed`，它会将暂存区的内容和本地已提交的内容全部恢复到未暂存的状态，并且不影响本地文件状态(即你现在还没保存的那些内容都不会发生改变)；
&emsp;&emsp;2. `--soft`：将已提交内容恢复到暂存区，暂存区原先存储内容不变，本地文件状态同`mixed`也不变；
&emsp;&emsp;3. `--hard`：清空暂存区，将已提交内容版本恢复到本地，本地文件内容将会发生变化，会被回滚版本内容替代； 

&emsp;&emsp;前文中我们讨论过如何修改commit的message，现在根据以上几种模式，当我们遇到**前几个commit message冗余想要在当前的commit中总结成一条**的场景可以直接使用`git reset HEAD~number`，`number`为你想合并的commit数量(当前头指针也会被纳入计算)。举个例子，我现在要回退(合并)5个commit信息：

&emsp;&emsp;1. `git reset HEAD~5`；
&emsp;&emsp;2. `git add .`；
&emsp;&emsp;3. `git commit -nm 'combination'`；

![](half.jpg)
![](reset5.jpg)
![](combine.jpg)

#### commit内容已push到远程仓库

&emsp;&emsp;以上，我们讨论了commit内容未提交到远端时的回滚流程，当你commit内容已经push到远程仓库，如果是个人项目并且是你独立开发，已经推送到远端的后续内容都不想要了，那可以像前文所述通过`reset`后再`push`，不过这里要注意的是，由于此时你的本地代码已经与远程仓库的代码不一致了，你需要强制推送，执行`git push -f origin 分支`；但是大部分我们构建的项目是多人参与合作的，可能你往远程推送内容后，后续又有别的合作者提交了新的内容，这时候你如果要进行之前的代码回滚或者commit修改要考虑的东西就多了，下面我们介绍一下`git revert`的使用，**`git revert`用于反转提交，简单来说该指令相当于将你想回退到的节点的commit内容作为一个新的commit添加到你的HEAD头处，即你回退版本的后续commit信息也将保留。**

![](revert.jpg)

&emsp;&emsp;A`就是我们对A的回退生成的新commit，它的内容与A时期是一致的，中间的B被保留在commit记录中。

&emsp;&emsp;那么`git reset`和`git revert`差异点在哪里？

&emsp;&emsp;1. `git reset`会直接删除从当前到你回退节点中间的commit内容，而`git revert`则是用一次新的commit来回滚之前的commit，中间的commit记录不会被消除；
&emsp;&emsp;2. `git reset`回滚后的分支与历史分支合并后，`reset`恢复的内容依然会在历史分支内，但是`revert`的内容则不会；
&emsp;&emsp;3. `git reset`操作后，HEAD指针相当于往后移了，而`git revert`则是一直向前移；

##### 如何撤销历史中的某一项commit

&emsp;&emsp;有时候我们会遇到一些比较坑爹的情景，比如某一个版本上线了，突然收到通知说有个功能不要了，需要下掉，要临时发布一个新版本...这种时候如果你之前的commit message都能很精确地描述了你在这次commit中做了什么还是比较好处理的，比如说你这个commit就是开发的那个完整的功能模块内容，那我们只需要针对这个id处理即可，大致流程如下：

&emsp;&emsp;- 找到你不要的那个commitId，选择它之前的id进行`revert`回滚；
&emsp;&emsp;- 将不要的commitId后需要的内容`cherry-pick`回来；

&emsp;&emsp;本地拉一个测试分支出来演示一下，红圈为我们需要下掉的功能模块，我们`revert`时，可能会遇到冲突，正常解决即可。

![](useless.jpg)
![](skip.jpg)

&emsp;&emsp;对比远程仓库实际内容，就可以发现`iWriteInAnotherBranch`的修改内容已经被撤销了：

![](47.jpg)
![](89.jpg)

&emsp;&emsp;如果要撤销的commitId后有多条内容又要怎么处理呢？前文中的`git rebase`中的`squash`能将多条commit合并成一个，那这个问题就变成跟前面一样的做法了~

&emsp;&emsp;OK！演示完毕，可以把本地和远端的分支删了~本地的直接使用`git branch -D 分支名`，远程使用`git push origin -d 分支名`：

![](local.jpg)
![](remote.jpg)

## Git Flow规范

via. [宇哲大佬](https://github.com/xingyuzhe/blog/issues/6)

### 版本

&emsp;&emsp;版本号必须符合semver，其的形式为{major}.{minor}.{patch}。

&emsp;&emsp;其中major、minor、patch必须为十进制数字，且随版本发布递增。

&emsp;&emsp;· major版本，第1位数字变化表示一个major版本，此类版本通常是完全的重新设计的版本，可自由做任意更改。
&emsp;&emsp;· minor版本，第2位数字变化表示一个minor版本，此类版本会有新功能的引入，但应该（SHOULD）保持向后兼容性，如有向后兼容性问题，必须（MUST）在发布的时候说明，并必须（MUST）提供升级指导。
&emsp;&emsp;· patch版本，第3位数字变化表示一个patch版本，此类版本不得（MUST NOT）引入新的功能或接口，仅能包含重构或功能修复，不得（MUST NOT）引入不向后兼容的变化。

### 分支

&emsp;&emsp;要求:

&emsp;&emsp;· master上永远对应最新的主流版本。
&emsp;&emsp;· 所有release和master的代码都是绝对可用的。
&emsp;&emsp;· 分支分为开发分支、发布分支、功能分支、修复分支和master分支。
&emsp;&emsp;· 实际的分支以版本号为前缀，开发分支的形式为{version}/dev，例如2.1.0/dev, 此类分支用于维护一个版本的开发过程。
&emsp;&emsp;· 发布分支的形式为{version}/release，例如2.1.0/release, 此类分支用于维护每一个发布版本的状态，不得将功能或修复直接合并至此分支。
&emsp;&emsp;· 功能分支的形式为{version}/feat/{feature-desc}，例如2.1.0/feat/support-xd, 此类分支用于开发单一的原子性的功能。
&emsp;&emsp;· 修复分支的形式为{version}/fix/{bug-desc}，例如2.1.0/fix/jira1150, 此类分支用于修复一个已有的BUG。
&emsp;&emsp;· master分支即master，此分支用于维护当前主流版本的稳定状态，不得将任何功能、修复、开发分支合并至此分支。

### 开发

&emsp;&emsp;· 新建新版本: 每次有新的版本, 就必须(MUST)从master上切出新的开发分支和发布分支。
&emsp;&emsp;· jira单驱动开发: 开发任何功能前，应该（SHOULD）有一个jira单对应其功能。
&emsp;&emsp;· 新建功能|修复分支: 每次开发新功能|修复，都应该新建一个单独的分支, 从对应版本的开发分支中拉取功能|修复分支。
&emsp;&emsp;· 提交commit: 提交commit时应该（SHOULD）提交完整扼要的提交信息, 格式参考 Angular format, 其中包含 形如Fix jira#xxx的信息对应jira单号{version}/dev，例如2.1.0/dev, 此类分支用于维护一个版本的开发过程。
&emsp;&emsp;· 与开发分支同步: 分支的开发过程中，要经常与开发分支保持同步。
&emsp;&emsp;· 合并commit: 分支开发完成后，很可能有一堆commit，但是合并到开发分支的时候，往往希望只有一个（或最多两三个）commit，这样不仅清晰，也容易管理。
&emsp;&emsp;· 开发完成后，推送到远程, 发起pull request，需注意pull request的对应目标为开发分支, @相关人员或者团队。
&emsp;&emsp;· 相关人员进行Code Review，通过后merge并删除功能|修复分支。

### 提测

&emsp;&emsp;· 从开发分支 向对应的 发布分支 发起Merge Request。
&emsp;&emsp;· code review 和 merge。
&emsp;&emsp;· 自动提测(触发Jenkins任务和邮件通知)。

### 发布

&emsp;&emsp;· 生产环境上线成功后, 合并发布分支到master。
&emsp;&emsp;· 在master上 创建一个tag，tag的命名必须（MUST）为符合semver的当前发布的版本号。
&emsp;&emsp;· 删除开发分支。

## 开发项目中使用的Git操作流程

&emsp;&emsp;执行`git clone`从gitlab的项目地址拷贝到本地；
&emsp;&emsp;执行`git remote add upstream`添加上游仓库地址；
&emsp;&emsp;执行`git remote add origin`添加本地仓库地址；
&emsp;&emsp;执行`git checkout -t upstream 分支名`关联上游分支，这个操作可以在关联上游分支的同时在本地自动建立一个与上游分支名称相同的本地分支名，之后直接`git pull`即可更新对应分支代码，无需通过写全分支名`git pull upstream 分支名`拉取；
&emsp;&emsp;本地完成代码编写后，通过`git push -u origin 分支名`在本地仓库更新(如果是第一次则新建该分支)对应分支代码并建立关联，`-u`相当于帮你省了手动执行`git branch --set-upstream-to=origin/远程分支名 本地分支名`进行关联这一步，注意这里我们由于要和上游关联，所以`-u`不用写，正常推到本地仓库即可，更新代码以上游分支为准；
&emsp;&emsp;进行merge request，注意操作前，先拉一次上游代码以防别人在你request前更新过代码内容造成冲突；
&emsp;&emsp;注：有时候你可能发现上游仓库已经新建了分支内容，但是你`git branch -a`查看发现并没有，这时候你需要执行一下`git fetch upstream`就可以获取到最新的变更内容了。

