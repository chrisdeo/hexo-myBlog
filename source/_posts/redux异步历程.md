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

&emsp;&emsp;`redux-thunk`是我最早接触的一个异步中间件库。它解决的核心诉求是：如何统一组织异步场景的`action`派发，用白话文来说就是**统一在一个地方（文件目录下）进行异步`action`逻辑的封装**。在之前[<<论Redux异步流>>](https://chrisdeo.github.io/2019/10/23/%E8%AE%BARedux%E5%BC%82%E6%AD%A5%E6%B5%81/)一文中，我们讨论过本身`action`进行`dispatch`时，是一个同步的动作。而`redux-thunk`中间件支持了`action`为函数类型的传值，这也使我们能够在这个`action`函数内部进行异步逻辑控制，最后在回调中同步`dispatch`数据。

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

&emsp;&emsp;假如我们没有使用`redux-thunk`之类的中间件进行逻辑的集中管理（使`dispatch`接受`function`、`promise`等类型的`action`），那我们上述的一些副作用就会散步在各个业务组件中，就以我们前文中的请求列表数据来说：

```javascript
// 业务组件 xx.js
const FETCH_TABLE_LIST = 'FETCH_TABLE_LIST';

const fetchTableList = async params => {
    const { dispatch } = this.props;
    let res = await axios.post('xx', params);
    if (res && res.retCode === 'success_code') {
        let { tableList = [] } = res;
        dispatch({
            type: FETCH_TABLE_LIST,
            payload: tableList
        })
    }    
}
```

&emsp;&emsp;看上去其实好像也没什么不同，**这实际上就是一个将代码放在哪里管理进行复用的问题。**对比`redux-thunk`封装后调用的写法是：`this.props.dispatch(fetchTableList(params))`，我们通过接受函数类型的`action`，使得在业务组件中的`dispatch`呈现显然更加清晰，副作用也不会被暴露在业务组件中。

### redux-promise

&emsp;&emsp;与`thunk`差不多，只不过接收的是`Promise`，它的诉求估计在于**不用在业务组件层写那么多`this.props.dispatch(fetchTableList(params)).then().catch()`之类的代码。**

&emsp;&emsp;瞅瞅源码：

```javascript
import {
  isPlainObject,
  isString,
} from 'lodash';

function isValidKey(key) {
  return [
    'type',
    'payload',
    'error',
    'meta',
  ].indexOf(key) > -1;
}

// flux-standard-action库中的判断是否是一个标准action方法
export function isFSA(action) {
  return (
    isPlainObject(action) &&
    isString(action.type) &&
    Object.keys(action).every(isValidKey)
  );
}

export default function promiseMiddleware({ dispatch }) {
  return next => action => {
    if (!isFSA(action)) {
      return isPromise(action) ? action.then(dispatch) : next(action);
    }

    return isPromise(action.payload)
      ? action.payload
          .then(result => dispatch({ ...action, payload: result }))
          .catch(error => {
            dispatch({ ...action, payload: error, error: true });
            return Promise.reject(error);
          })
      : next(action);
  };
}
```

&emsp;&emsp;大意就是，先判断是否是一个标准的`action`，如果不是，则判断是不是`Promise`类型的，是则在`resolved`后`dispatch`，不是则正常走中间件的`next`步骤。如果是一个标准`action`，则对其`payload`内容进行判断（是否是`Promise`），其中进行成功和失败情况下的`dispatch`。

&emsp;&emsp;还是拿我们之前获取列表的场景，结合官方提供的用例有：

```javascript
import { createAction } from 'redux-actions';
import { WebAPI } from '../utils/WebAPI';

export const fetchTableList = createAction('FETCH_TABLE_LIST', WebAPI.fetchTableList);
```

&emsp;&emsp;注，一个标准的`action`具有`type`、`payload`、`error`、`meta`四个`key`，`createAction`能帮我们生成一个标准的FSA对象。像上面的请求API会被赋值到`action.payload`下。自然也会走中间件内`action.payload`的`Promise.then.catch`流程。

### redux-saga

&emsp;&emsp;`saga`使用的是`generator`语法，根据js异步API的发展，我们也知道其语法本身改变是为了减少`Promise`带来的层层回调嵌套；而之后业内又有了`co`库，以及ES6中的`async/await`，为我们提供了更多样的选择。

&emsp;&emsp;通过阅读`saga`库的`README.md`，我们先理清其提供的几个API的基本功能：

- `put`: 相当于数据派发时的`dispatch`；
- `call`: 配合`yield`，调用API，传入参数；
- `takeEvery`: 类似观察者模式中观察者的角色，当我们触发`dispatch`时，对应`type`的`action`会调用对应的`generator`函数；
- `takeLatest`: 是`takeEvery`的一种可替代方案，调用方式相同，不过如果同一时间还有别的请求存在（比如网络问题导致的`pending`），旧的将会被取消，即只有最新的调用请求会保留；
 
### 话外

&emsp;&emsp;分享一篇stackoverflow上关于redux middleware的讨论文章 [Why do we need middleware for async flow in Redux?](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34623840#34623840)