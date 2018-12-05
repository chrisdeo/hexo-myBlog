---
title: 一次nginx部署记录
date: 2018-12-05 16:51:01
tags: nginx
---

1、官方http://nginx.org/en/download.html地址选择版本下载（gzip格式压缩的包.tar.gz后缀）
2、从WINDOWS本机上传(rz -be)到连接的LINUX集成环境（试过直接wget，但是文件不完整）
3、解压： tar -zxvf nginx-x.x.x.tar.gz
4、进入解压目录，先进行几部预备工作：
①安装C/C++编译器：yum install gcc gcc-c++
②安装PCRE库（rewrite）：https://ftp.pcre.org/pub/pcre/ 与前文描述下载NGINX方式一样。
③安装zlib库（解压）：http://www.zlib.net/ 同上
④通过以上各安装目录源码包安装：  1、./configure 2、make install
5、进入/nginx/conf下通过编写nginx.conf配置文件进行nginx相关配置，参考贷后的nginx配置，并不是所有配置都在该文件内写入，而是建了一个conf.d的目录，根据各需求配置相关的.conf文件然后在nginx.conf内的末尾写入include conf.d/*.conf。
6、启动、重启、停止nginx：
(1)启动：
./usr/local/nginx/sbin/nginx
此处启动会有个问题：主要是受前文PCRE安装影响，根据版本差异提示：
libpcre.so.1/libpcre.so.0: cannot open shared object file
解决方案：
通过命令ldd $(which /usr/local/nginx/sbin/nginx)查看相关文件的依赖库情况。
能看到是哪个文件的依赖缺失 xxx=> not found

软链接手动构建依赖关系：
ln -s /usr/local/lib/libpcre.so.1 /lib64  64位
ln -s /usr/local/lib/libpcre.so.1 /lib  32位

低版本prce对应的libpcre.so.1 为libpcre.so.0

(2)重启：
进入nginx可执行目录sbin下，键入./nginx -s reload

(3)停止：
通过进程号控制：
ps -ef | greap nginx
kill -QUIT 进程号