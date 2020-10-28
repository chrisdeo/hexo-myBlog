---
title: React-Native启动环境配置
date: 2020-02-13 16:35:32
tags:
  - 移动端
  - React-Native
---

> &emsp;记React-Native入坑的环境配置（Windows)。

<escape><!-- more --></escape>

&emsp;&emsp;React-Native让前端开发者也具备了APP开发的能力，我们通过编写JS，最后编译直出`android`、`ios`应用代码...下面就看看windows环境下配置会遇到哪些问题：

&emsp;&emsp;附： 先安装JDK和Android Studio会减少后面很大的工作量，两者安装后注意配置对应系统环境变量：

&emsp;&emsp;配置JAVA环境变量：`JAVA_HOME`：

![](jdk.jpg)

&emsp;&emsp;配置Android环境变量：`ANDROID_HOME`：

![](android.jpg)

&emsp;&emsp;配置进系统`Path`：

![](path.jpg)

&emsp;&emsp;之后进行RN环境搭建：

1. 首先，确保Node版本够高，version >= 10.0.0。若须要更新直接去官方下载.msi，安装会覆盖之前版本。
2. 拉取项目代码，由于新工地使用的是svn，安装GUI后，使用`svn checkout`对应仓库地址直接拉取。
3. `npm install`。
4. `react-native run-android`。本质上是生成一个`android`的`apk`包，在USB连接安卓机情况下会自动将软件包导入。导入须要安卓机开启开发者模式选项，允许USB调试。 
5. `bcprov-jdk15on`安装失败或缓慢，挂梯子。
6. `SDK location not found`，首先在Windows环境下的RN开发是离不开Android Studio的，具体安装Android Studio的步骤见网上（主要是一些科学上网的坑）。安装好后，我们须要在项目目录下的`android`目录中创建`local.properties`文件，写入（自己安装AS SDK的位置）`sdk.dir=C\:\\Users\\Shinelon\\AppData\\Local\\Android\\Sdk `注意斜杠使用 （WINDOWS环境）。
7. `Could not find tools.jar`，主要是JAVA下的`jdk`依赖。正常来说我们安装的JAVA目录下会有安装的jdk目录，然后下面的lib目录中有tools.jar文件。报该错，须要在环境变量中指定`JAVA_HOME` => `C:\Program Files\Java\jdk1.8.0_181` ，修改后注意重启命令行工具 （不关闭不会生效）。
8. `gradlew.bat app:installDebug`可能会报一个兼容性问题`（Deprecated Gradle features were used in this build, making it incompatible with Gradle 6.0）`，而事实上，这并不是指兼容出错，指的是我们已经在安卓机上导入了该`apk`。
9. `Invalid regular expression: /(.*\\__fixtures__\\.*|node_modules[\\\]react[\\\]dist[\\\].*|website\\node_modules\\.*|heapCapture\\bundle\.js|.*\\__tests__\\.*)$/: Unterminated character class.`，当时安装了最新版本的Node，该错误为版本兼容问题，回退版本至`v12.10.0`。
10. `adb devices`显示当前与电脑连接的手机设备，用于传输调试。可能会报`adb server version (31) doesn't match this client (41); killing => server`，检查下是否有鲁大师之类的程序占用。如果没有，报了该问题依旧有显示正确的连接设备可以无视。
11.  除了真机调试外，亦可用模拟器连接调试；Android Studio初始化一个 or 安装一个手游模拟器（夜神模拟器）。目前我自己就是使用的夜神，体验还不错。
12. 夜神模拟器调试流程：先安装软件，进入安装目录下的bin目录，键入` nox_adb connect localhost:62001 `。端口只是一个约定，为的是你使用 `adb connect localhost:62001` （不要在`/nox/bin`下键入，否则也会视作`nox_adb`）将模拟器连接上。（连接上，才能通过前面的`react-native run-android`将调试apk装进去）
13. 可能拉出来的项目代码中没有生产`ios`及`android`目录，当执行`react-native run-android`时会报`error Android project not found. Are you sure this is a React Native project?`，此时执行`react-native eject`即可。（似乎新版本的RN中该方法被移除了）