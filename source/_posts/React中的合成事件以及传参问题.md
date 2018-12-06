---
title: React中的合成事件以及传参问题
date: 2018-12-06 10:28:10
tags: React
---

> &emsp;在前端技术发展的过程中，诸如jQuery、angular、react、vue等等的"框架"出现给开发人员的coding效率带来了质的飞跃，不同的技术选型主要是结合了框架自身的优点以及对历史遗留问题的考量。于我自身而言，觉得框架除了思想上的革新外，更为关键的一点是对于不同浏览器环境的兼容问题做了一个统一处理，让我们能够更平滑地处理"单一"问题，而这之中有一些封装的隐性特征往往容易被我们忽略。

## 什么是合成事件？

&emsp;&emsp;根据[React官方文档](https://react.docschina.org/docs/events.html)所述，合成事件的英文术语为SyntheticEvent，我们调用的处理函数会接收一个SyntheticEvent的
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
<escape><!-- more --></escape>

## React中的合成事件处理

### 函数绑定姿势

&emsp;&emsp;在讨论这个问题前，我们需要先弄清楚**React中事件绑定函数的正确姿势**，最基本的绑定属性名驼峰写法就不多赘述了，核心问题是**类的方法是不会默认绑定this的**，为了能够正确地拿到预期的this值，我们可以通过bind方式以及箭头函数的方式来实现。

1、bind绑定
```javascript
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};
    this.handleClick = this.handleClick.bind(this); //绑定this
  }

  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
```

2、箭头函数
```javascript
//官方文档中描述的属性初始化器语法
class LoggingButton extends React.Component {
  handleClick = () => {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click me
      </button>
    );
  }
}
```
```javascript
//在回调函数中使用 箭头函数
class LoggingButton extends React.Component {
  handleClick() {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={(e) => this.handleClick(e)}>
        Click me
      </button>
    );
  }
}
```

&emsp;&emsp; 当然在回调函数中使用箭头函数这种绑定方式是不推荐使用的，因为这样每次render都会返回一个不一样的匿名函数，如果将其作为属性往子组件传递，可能会造成额外的rerender。

### 传递参数姿势

&emsp;&emsp; 先看文档中的两种函数绑定的传参写法：

&emsp;&emsp; `<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>`
&emsp;&emsp; `<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>`

&emsp;&emsp; ***①bind的写法，如果只有参数this,合成事件e将会被隐式传递，额外的参数，在后面以逗号隔开。***
&emsp;&emsp; ***②箭头函数的合成事件传参就不太一样了，首先需要显式传递，其次合成事件会被作为第二个参数传递。***

&emsp;&emsp; **其次：bind函数在声明时，且你需要往绑定的函数内传参，合成事件需要放在最后一个参数，如下图所示**

```javascript
    preventPop(name, e){    //事件对象e要放在最后
        e.preventDefault();
        alert(name);
    }
    
    render(){
        return (
            <div>
                <a href="https://reactjs.org" onClick={this.preventPop.bind(this,this.state.name)}>Click</a>
            </div>
        );
    }
```