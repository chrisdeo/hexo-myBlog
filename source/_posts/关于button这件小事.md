---
title: 关于button这件小事
date: 2018-12-05 09:12:22
tags: button
---

> &emsp;写本文的初衷是在用antd的Form的时候，看到里面有个关联Button，并且在Form中传入onSubmit回调即可与嵌套的Button产生联动，当时我就惊了，为啥鸭 {% github_emoji open_mouth %}。

## 剔除使用误区

&emsp;&emsp;***首先在原生的表单事件中，其实是可以有两种处理方案的。***由于现在使用的antd的Form，在通过@Form.create()后，form属性会被关联到本层props中，我们更倾向于在**按钮标签内写入回调(onClick) React用驼峰**，去通过form.validateFields()方法来直接处理表单数据或提交之类的问题。但是其实原生的表单处理还有另外一种监听方式，就是通过在**Form标签写入onsubmit回调**，然后关联内部的点击事件触发。我们可以在以上两种方案中任意一种中对我们的表单数据进行校验，当同时有onclick和onsubmit存在时，***onclick将会更早地被触发***，此处可以理解为先有表单的关联按钮触发事件，才有表单的响应回调。

<escape><!-- more --></escape>

## button和input type="button"和input type="submit"的哲学现场

&emsp;&emsp;1. `<input type="submit">`不在`<form>`内时，点击不会触发form的提交。
&emsp;&emsp;2. `<input type="button">`即使位于`<form>`内，点击也不会触发form的提交。
&emsp;&emsp;3. `<button></button>`在`<form>`内，点击会直接触发表单提交（除IE），原因是button本身也有type属性，在不显式声明改属性时，在IE下默认为button类型，而在其他浏览器中默认为submit类型，两种类型触发form的模式与input一致。
&emsp;&emsp;4. 触发提交事件后，会进行页面跳转，url后会拼接格式如`?参数名1=表单值1&参数名2=表单值2`的数据。
&emsp;&emsp;5. 如果你是自己在验证打console.log的时候，会由于页面跳转无法看到执行台的结果，我们可以通过`onclick="test();return false"`的方式来阻止该行为。
&emsp;&emsp;6. antd中的`<Button>`渲染出的真实DOM结构是`<button><span></span></button>`。

### PS: a标签的跳转禁止

&emsp;&emsp;1. `<a href="javascript:void(0);">链接显示文本</a>`
&emsp;&emsp;2. `<a href="javascript:;">链接显示文本</a>`
&emsp;&emsp;3. `<a href="" onclick="return false;">链接显示文本</a>`
&emsp;&emsp;4. `<a href="#" onclick="return false;">链接显示文本</a>`

&emsp;&emsp;**总结： 1、2通过将href返回为空或不返回值来禁止跳转; 3、4则通过onclick来监听事件，阻止跳转的默认行为。**


