---
title: React中的合成事件以及传参问题
date: 2018-12-06 10:28:10
tags:
  - Javascript
  - React
---

> &emsp;在前端技术发展的过程中，诸如jQuery、angular、react、vue等等的"框架"出现给开发人员的coding效率带来了质的飞跃，不同的技术选型主要是结合了框架自身的优点以及对历史遗留问题的考量。于我自身而言，觉得框架除了思想上的革新外，更为关键的一点是对于不同浏览器环境的兼容问题做了一个统一处理，让我们能够更平滑地处理"单一"问题，而这之中有一些封装的隐性特征往往容易被我们忽略。

## 什么是合成事件？

&emsp;&emsp;根据[React官方文档](https://react.docschina.org/docs/events.html)所述，合成事件的英文术语为SyntheticEvent，我们调用的处理函数会接收一个SyntheticEvent的
实例，它是一个跨浏览器的封装组合体，具有与浏览器原生事件一样的接口，我们在React里绑定事件函数默认传递的都是合成事件。

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

#### bind绑定

***1.1 在构造函数内绑定***
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

***1.2 直接在函数绑定内bind***
```javascript
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};
  }

  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick.bind(this)}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
```

#### 箭头函数
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
&emsp;&emsp; 当然*在回调函数中使用箭头函数*这种绑定方式是不推荐使用的，因为这样每次render都会返回一个不一样的匿名函数，如果将其作为属性往子组件传递，可能会造成额外的rerender。


#### ::双冒号绑定(使用babel支持)

&emsp;&emsp; 先简单描述一下双冒号运算符：双冒号左边是一个对象，右边是一个函数。该运算符会自动将左边的对象，作为上下文环境（即this对象），绑定到右边的函数上面，即`foo::bar`等价于`bar.bind(foo)`，除此之外，当双冒号左侧为空，右边为对象的函数方法时，等价于将该方法绑定在该对象上。举个栗子：`var method = ::obj.foo;`等价于`var method = obj::obj.foo;`等价于`var method = obj.foo.bind(obj);`。这样实质上还是一个bind绑定。

```javascript
//双冒号绑定
class LoggingButton extends React.Component {
  handleClick() {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={::this.handleClick}>
        Click me
      </button>
    );
  }
}
```

### 传递参数姿势

&emsp;&emsp; 先看文档中的两种函数绑定的传参写法：

&emsp;&emsp; `<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>`
&emsp;&emsp; `<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>`

&emsp;&emsp; ***①bind的写法，如果只有参数this,合成事件e将会被隐式传递，额外的参数，在后面以逗号隔开***
&emsp;&emsp; ***②箭头函数的合成事件传参必须进行显式传递，合成事件的传参位置由你定义的函数体接收参数位置决定。***

&emsp;&emsp; **其次：bind函数在声明时，且你需要往绑定的函数内传参，合成事件需要放在最后一个参数（隐式传递），如下图所示**

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

&emsp;&emsp; **补充：如果我们在绑定箭头函数的时候错误闭合了函数，将会造成函数立执行问题，即渲染时，不断调用该函数。e.g `onClick={this.handleClick(params)}` handleClick是组件中声明的箭头函数，这种情况出现的原因往往是由于对传参的正确姿势认知不清晰造成的。**
