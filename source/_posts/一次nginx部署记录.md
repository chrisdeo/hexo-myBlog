---
title: 一次nginx部署记录
date: 2018-12-05 16:51:01
tags: nginx
---

> &emsp;有这篇记录的主要原因是在开发新系统的时候，申请了新的集成环境，但是运维老大哥没有装nginx，我只好自己根据网络上的博客整理了一份自己的踩坑记录，避免以后再次部署的时候走弯路。

# 填坑六步

&emsp;&emsp; 1、在[官方地址](http://nginx.org/en/download.html)选择版本下载（gzip格式压缩的包.tar.gz后缀）
&emsp;&emsp; 2、从WINDOWS本机上传(`rz -be`)到连接的LINUX集成环境（试过直接wget，但是文件不完整）
&emsp;&emsp; 3、解压： `tar -zxvf nginx-x.x.x.tar.gz` <escape><!-- more --></escape>
&emsp;&emsp; 4、进入解压目录，先进行几部预备工作：
&emsp;&emsp; &emsp;&emsp; ①安装C/C++编译器：`yum install gcc gcc-c++`
&emsp;&emsp; &emsp;&emsp; ②安装PCRE库（rewrite）：https://ftp.pcre.org/pub/pcre/ 与前文描述下载NGINX方式一样。
&emsp;&emsp; &emsp;&emsp; ③安装zlib库（解压）：http://www.zlib.net/ 同上
&emsp;&emsp; &emsp;&emsp; ④通过以上各安装目录源码包安装：  1、`./configure` 2、`make install`
&emsp;&emsp; 5、进入/nginx/conf下通过编写nginx.conf配置文件进行nginx相关配置，除了这种方式外，我们也可以建一个conf.d的目录，配置不同关联的.conf文件然后在nginx.conf内的末尾写入`include conf.d/*.conf`。
&emsp;&emsp; 6、启动、重启、停止nginx：
&emsp;&emsp; &emsp;&emsp;(1)启动：
&emsp;&emsp; &emsp;&emsp;`./usr/local/nginx/sbin/nginx`
&emsp;&emsp; &emsp;&emsp;此处启动会有个问题：***主要是受前文PCRE安装影响***，根据版本差异提示：
&emsp;&emsp; &emsp;&emsp;**libpcre.so.1/libpcre.so.0: cannot open shared object file**
&emsp;&emsp; &emsp;&emsp;解决方案：
&emsp;&emsp; &emsp;&emsp;通过命令`ldd $(which /usr/local/nginx/sbin/nginx)`查看相关文件的依赖库情况。
&emsp;&emsp; &emsp;&emsp;能看到是哪个文件的依赖缺失 xxx=> not found

&emsp;&emsp; &emsp;&emsp;软链接手动构建依赖关系：
&emsp;&emsp; &emsp;&emsp;`ln -s /usr/local/lib/libpcre.so.1 /lib64`  64位
&emsp;&emsp; &emsp;&emsp;`ln -s /usr/local/lib/libpcre.so.1 /lib`  32位

&emsp;&emsp; &emsp;&emsp;低版本prce对应的libpcre.so.1 为libpcre.so.0

&emsp;&emsp; &emsp;&emsp;(2)重启：
&emsp;&emsp; &emsp;&emsp;进入nginx可执行目录sbin下，键入`./nginx -s reload`

&emsp;&emsp; &emsp;&emsp;(3)停止：
&emsp;&emsp; &emsp;&emsp;通过进程号控制：
&emsp;&emsp; &emsp;&emsp;`ps -ef | greap nginx`
&emsp;&emsp; &emsp;&emsp;`kill -QUIT `进程号