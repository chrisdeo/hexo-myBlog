---
title: RN下的WebView通讯
date: 2021-06-09 16:15:11
tags:
  - 移动端
  - React-Native
  - WebView
---

> &emsp;通常 RN 适用于一些比较简单的文本或者图形显示的场景，如果遇到更复杂的图表类问题，选择 H5 中的一些成熟第三方库如`ECharts`等会更便利。当然这样就会额外涉及如何运行`WebView`及如何跟`WebView`通讯的问题。

<escape><!-- more --></escape>

&emsp;&emsp;下面我们直入主题，首先在 RN 中安装运行`WebView`的依赖库，这里使用的是`react-native-webview`。

## RN 如何往 WebView 中推消息

&emsp;&emsp;在 RN 侧，我们需要拿到这个`WebView`容器的`ref`，方便后续的发送消息动作：

```javascript
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ...
class MyWebComponent extends Component {
  constructor(props) {
    super(props);
    this.webviewRef = React.createRef();
  }
  render() {
    return (
      <WebView
        ref={this.webviewRef}
        source={{ html: '你的HTML字符串' }}
        onMessage={(event) => {
          console.log('RN收到来自WebView的数据', event.nativeEvent.data);
        }}
      />
    );
  }
}
```

&emsp;&emsp;RN 往 WebView 发送消息：`this.webviewRef.current.postMessage(value)`。

## WebView 如何往 RN 中推消息

&emsp;&emsp;`WebView`内实际上跑的就是我们的`HTML`了，在`WebView`容器内，会在`window`上注入能够调用原生能力的模块：`ReactNativeWebView`。

&emsp;&emsp;故，往RN发消息也就那么回事：`window.ReactNativeWebView.postMessage('WebView往RN发送的数据')`。

&emsp;&emsp;同样的，在`WebView`中的`HTML`页面也需要挂载对RN传来消息的监听，IOS和Android有所差异：

```javascript
window.addEventListener('message', function (e) { // IOS
  console.log(e) 
});

document.addEventListener('message', function (e) { // Android
  console.log(e) 
});
```
