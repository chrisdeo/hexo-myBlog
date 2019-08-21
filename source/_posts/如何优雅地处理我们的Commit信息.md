---
title: 如何优雅地处理我们的Commit信息
date: 2019-08-20 20:40:33
tags:
  - Commit
  - Husky
  - Commitizen
---

> &emsp;之前做过一篇关于如何处理commit信息的博客，但是还缺少一种规范和自动化处理的东西在里面，这篇将会引入commitizen和husky，旨在提升commit信息的可阅读性以及工程化处理的便利性。

<escape><!-- more --></escape>

## Commitizen

### 安装配置

&emsp;&emsp;`npm install -D commitizen cz-conventional-changelog`开发环境安装依赖，安装后在`package.json`中写入`npm script`和`cz-conventional-changelog`配置。

```javascript
"scripts": {
    ...,
    "commit": "git-cz",
},
"config": {
    "commitizen": {
        "path": "node_modules/cz-conventional-changelog"
    }
}
```

### 使用

&emsp;&emsp;配置完毕后，我们键入`npm run commit`应当有下面这个交互界面：

![](gitcz.jpg)

&emsp;&emsp;其实这里的交互有点像`git rebase`，不过实际上只是遵照**参考规范**用于格式化我们的`commit`信息罢了。那这个参考规范指的是什么呢？前文中我们安装的是`Angular`团队进行`commit`提交的参考规范，具体内容可以看[传送门](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)。

&emsp;&emsp;现在我们提交当前这篇博文的第一部分：

![](blogcz.jpg)

&emsp;&emsp;推到远程仓库后：

![](repo.jpg)

&emsp;&emsp;更新部分内容再推送：

![](update.jpg)

### 自定义规范

&emsp;&emsp;前文使用的是`Angular`的提交规范，那假如我们想自己整个怎么办呢？

&emsp;&emsp;我们可以安装cz自定义配置的依赖`npm i -D cz-customizable`，然后修改`package.json`内的`config`项。把前文指向`cz-conventional-changelog`的`path`替换为`cz-customizable`。

```javascript
"config": {
    "commitizen": {
        "path": "node_modules/cz-customizable"
    }
}
```

&emsp;&emsp;最后在项目根目录创建`.cz-config.js`，内容就是我们自定义的东西。官方提供了一个[模板](https://github.com/leonardoanalista/cz-customizable/blob/master/cz-config-EXAMPLE.js)，对着改就完事了~

![](list.jpg)
![](cus.jpg)

<!-- ### 校验

&emsp;&emsp;格式上的方案已经有了，但是很多东西落地还是需要经过推动的，很多开发人员喜欢“自由”的开发模式，历史的经验也告诉我们这样的项目走到最后基本都是悲剧。私以为真正的自由还是需要有约束的，所以我们要求在提交时强校验这个提交信息，于是引入`commitlint`。

&emsp;&emsp;先安装`npm i -D commitlint-config-cz @commitlint/cli`，然后在项目根目录创建`.commitlintrc.js`，写入：

```javascript
module.exports = {
  extends: [
    'cz'
  ],
  rules: {
  }
};
```

&emsp;&emsp;再安装`husky`的依赖，`npm i -D husky`，`husky`能够介入`git`的各个`hook`内，进行“中间件”般的操作。

```javascript
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
``` -->


