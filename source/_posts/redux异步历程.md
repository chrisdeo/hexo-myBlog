---
title: redux异步历程
date: 2019-12-02 10:54:26
tags:
  - redux
---

> &emsp;理解为什么而用？

<escape><!-- more --></escape>

&emsp;&emsp;前阵子手撕了部分`redux`源码，对其中一些设计思想的理解提升了不少。但是，在我自身开发的历程中还是一直有一个问题困扰着我：这些不断进化的`redux`异步中间件库到底是为什么出现的，它们的诉求究竟是解决一个什么样的问题？

### redux-thunk

&emsp;&emsp;`redux-thunk`是我最早接触的一个异步中间件库。它解决的核心诉求是：如何统一组织异步场景的`action`派发，用白话文来说就是**统一在一个地方（文件目录下）进行异步`action`逻辑的封装**。在之前[<<论Redux异步流>>](https://chrisdeo.github.io/2019/10/23/%E8%AE%BARedux%E5%BC%82%E6%AD%A5%E6%B5%81/)一文中，我们讨论过本身`action`进行`dispatch`时，是一个同步的动作。而`redux-thunk`中间件带来的就是支持`action`为函数类型的传值：我们在这个`action`函数内部进行异步逻辑控制，最后在回调中同步`dispatch`。

&emsp;&emsp;我们知道在`redux-thunk`中，对`action`函数的处理如下：

```javascript
if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument);
}
```

&emsp;&emsp;于是我们会在如`action`这个目录下进行对应业务逻辑的异步封装。下面以请求一个列表页数据为例：

```javascript
const FETCH_TABLE_LIST = 'FETCH_TABLE_LIST';

// Action Creator With Side Effects
const fetchTableList = params => {
    return async dispatch => {
        let res = await axios.post('xx', params);
        if (res && res.retCode === 'success_code') {
            let { tableList = [] } = res;
            dispatch({
                type: FETCH_TABLE_LIST,
                payload: tableList
            })
        }
    }
}

// Reducers
const initState = {
    tableList: [],
}

const tableList = (state = initState, action) => {
    switch (action.type) {
        case FETCH_TABLE_LIST:
            return {
                ...state,
                tableList: action.payload,
            }
        default:
            return state;
    }
}
```