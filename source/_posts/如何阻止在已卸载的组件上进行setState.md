---
title: 如何阻止在已卸载的组件上进行setState
date: 2021-01-09 13:01:41
tags:
 - React
---

> &emsp;使用React的开发者肯定对`Warning: Can't call setState (or forceUpdate) on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.`这一句控制台的警告不陌生，它通常发生在异步的场景中。具体而言，当我们试图在一个timer或ajax请求的回调中去`setState`当前组件状态，就有一定风险看到这段警告。因为当`setState`真实被回调时，我们的组件可能已经被卸载了。那么我们该如何处理这个问题呢？

<escape><!-- more --></escape>

&emsp;&emsp;一般来说，偶尔出现的这个Warning确实不会带来严重的性能问题，但是试想如果是`setInterval`的句柄没有被正确在卸载周期中进行清理，那即便你的组件销毁了，它也会持续地生效，不仅会造成memory leak，亦会拖慢你项目的响应速度。所以，作为一个严谨的开发者来说，我们在实现逻辑时，就须要先行考虑到这些问题。另外对于一些强迫症同学来说，肯定不会希望每次打开控制台看到一坨红屏，更别说我们在开发过程中，还会经常遇到另一个常见的对数组结构生成渲染Element缺少`key`值的Warning场景。

&emsp;&emsp;在一波科学上网后，我大概得到了两种处理方式，**“治标”**与**“治本”**。

### 治标

&emsp;&emsp;治标法本质上是在你的`class`组件或者`hooks`函数组件中声明一个哨兵变量，具体是用什么方式声明，如声明在*实例属性*、*`useRef`*、*`useEffect`的局部变量*上都无所谓，它们都能达到同样的效果。

&emsp;&emsp;我们就以一个获取后台日志的场景为例。

&emsp;&emsp;`class`组件：

```javascript
export default class LogList extends PureComponent {
    _isMounted = false
    componentDidMount() {
        this._isMounted = true
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    fetchLogList = id => {
        return axios.get(`/fetchList/${id}`).then(res => {
            if (this._isMounted) {
                // setState动作...
            }
        })
    }
    render() {
        // 渲染
    }
}
```

&emsp;&emsp;`hooks`组件：

```javascript
// useRef保存哨兵变量
export default function LogList() {
    const _isMounted = useRef(false)
    const [logList, setLogList] = useState([])
    fetchLogList = id => {
        return axios.get(`/fetchList/${id}`).then(res => {
            if (_isMounted.current) {
                // setLogList...
            }
        })
    }
    useEffect(() => {
        _isMounted.current = true
        return () => {
            _isMounted.current = false
        }
    }, [])
    return (
        // 渲染
    )
}
```

```javascript
// useEffect内部声明哨兵变量
export default function LogList() {
    const [logList, setLogList] = useState([])
    fetchLogList = id => {
        return axios.get(`/fetchList/${id}`)
    }
    useEffect(() => {
        let _isMounted = true
        fetchLogList(1).then(res => {
            if (_isMounted) {
                // setLogList...
            }
        })
        return () => {
            _isMounted = false
        }
    }, [])
    return (
        // 渲染
    )
}
```

### 治本

&emsp;&emsp;治本要怎么治呢？其实在仔细观察治标中的操作后，我们发现我们都在当前组件上挂载了一个“脏东西”。作为一个组件本身的定位来说，它不再纯粹了，我们为了处理这种异步渲染的Warning而在组件本身上加东西是不太合适的。调整的核心思路在于**“解耦”**。

&emsp;&emsp;参考js本身的timer,我们可以发现它们都会返回一个`handler`句柄用于之后的**取消任务**。那么诸如ajax请求之类的`promise`返回也是同理，问题就可以转移成：**我们如何提供一个可以取消`promise`的方法？** 从设计本身而言，这种异步等待的任务都应该具有一个取消的机制，等太久了我是不是应该直接将任务取消再主动发起？另外任务的等待处理逻辑本身也不应该放到组件属性上去做，会使得一个组件设计上职能不集中，看上去就很难受。

&emsp;&emsp;大致方法就是实现一个高阶函数，同时返回封装后的新Promise实例以及支持取消该Promise的cancel方法：

```javascript
const makeCancelable = (promise) => {
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            val => hasCanceled_ ? reject({ isCanceled: true }) : resolve(val),
            error => hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};
```

&emsp;&emsp;之前的问题就可以修改为如下的样子：

```javascript
import { makeCancelable } from '@/utils'

export default function LogList() {
    const [logList, setLogList] = useState([])
    fetchLogList = id => {
        return axios.get(`/fetchList/${id}`)
    }
    useEffect(() => {
        const { promise, cancel } = makeCancelable(fetchLogList(1))
        promise.then(res => {
            // setLogList...
        })
        return () => {
            cancel()
        }
    }, [])
    return (
        // 渲染
    )
}
```

&emsp;&emsp;P.S. 实际上我们也可以再换个思路，通过将状态交由`react-redux`的`store`掌控，组件拆分为无状态组件进行显示渲染，外层的业务组件进行通过`dispatch`派发`action`，中间件层进行异步动作，一样可以处理该问题。