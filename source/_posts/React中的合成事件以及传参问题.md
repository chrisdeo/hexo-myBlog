---
title: React中的合成事件以及传参问题
date: 2018-12-06 10:28:10
tags: React
---

> &emsp;在前端技术发展的过程中，诸如jQuery、angular、react、vue等等的"框架"出现给开发人员的coding效率带来了质的飞跃，不同的技术选型主要是结合了框架自身的优点以及对历史遗留问题的考量。于我自身而言，觉得框架除了思想上的革新外，更为关键的一点是对于不同浏览器环境的兼容问题做了一个统一处理，让我们能够更平滑地处理"单一"问题，而这之中有一些封装的隐性特征往往容易被我们忽略。

## 什么是合成事件？

&emsp;&emsp;根据React官方文档所述，合成事件的英文术语为SyntheticEvent，我们调用的处理函数会接收一个SyntheticEvent的
实例，它是一个跨浏览器的封装组合体，具有与浏览器原生事件一样的接口。这样讲可能不够直观，下面代码中的参数e就是合成事件。

```javascript
function ActionLink() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}
```
