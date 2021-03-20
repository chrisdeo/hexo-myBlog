---
title: linux统计文件夹下文件个数
date: 2021-02-22 09:41:44
tags:
  - linux
  - shell
---

> &emsp;常用统计文件夹下文件/文件目录指令。

<escape><!-- more --></escape>

&emsp;&emsp;通常在linux下统计某文件夹下的文件个数是结合`ls`、`grep`、`wc`指令通过pipe实现的：

### 统计当前目录下文件的个数（不包括目录）

&emsp;&emsp;`ls -l | grep "^-" | wc -l`

### 统计当前目录下文件的个数（包括子目录）

&emsp;&emsp;`ls -lR| grep "^-" | wc -l`

### 查看某目录下文件夹(目录)的个数（包括子目录）

&emsp;&emsp;`ls -lR | grep "^d" | wc -l`