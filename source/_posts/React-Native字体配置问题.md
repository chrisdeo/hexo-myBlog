---
title: React-Native字体配置问题
date: 2021-03-27 12:39:54
tags:
  - 移动端
  - React-Native
  - font-family
---

&emsp;&emsp;在开发RN应用中，相信不少人被字体问题困扰过。这里的字体问题主要包括字体的大小、系统配置的缩放以及字体的主题。

<escape><!-- more --></escape>

### 影响

&emsp;&emsp;先说字体问题会带来什么影响：

- 第一，也是最直观的一点就是测试会给你提单；因为移动端测试往往有很多的设备机型，极有可能手机本身的设置非默认状态，跑在容器层的RN默认继承了系统的语言配置，这样当字体放大，或者缩放了图形就会导致我们开发的UI界面和视觉提供的稿件产生比较大的差异（宽高比例、间距大小等）。

- 第二，线上用户的体验也不佳，毕竟用户是不懂技术细节的，给他们最直观的反馈就是界面混乱，对企业品牌观感直线下滑。前者你还能理解为bug问题，后面就直接升级到事故性事件了。

&emsp;&emsp;综上，我们在构建RN移动端项目时，最开始就应该统一一个平台性的规范，如全局应用某一种字体(`fontFamily`)，默认app运行时，全局的字体大小、及形变不受外部设置界面影响，采取一个固定的大小及比例。

### 表现

&emsp;&emsp;除了前文说的**大小和比例改变导致的视觉改变**外，其实还有部分是平台系统的问题，IOS由于都是苹果自己维护，所以不会有差异性的问题。但是安卓系统不同手机厂商往往会自己改造，这里记录的是我开发中遇到的两个毕竟坑的厂商，**一加**和**小米**。

&emsp;&emsp;两者的核心差异表现在，它们会应用自己设计的字体以及具有一个很大的自定义字体生态。当用户使用了一些特殊字体，由于RN继承了系统的字体选择，很有可能会导致**字体的解析异常，直观体现就是单词、语句会出现截断现象（显示不全），以及一些数字显示异常（如`0`显示成`..`)**。

### 解决方案

&emsp;&emsp;根据网络上的整理，常见的处理都是做两步：

1. 改写`Text`、`TextInput`这些涉及文本的组件；
2. 下载平台规范的字体文件`ttf`格式，并`link`到`ios`和`android`内，在上述改写的属性内配置对应的`fontFamily`。

#### 如何改写文本组件

##### HOC处理Text 

&emsp;&emsp;由于RN中的文本属性具有继承性，我们只需要在父组件设置了对应的`fontFamily`，子节点的`Text`都会继承父级的配置。又因为我们不同组件内都要使用，所以需要复用，使用HOC的方式是一个比较好的选择。

##### 重载Text的render方法

```javascript
import React from 'react'
import { Text, Platform, StyleSheet } from 'react-native'

export const hackText = () => {
  const oldTextRender = Text.render
  Text.render = function(...args) {
    const origin = oldTextRender.call(this, ...args)
    return React.cloneElement(origin, {
      style: [styles.localFont, origin.props.style],
    })
  }
}

const styles = StyleSheet.create({
  localFont: {
    fontFamily: '下载的规范的ttf文件名',
  }
});
```

&emsp;&emsp;重载后的方法，我们通常须要放到项目顶层使用，以确保渲染的时候应用的是我们的配置文件。

```javascript
// index.js
import { hackText } from '@/utils/hackText'
import { AppRegistry } from 'react-native'
import App from './App'
import {name as appName} from './app.json'
hackText()

AppRegistry.registerComponent(appName, () => App)
```

##### 直接修改Text组件的`defaultProps`

&emsp;&emsp;React的使用者都知道，组件配置的静态属性`defaultProps`会自动应用到我们组件实例的`props`中，`Text`实际渲染时也应用了一些初始设置属性，改动`defaultProps`等价于初始的时候注入我们的自定义配置：

```javascript
import { Text, TextInput, Platform } from 'react-native'
Text.defaultProps = { ...(Text.defaultProps || {}), allowFontScaling: false, ...(Platform.select({
  android: {
    fontFamily: 'Roboto'
  }
})) }
TextInput.defaultProps = { ...(TextInput.defaultProps || {}), allowFontScaling: false, ...(Platform.select({
  android: {
    fontFamily: 'Roboto'
  }
})) }
```

&emsp;&emsp;以上代码是我目前海外项目应用的方案，比较hack，但是好用，比较符合目前的场景。

&emsp;&emsp;代码中可以看到根据系统平台`android`应用了`Roboto`字体类。这也是根据网上检索后得到的信息进行处理的，因为我们目前海外上线的app最低也是要求系统等级高于4.0的，又因为IOS字体不存在第三方的多样性，使用系统默认即可，综合下来有了前面的配置代码。

![](font.jpg)