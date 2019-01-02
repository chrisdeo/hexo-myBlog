---
title: React开发填坑记录(持续更新中)
date: 2018-12-10 09:11:57
tags: React
---

> &emsp;本文主要记录自己曾在React开发过程中踩过的坑。

#### React组件声明时，第一个字母须大写

&emsp;&emsp;这个问题出现的时间比较早了，是最开始接触React那会，曾把类名用驼峰法定义了，导致无法import。

#### 在事件绑定中错误的闭合了函数，导致render时不断渲染触发该函数

&emsp;&emsp;在使用Antd提供的封装Button组件内绑定回调函数时，想要往里面传参，但是由于闭合了函数导致了函数的自执行(姿势不对，Reason见[《React中的合成事件以及传参问题》](http://www.chendiyou.com/2018/12/06/React%E4%B8%AD%E7%9A%84%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E4%BB%A5%E5%8F%8A%E4%BC%A0%E5%8F%82%E9%97%AE%E9%A2%98/)一文。

<escape><!-- more --></escape>

#### Antd的Form中，getFieldDecorator不能装饰纯函数组件。

&emsp;&emsp;开发过程中，由于在内层返回了纯函数组件，导致无法进行表单值的记录和重填，解决方案其一是使用框架本身自带的组件，将嵌套的布局DOM放置到getFieldDecorator外层包裹，由于其封装的组件都是类组件，所以能够正常获取关联值。其二是将其中的嵌套结构抽离出来做成一个类组件再引入，同样能够解决问题。

#### Antd的Form表单中，添加了rules规则，即便在数据不符合条件的情景下并触发了页面的错误msg提示，点击按钮后依旧发出了请求。

&emsp;&emsp;这个坑的原因是误认为，通过rules的true和false能够直接拦截提交事件，而事实上在文档中的validateFields这个方法的回调函数有个参数err，这个属性对应我们整个Form结构中的校验，当其中有一处为false，err就为真，所以在提交按钮对应的触发函数中应嵌套一层err判断，否则无法对错误格式的表单信息进行拦截。

#### Dva中的reducer和effects的函数命名请勿重复。

&emsp;&emsp;这个问题是在一次点击按钮进行接口请求时，接口并不是请求一次而是不断触发去请求发现的。后面定位到原来是在dva框架的model中，reducer与effects中的函数命名重复所致。因为put方法会去调用这个函数，相当于直接在本身循环引用了，致使不断请求接口造成死循环。不过model里也不是不能用重复命名的函数，service导入的函数名是可以和effects内的函数名相同的。

#### Antd中的Upload组件在Form中使用onChange最终无法修改表单值，需用getValueFromEvent。

&emsp;&emsp;这个问题还是在跟强哥讨论的时候发现的，onChange绑定的函数的确对表单值进行了操作，但是最终由于getFieldDecorator本身具有自动收集表单数据的特性，在后面又会被赋值回去（antd issue中的解释）。正确的修改姿势是使用`getValueFromEvent`，它可以把onChange的参数转为控件的值，代码如下：

```javascript
    {getFieldDecorator('upload', {
    valuePropName: 'fileList',
    getValueFromEvent: this.handleUpdate,   //你要绑定的操作函数
    })(
    <Upload name="logo" action="/upload.do" listType="picture">
        <Button>
        <Icon type="upload" /> Click to upload
        </Button>
    </Upload>
    )}
```

#### 及时清理你的Redux数据，否则会带来一些意料之外的问题。

&emsp;&emsp;有些场景中，我们从一级页面进入二级页面，请求后端接口，会拿到数据来渲染DOM，这个时候的数据是会存在Redux里的，如果我们没有在退出二级页面的时候在卸载周期中清理Redux数据，那么下次进入二级页面，如果接口报错，就没有办法覆盖上一次的Redux存储数据，即没有按照预期出现最新的请求数据，而显示了上一次的结果，这显然是不合理的。同理，在一些Table表单没有默认搜索的时候，我们进行查询条件搜索，得到数据放入Redux，当切换页面再返回的时候，由于没有默认请求，就没有办法覆盖之前的数据，同样会造成一样问题。综上所述，开发人员应当养成在Life Cycle卸载时，将当前组件关联的Redux数据清空的习惯。

#### dva中正确使用与副作用对应的loading而非整个model的loading。

&emsp;&emsp;使用过dva的开发者，都清楚我们通常在fetch数据的时候，配合antd提供的前台方案组件中有个加载的loading属性，这个值我们通常使用loading.models.namespace来获取。但当这个models中具有很多不同的副作用函数操作，并且分别位于一个页面的不同部分时，比如上下左右都有区域有不同的请求发送，那么我触发其中一个接口，其他的loading就会开始旋转，这显然是耦合度极高的一种现象，严重阻塞了我别的功能模块的使用，是不合理的。dva本身提供了获取专门对应相关副作用的API，可以通过`loading.effects['namespace/副作用函数名']`来拿到，这样可以使我们每个loading职责明确化，一对一，清晰明了。

#### antd中Table的Columns属性中的width在Chrome下是按总和比例适应的，而在IE中是按实际宽度值来显示。

&emsp;&emsp;如描述来说，这样实际场景中就会有很严重的兼容性问题，一般而言，超过Table的宽度，我们会有样式`overflow-x: scroll`，这样就能通过滚动条来浏览过长内容，IE在Table组件没有数据时，也的确是有滚动条的，但一旦有数据填充了Table，滚动条样式就没了，长度超过了Table的宽，就被`overflow: hidden`掉了。目前想到的兼容措施就是，在上面手动根据浏览器agent判断覆盖一层class来实现与Chrome中一样的效果。