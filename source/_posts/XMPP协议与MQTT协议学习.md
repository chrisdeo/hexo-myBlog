---
title: XMPP协议与MQTT协议学习
date: 2020-02-14 16:03:49
tags:
  - XMPP
  - MQTT
  - XML
---

> &emsp;由于近期开发的业务场景中有接触到，学习了解一下...

<escape><!-- more --></escape>

## XMPP协议

&emsp;&emsp;可扩展消息与存在协议（英语：Extensible Messaging and Presence Protocol，缩写：XMPP）是一种以XML为基础的开放式即时通信协议，是经由互联网工程工作小组（IETF）通过的互联网标准。XMPP因为被Google Talk应用而被广大网民所接触。 -- wikipedia

&emsp;&emsp;在开始了解XMPP前，我们可能还需要先了解下XML，相信现在这个版本的前端都对HTML异常熟悉，但是对XML则较为陌生，那XML是什么样的结构呢？

### 什么是XML？

- XML 指可扩展标记语言（EXtensible Markup Language）
- XML 是一种标记语言，很类似 HTML
- XML 的**设计宗旨是传输数据，而非显示数据**
- XML 标签没有被预定义。您需要自行定义标签。
- XML 被设计为具有自我描述性。
- XML 是 W3C 的推荐标准

#### XML本身是没有行为的

&emsp;&emsp;如何理解呢？即其结构本身只是一种描述性的东西，并不会携带什么副作用：

```html
<note>
<to>George</to>
<from>John</from>
<heading>Reminder</heading>
<body>Don't forget the meeting!</body>
</note>
```

#### XML 仅仅是纯文本

&emsp;&emsp;XML 没什么特别的。它仅仅是纯文本而已。有能力处理纯文本的软件都可以处理 XML。不过，能够读懂 XML 的应用程序可以有针对性地处理 XML 的标签。标签的功能性意义依赖于应用程序的特性。

#### XML 不是对 HTML 的替代

- XML 是对 HTML 的补充。

- XML 是独立于软件和硬件的信息传输工具。

- 在大多数 web 应用程序中，**XML 用于传输数据，而 HTML 用于格式化并显示数据**。

### XMPP的应用场景

&emsp;&emsp;XMPP主要应用在实时通信的场景中，该协议允许因特网用户向因特网上的其他任何人发送即时消息，即使其操作系统和浏览器不同。在传输时，主要是与即时通讯相关的指令，