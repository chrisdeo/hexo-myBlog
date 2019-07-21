---
title: 如何遍历整个DOM树
date: 2019-07-20 16:49:44
tags:
  - HTML
  - DOM
  - Javascript
---

&emsp;&emsp;作为前端开发工程师，我们大部分工作内容其实还是围绕着DOM在进行Javascript的编写；为了获取对应的DOM节点，我们通常会使用选择器来直接获取对应的元素。但如果让我们访问一整棵DOM树，针对某个环节进行操作呢？这就需要我们对DOM的基本属性以及树的数据结构有比较深刻的认识了。

<escape><!-- more --></escape>

## nodeType

&emsp;&emsp;在开始遍历操作前，我们先要知道DOM元素`nodeType`这个属性的意义，它以数字值返回指定节点的节点类型，我们这里只例举常见的几种：
&emsp;&emsp;①`nodeType`为`1`时，表明该节点为元素节点，如`body`、`div`等；
&emsp;&emsp;②`nodeType`为`2`时，表明该节点为属性节点，啥是属性节点呢，其实就是`src`、`target`这种，只不过我们平常都是以属性来访问它们而不是将其当属性节点提取出，那本页面举个例子：

```javascript
    document.querySelector('.post-body').getAttributeNode('itemprop');  // itemprop="articleBody"
    document.querySelector('.post-body').getAttributeNode('itemprop').nodeType; // 2
```

&emsp;&emsp;如上操作就可以返回属性为`itemprop`的属性节点；

&emsp;&emsp;③`nodeType`为3时，表明该节点为文本节点，同样以当前页面为例：

```javascript
    document.querySelector('p').firstChild.nodeType; // 3
```
## DFS

&emsp;&emsp;在知道以上的基本要素后，我们先用深度遍历（DFS）的方式从根节点（html）开始递归遍历一次：

```javascript
    function traverseByDFS(root) {
        if (!root) {
            root = document.documentElement; // html
        }
        console.log(root.nodeName);
        if (root.nodeType === 1) {
            let len = root.childNodes.length;
            for (let i = 0; i < len; i++) {
                if (root.childNodes[i].nodeType === 1) {
                    traverseByDFS(root.childNodes[i]);
                }
            }
        }
    }
```

### childNodes&children

&emsp;&emsp;这里可以再区别一下节点的`childNodes`和`children`属性，前者会返回各种类型的子节点，涵盖了前文中出现过的元素、属性、文本节点等等；而后者只返回元素类型的子节点。

&emsp;&emsp;所以其实也可以简写一下：

```javascript
    function traverseByDFS(root) {
        if (!root) {
            root = document.documentElement; // html
        }
        console.log(root.nodeName);
        let len = root.children.length;
        for (let i = 0; i < len; i++) {
        	traverseByDFS(root.children[i]);
        }
    }
```

## BFS

&emsp;&emsp;对于DOM树的广度遍历来说，关键是如何保存同层节点的访问顺序以便之后继续对他们的子节点进行遍历，而DOM树本身就是构造完整的，我们直接访问对应节点属性就可以拿到相邻元素、祖先元素以及后代元素的值。所以只需要结合队列的特性就可以保存顺序再通过递归访问即可遍历所有元素。

![](dom.png)

```javascript
    function traverseByBFS(root) {
        if (!root) {
            root = document.documentElement;
        }
        let queue = [];
        let rootFirstKid = root.firstElementChild;
        if (rootFirstKid) {
            queue.unshift(rootFirstKid);
            console.log(queue[0]);
            while (rootFirstKid.nextElementSibling) {
                queue.unshift(rootFirstKid.nextElementSibling);
                console.log(queue[0]);
                rootFirstKid = rootFirstKid.nextElementSibling;
            }
            while (queue.length) {
                traverseByBFS(queue.shift());
            }
        }
    }
``` 