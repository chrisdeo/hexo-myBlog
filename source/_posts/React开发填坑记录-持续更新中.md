---
title: React开发填坑记录(持续更新中)
date: 2018-12-10 09:11:57
tags:
  - Javascript
  - React
---

> &emsp;本文主要记录自己曾在React开发过程中踩过的坑。

#### React组件声明时，第一个字母须大写

&emsp;&emsp;这个问题出现的时间比较早了，是最开始接触React那会，曾把类名用驼峰法定义了，导致无法import。

#### 在事件绑定中错误的闭合了函数，导致render时不断渲染触发该函数

&emsp;&emsp;在使用Antd提供的封装Button组件内绑定回调函数时，想要往里面传参，但是由于闭合了函数导致了函数的自执行(姿势不对，Reason见[《React中的合成事件以及传参问题》](https://chrisdeo.github.io/2018/12/06/React%E4%B8%AD%E7%9A%84%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E4%BB%A5%E5%8F%8A%E4%BC%A0%E5%8F%82%E9%97%AE%E9%A2%98/)一文。

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

#### antd DatePicker 日期选择 点击今天按钮 会出现时间多出一天。

&emsp;&emsp;年前的一个业务模块出现了该问题，由于这块代码之前不是我负责的，所以经过review以及官方issue查找后发现，是由于原本的开发者在进行时间格式化处理的时候，没有使用`moment`的标准格式化操作，而是使用了类似`(moment(fieldsValue.datePicker._d).format('YYYY-MM-DD HH:mm'))`的做法，将内部的值取出来单独做了操作导致的，正确姿势直接用`moment`本身具备的格式化操作即可`(fieldsValue.datePicker.format('YYYY-MM-DD HH:mm'))`。原因在issue中看了部分解释个人觉得合理的如下：
&emsp;&emsp;1. 点击 今天/现在 那个按钮时，moment对象会经过`getTodayTime`设置了 `utcOffset`。
&emsp;&emsp;2. `utcOffset`会把 moment 对象的`_isUTC`设为`true`并设置`_offset`。
```javascript
// 日期面板 moment 对象
{
  _isUTC: false,
}
// 现在、今天按钮的 moment 对象
{
  _isUTC: true,
  _offset: 480,
}
```
&emsp;&emsp;可以看到发生多一天的根本原因是有8小时的偏移量，最近issue中维护人员给出了[stackoverflow上的解释](https://stackoverflow.com/questions/31096130/how-to-json-stringify-a-javascript-date-and-preserve-timezone/31104671#31104671)。原帖中的提问是如何将Date对象Json stringify后，仍然能够保有其时区的信息，楼主表示使用`moment.format()`可以实现，但是当对一个具有多属性的对象进行stringify就不便了，然后楼下有个大佬就比较秀了，通过重写Date原型链上的`toJSON`方法来改变JSON.stringify对Date序列化时的表现。也是使用了`moment.format()`，综合有`Date.prototype.toJSON = function(){ return moment(this).format(); }`。按照这个大佬的说法，这样做可以在输出ISO8601时间标准格式的同时涵盖时区偏移量。并且这样做会使所有Date对象都有这种特性，显然在个性化上不太好处理，大佬也给出了建议，直接在实例化对象的`toJSON`方法上改写即可。

#### antd Modal componentDidMount周期内无法获取Modal嵌套内容节点。

&emsp;&emsp;遇到该问题的场景是需要在一个Modal弹窗的内容区域增加水印，水印铺盖方式是先获取内容DOM，然后通过`insertBefore`方法插入节点。这个内容DOM有两种思路，第一种是**获取Modal嵌套的容器**，第二种则是**获取组件`Modal`最终渲染出来的主体部分，即class为`.ant-modal-body`的div。**先说第一种，在`componentDidMount`时返回`null`，复现如下：

![](sandbox.jpg)
&emsp;&emsp;这个问题，在github的issue里也看到有人提到。那么怎么拿到这个DOM呢？红线框出来的是官方维护人员给出的正确使用姿势。
&emsp;&emsp;再看第二种，一开始其实我也是没有拿到，根本原因是，我的渲染控制是类似以下这样的：
```javascript
    showFlag && (
        <Modal
            visible={showFlag}
        >
            <MyComponent />
        </Modal>
    )
```
&emsp;&emsp;其实就是一个很明显的错误，state初始化控制的`showFlag`为`false`，即一开始是没有渲染`Modal`，`componentDidMount`只执行一次，当然拿不到Modal的渲染结果。我们只需要将获取DOM的操作放到`componentDidUpdate`中即可。

#### React中打开新空白页的正确姿势。

&emsp;&emsp;场景是这样的，我需要先弹出一个Modal框，里面是后端返回的文本组成的打印文案，然后我需要预览并按照A4比例打印该内容。核心难点在于实际打印的模板样式和在Modal框中展示的样式是不同的。通过获取DOM的InnerHTML属性，我们可以将打印内容通过原生的`window.print()`方法预览打印，但是如果直接将Modal中的内容选取打印得到的是一块缩小的内容不符合我们的需求打印展示，所以需要打开一个新的空白页面重新在里面填充一个符合比例的模板样式。就在这个时候，我发现按照框架(DVA)内带的路由绑定组件后，新页面还是作为了单页的一块而不是独立的页面。想要将其单独设置其实也很简单，开发中使用的路由是`react-router-dom`v4前的版本，直接在`<Route path="/你的路径" component={你的组件} />`引入我们调整后的页面样式即可。

#### 注意关注包的依赖问题。

&emsp;&emsp;今天在跟往常一样进行移测时，测试突然反馈部署的时候，报错了。当时我挺懵逼的，毕竟之前好几个版本和关联系统都是相同的配置咋会突然就不行了呢？`package.json`中的文件也没有修改过，从测试环境截下来的错误是`Module not found: Error: Can't resolve '@babel/runtime/helpers/esm/extends' in '/app/jenkins/jenkins_home/workspace/XXX/node_modules/esm'`，从本地环境对比下发现`@babel/runtime/helpers`里并没有`esm`，而是存在一个`es6`的目录，初步判定为依赖版本改变导致，但是这边从来没有修改过配置，那只能猜测是否是框架本身的库的上游依赖发生了更新动作或者替换，在后续借助搜索引擎的帮助下，又得到了一个改变`roadhog`版本号的方案，`roadhog`是`dva`框架下的一员，于是跑到github下的dvajs的issue里一搜，果然有相关的问题：

![](ems.jpg)

&emsp;&emsp;按照图中第二种方案，修改如下，问题解决。

![](change.png)

#### Antd的Form如何再次校验已经校验过的表单域。

&emsp;&emsp;这个问题主要是发生在表单联动比较多的场景，比如其中一个下拉表单项有是和否两个值，只有在是的时候可以选择填充其余表单，否的时候则禁用其余表单并默认清空。其实到这里都是比较实现的，由于表单项中的数据发生改变会触发render，我们在render中去通过`form.getFieldValue`获取表单变量，并以此为条件判断来渲染改变后面的控制如`disabled={formValue === 'value'}`，`required: { formValue === 'value' || formValue === undefined }`。这就是`JSX`优秀之处，但是`ant-design`本身对`Form`的处理比较神奇，它在对一块表单域进行校验通过后，后续的校验方法即`form.validateFields`中的`err`将会默认为`false`,这样也就意味着我们无法再通过该方法校验我们重新调整过规则的表单域，那怎么搞呢？ 

&emsp;&emsp;`ant-design`文档中对`validateFields`方法有这样一个可选的`force`属性配置，用于对已经校验过的表单域在`validateTrigger`再次被触发时判断是否再次校验，默认值是`false`，即不会再次校验，所以会有我们这种更新后无法触发trigger的问题。**正确姿势就是配置`force`**，见下图：

```javascript
handleSubmit = (e) => {
  e.preventDefault();
  const { form } = this.props;
  form.validateFields({ force: true }, (err, values) => {});
}
```