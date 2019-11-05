---
title: JSON.stringify多参数的应用（半译）
date: 2019-11-05 21:26:03
tags:
  - Javascript
  - JSON
---

> &emsp;不积跬步，无以至千里。

&emsp;&emsp;`JSON.stringify`这个API相信JSer都不陌生。在我们进行数据本地持久化存储的时候就会使用它将一个数据体处理成`JSON`字符串存到`storage`内、另外大部分场景的后端返回数据体也是`JSON`串的格式。通常我们对这个API的印象就停留在传一个参数的情景，但实际上它可以接收多个参数XD。

<escape><!-- more --></escape>

### 第二个参数传回调函数

&emsp;&emsp;先看一个例子：

```javascript
const dude = {
  name: "Pawel",
  friends: ["Dan", "Pedro", "Mr Gregory"]
};
const dudeStringified = JSON.stringify(dude);

console.log(dudeStringified);

//	{"name":"Pawel","friends":["Dan","Pedro","Mr Gregory"]}
```

&emsp;&emsp;没什么毛病，这也是我们开头说的被使用最多的一种场景。

#### 特殊类型的处理

&emsp;&emsp;再往下看：

```javascript
const dude = {
  name: "Pawel",
  friends: new Set(["Dan", "Pedro", "Mr Gregory"])
};
const dudeStringified = JSON.stringify(dude);

console.log(dudeStringified);

// {"name":"Pawel","friends":{}}
```

&emsp;&emsp;此时，内部是一个`Set`结构了，这种结构在进行序列化时，**会被忽略或者处理为`null`**。同等情况的还有`WeakSet`、`Map`、`WeakMap`。

&emsp;&emsp;有没有什么办法可以额外处理呢？有的，就是在第二个参数传一个回调函数进去，这个回调支持两个参数分别对应原序列化对象的`key`和`value`。

&emsp;&emsp;我们可以像下面这样处理，通过`instanceof`判断传入`value`是由`Set`构造的实例，同时借助内部的`iterator`进行解构转成数组。

```javascript
const dude = {
  name: "Pawel",
  friends: new Set(["Dan", "Dan", "Pedro", "Mr Gregory"])
};
const dudeStringified = JSON.stringify(dude, (key, value) =>
  value instanceof Set ? [...value] : value
);

console.log(dudeStringified);
// {"name":"Pawel","friends":["Dan","Pedro","Mr Gregory"]}
```

#### 定制替换内容

```javascript
// Second argument as a replacer function

const dude = {
  name: "Dan"
};
const dudeStringified = JSON.stringify(dude, (key, value) =>
  key === "name" ? "Pawel" : value
);

console.log(dudeStringified);
// {"name":"Pawel"}
```

### 第二个参数传数组

#### 设置白名单（过滤key）

&emsp;&emsp;这种场景与上面不太一样，第二个参数会传一个数组，内容是我们要保留的对象的`key`属性。

```javascript
// Second argument as an array of white-listed keywords

const dude = {
  name: "Pawel",
  friends: new Set(["Dan", "Pedro", "Mr Gregory"])
};

const dudeStringified = JSON.stringify(dude, ["name"]);

console.log(dudeStringified);
// {"name":"Pawel"}
```

### 第三个参数的分隔符作用

&emsp;&emsp;实际效果有点像格式化后填充缩进，填充内容取决于第三个参数。

&emsp;&emsp;当参数为`number`类型时，返回的序列将按照该`number`数值的大小进行空格格式化。

```javascript
// Third argument as a number

const dude = {
  name: "Pawel",
  friends: ["Dan", "Pedro", "Mr Gregory"]
};
const dudeStringified = JSON.stringify(dude, null, 4);

console.log(dudeStringified);
// {
//   "name": "Pawel",
//   "friends": [
//       "Dan",
//       "Pedro",
//       "Mr Gregory"
//   ]
// }
```

&emsp;&emsp;当参数为`string`类型时，返回的序列将以该`string`内容进行格式化填充。

```javascript
// Third argument as a string

const dude = {
  name: "Pawel",
  friends: ["Dan", "Pedro", "Mr Gregory"]
};
const dudeStringified = JSON.stringify(dude, null, "🍆");

console.log(dudeStringified);
// {
// 🍆"name": "Pawel",
// 🍆"friends": [
// 🍆🍆"Dan",
// 🍆🍆"Pedro",
// 🍆🍆"Mr Gregory"
// 🍆]
// }
```