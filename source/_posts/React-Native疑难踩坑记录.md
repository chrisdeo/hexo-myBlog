---
title: React-Native疑难踩坑记录
date: 2020-02-14 10:11:37
tags:
  - 移动端
  - React-Native
---

> &emsp;本文主要记录个人在RN开发中遇到的一些疑惑和理解及一些业务场景的处理方案。

<escape><!-- more --></escape>

### ScrollView

#### 多ScrollView嵌套问题

&emsp;&emsp;具体表现是，IOS表现形式与Android不同：Android在父子ScrollView嵌套场景下，子ScrollView滚到到顶部会直接联动（触发）父级的ScrollView滚动，而IOS并不会。该问题没有特别好的解决方案，临时的方案是根据滚动监听滚动条高度，达到顶部后渐进设置父级滚动到顶部。

&emsp;&emsp;另外一个体现是父子嵌套时，想要的效果是子列表滚动到底后再触发父级的向下滚动，Android没问题，IOS须要特殊处理，方案采用的是官方提供的IOS平台使用的API：`canCancelContentTouches`，当值为`false`时，一旦有子节点响应触摸操作，即使手指开始移动也不会拖动滚动视图。默认值为`true`（在以上情况下可以拖动滚动视图）。

### react-native-svg

#### 安装、配置报错问题

&emsp;&emsp;项目的实现主要依赖`react-native-svg`的库，语法其实还是`svg`的语法。不过我起初在模拟器中使用的时候，报了一个`RNSVGXXX`的错误，实体机上无影响。根据`npm`库的文档说明及一些博客相关问题记录最终解决：

1. 由于是Windows环境下的Android，在`install`包后，须要在`android/settings.gradle`下配置：

```javascript
include ':react-native-svg'
project(':react-native-svg').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-svg/android')
```

2. 在`android/app/build.gradle`下配置：

```javascript
implementation project(':react-native-svg')
```

3. 在`android/app/src/main/java/[...]/MainApplication.java`顶部增加导入语句`import com.horcrux.svg.SvgPackage;`，在`getPackages()`方法返回的数组内添加`new SvgPackage()`

4. `react-native link react-native-svg`

5. 重新装一次app，`react-native run-android`

#### svg画布中元素在实体机上并未按照中心居中

&emsp;&emsp;该问题的解决方案很简单，其实就是一个`viewBox`属性，估计没怎么使用过`svg`直接使用该库进行业务实现时，很容易出现问题（不加`viewBox`）。`viewBox`支持接收4个参数：x轴偏移，y轴偏移，宽度，高度。它主要用于保持我们绘制图像的比例到实际svg画布中（有可能我们绘画的大小大于给定的svg容器大小）。其中的比例调整机制依赖于另一个隐式默认声明的属性`preserveAspectRatio`，默认情况下为`xMidYMid meet`，即x轴中心与y轴中心对齐，并调整比例至画布能够完全显示内容。

#### 进度动画数值与进度不同步问题

&emsp;&emsp;能够使用`react-native-svg`后，在实现业务场景时（一个椭圆形的进度条），遇到了数值与进度不同步问题，解决方案主要从两方面出发：

1. 椭圆路径，即周长的计算: `L=2πb+4(a-b) `
2. 在第二个配置参数中，不要开启`useNativeDriver`，开启后会造成动画加速过快，应当通过动画摩擦力`friction`和动画张力`tension`控制：

```javascript
import { Ellipse } from 'react-native-svg';
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse)
// 输入输出值映射
this.ellipseAnimation = this.state.ellipseAnimation.interpolate({
    inputRange: [
    0,
    100,
    ],
    outputRange: [
    // 椭圆周长
    this.ellipseCircumference,
    0,
    ],
})

Animated.timing(
    // ellipseAnimation = new Animated.Value(0),
    this.state.ellipseAnimation,
    {
    toValue,
    duration,
    easing: Easing.easeInOut,
    // useNativeDriver开启后，会使得进度动画过快
    // useNativeDriver: true,
    friction: 0,     // 动画摩擦力
    tension: 66   // 动画张力
    },
).start()

<Svg>
    <AnimatedEllipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        stroke="#619FE7"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={this.ellipseCircumference} strokeDashoffset={this.ellipseAnimation}
    />
</Svg>
```

### FlatList

#### 在未进行滚动时，初始化列表数据会自动调用一次onEndReached

&emsp;&emsp;该问题主要是框架本身的问题，github的issue区也有人提类似的问题，一开始想通过内容高度和容器高度去做判断，不过后来发现当前组件的`onLayout`返回的变化高度是固定值，即上边栏下的所有空间，用目测估计的方式条目高度显然是不合适的，即使能够确定单个栏目高度，分组和`margin`都很难精准处理。所以最后采用了标记量的方式，初始化`this.shouldFetchMore`为`false`，既然会默认触发，则在触发函数内通过该标记`return`，另外通过`FlatList`的`onMomentumScrollBegin`进行`this.shouldFetchMore`设置，即产生滑动后才能触发加载更多数据。

#### 未滚动到底部便触发了onEndReached

&emsp;&emsp;`onEndReachedThreshold`配合使用，设置尽量小，结合实际体现，项目中取值`0.01`。

#### 滚动到底部同时触发多次onEndReached

&emsp;&emsp;典型的节流场景，写个节流闭包即可。注意`throttle`不能在`render`中通过匿名函数的方式实现，因为每次在`render`后的

#### IOS在数据未撑满首屏时，onRefresh在第二次调用时会触发onEndReached

&emsp;&emsp;这个问题属实奇葩，Android在处理好前面的几个问题后，已经可以正常使用了，但是在IOS端，进行第一次`onRefresh`触发，无异常，但是第二次触发`onRefresh`就会错误触发`onEndReached`（没有看错，就是在调用完`onRefresh`直接触发`onEndReached`，若没进行前面的操作，将会无限调用）。最初的做法是通过`onScrollBegin`回调参数`nativeEvent`中的`layoutMeasurement`和`contentSize`去进行标记量控制：

```javascript
  onScrollBegin = (e) => {
    const { layoutMeasurement, contentSize } = e.nativeEvent;
    // IOS在未撑满首屏时 第二次下拉刷新onRefresh 会触发onEndReached
    if (layoutMeasurement.height > contentSize.height) {
      this.stopIOSEndReachedAfterRefresh = true;
    } else {
      this.stopIOSEndReachedAfterRefresh = false;
    }
    this.shouldFetchMore = true
  }
```

&emsp;&emsp;当然看到这里，大家都发现了以上的这些应对方案是治标不治本的，即使我们现阶段能够cover住所有的case，亦难以保证未来又会有哪些奇葩场景，所以最后的方案就是，**不要在FlatList中使用`onEndReached`，取而代之的是使用`onScroll`判断滚动位置从而进行数据拉取**。

#### onScroll替代onEndReached

&emsp;&emsp;其实方法跟上面类似，也是通过滚动事件回馈的内容（`FlatList`）高度与窗体高度计算，只不过我们的上拉刷新是要在下边缘触发，所以判定条件即计算动态差值进行数据拉取的触发：

```javascript
  onScroll(e) {
    let y = e.nativeEvent.contentOffset.y
    let layoutHeight = e.nativeEvent.layoutMeasurement.height
    let contentHeight = e.nativeEvent.contentSize.height
    if (Math.abs(y + layoutHeight - contentHeight) < 1) {
      // fetch API
    }
  }
```

#### IOS可以通过scrollEventThrottle进行滑动事件节流

&emsp;&emsp;**IOS平台专用属性**，用于限制上滑触发（上面方案）的多次调用。默认值为0，描述`scroll`事件被调用的频率(ms级的时间间隔频率)。实际上我们设置1～16都不会有什么表现差异。这点可以结合刷新率来看，屏幕刷新率60Hz，表述1s60帧，换成我们渲染角度即每帧的渲染约16ms，`scrollEventThrottle`的单位我们可以进一步理解成**某个阈值**。当在这个阈值区间内，其实就归属消耗单位“X”帧渲染的响应，我们可以通过将该值设置得更高来规避多上面问题中的多次调用。

### react-navigation

#### static属性配置问题

##### 传参

&emsp;&emsp;目前项目中使用的是3.x版本的`react-navigation`库，说实话以前主PC端开发使用惯了`react-router`的我对此有点不适，因为当前版本中的`header`配置（移动端头部区域）是通过类的静态方法控制的，这意味着什么呢？这意味着对于一个组件我无法将要配置的路由状态放在`state`中维护（静态方法无法通过实例访问）。取而代之的需要手动在对于触发节点使用`navigation.setParams`设置...同样的一些需要涉及到组件内部状态数据的一些方法，我也无法在静态方法中直接调用，还要`setParams`进去，属实反人类...

##### 头部样式

&emsp;&emsp;问题主要出现在我需要限制最长显示长度的场景，多余的内容转省略号，其实这个功能在设置样式`maxWidth`后就可以实现了，不过中间出现了一些问题：根据官方文档我们知道，当我们设置`headerTitle`为字符串时，其实最终会被处理渲染成RN的`Text`组件，由于我们之前是对`headerTitleStyle`设置了最大长度，此时相对于外层容器来说，并没有进行居中化，还须要再设置一个`headerTitleContainerStyle` 进行限制。

### BackHandler

&emsp;&emsp;这个类比较有意思，主要在物理键返回定制的场景涉及到，比如要根据表单数据拦截返回，提示弹窗云云。常规方案就是通过`addEventListener`挂一个监听函数，从而进行拦截（`return true`）。

```javascript
    doSth = () => { return true }
    BackHandler.addEventListener('hardwareBackPress', this.doSth)
```

####  标题栏在IOS下有条黑线(borderBottom)

&emsp;&emsp;`headerStype`中设置`headerTransparent: true`(IOS), `elevation:0`（Android）。参加[issue](https://github.com/react-navigation/react-navigation/issues/2457)。

### Image

#### 请求远端uri的缓存问题

&emsp;&emsp;该问题出现在我使用Image组件加载一个远程图片`uri`的场景，并且只在`android`平台出现。由于远程图床生成图片有数量限制，超过数量则会覆盖以前的，即超过限制数量的图片请求的uri将会拿到以前请求过一模一样的uri，对于`ios`，RN的底层应该是做了不会缓存每次请求都会取最新的内容，但`android`则会拿之前请求过的资源展现；类似于我们浏览器的强缓存现象。由于是组件自身的配置，我们没办法设置该http请求的请求头，推荐解决方式就是在`uri`后拼接一个`hash`，可以使用时间戳的方式实现。服务端只会解析前面读取图片下载的请求，而手机端（客户端）也能理解是一个全新的请求，不走缓存。

### 布局后的位置计算

#### onLayout

&emsp;&emsp;该属性可以在组件构造布局完毕后回调，这样我们就可以在这个时机获取准确的位置。

#### ref的measure方法

```javascript
handleOnLayout = e => {
	this.someCompRef.current.measure((x, y, width, height, left, top) => {
		// do sth to trigger view
	})
}
```

&emsp;&emsp;这种调整样式布局方式常用在我们使用自适应，百分比，按设计图比例定制失效时使用。

### react-native-gesture-handler

&emsp;&emsp;`react-navigation`内部有使用该库进行手势返回的支持，该库需要升级到`1.5.1`版本后再使用，否则会有顶部引入缺失的报错。具体原因可以官方issue的版本发布changelog。

### 错误捕获

#### 全局的异常捕获

&emsp;&emsp;注：这个全局不包括promise内的异常，主要作用对象包括一些未`catch`的同步异常及同步代码里的timer类异常。

&emsp;&emsp;在升级0.62版本后，RN项目在安卓端运行时出现过一个很诡异的crash问题:

```javascript
// TypeError: t is not a function. (In 't(n)', 't' is "change")
// UncaughtException detected: com.facebook.react.common.JavascriptException
```

&emsp;&emsp;两端都没有该问题的定位方案，并且该问题在本地调试无法复现（控制台不会有任何异常打印），即只有部署服务器后才会出现。

&emsp;&emsp;最终的解决策略是利用RN端自身的全局错误捕获能力将该异常吞掉，根据安卓端的说法是这样处理异常不会冒泡到外层的容器被java捕获导致抛错引发crash，其实是治标但是暂无有效方法定位该问题：

```javascript
global.ErrorUtils.setGlobalHandler(e => {
  console.log('异常捕获信息：', e.message)
  printToApp('原生端打印错误信息：', e.message)
})
```

#### promise异常捕获

&emsp;&emsp;其实是利用facebook扩展的Promise方法：

```javascript
require('promise/setimmediate/rejection-tracking').enable({
      allRejections: true,
      onUnhandled: (id, error = {}) => {
        let message
        let stack
  
        const stringValue = Object.prototype.toString.call(error);
        if (stringValue === '[object Error]') {
          message = Error.prototype.toString.call(error);
          stack = error.stack;
        } else {
          /* $FlowFixMe(>=0.54.0 site=react_native_oss) This comment suppresses
           * an error found when Flow v0.54 was deployed. To see the error delete
           * this comment and run Flow. */
          message = require('pretty-format')(error);
        }
  
        const warning =
          `Possible Unhandled Promise Rejection (id: ${id}):\n` +
          `${message}\n` +
          (stack == null ? '' : stack);
        console.warn(warning);
        // promise未捕获的异常进行页面降级处理
        this.setState({
          showErrorPage: true
        })
      },
      onHandled: id => {
        const warning =
          `Promise Rejection Handled (id: ${id})\n` +
          'This means you can ignore any previous messages of the form ' +
          `"Possible Unhandled Promise Rejection (id: ${id}):"`;
        console.warn(warning);
      },
});
```

### TextInput

&emsp;&emsp;近期实现了一个业务场景：点击页面上的键盘按钮，弹出一个输入框，并且下面是系统自带的键盘区域。熟悉RN的都知道，我们在RN端唯一能弹起原生键盘的方式就是结合`TextInput`组件。根据官方文档，它有一个`autoFocus`属性，当输入框聚焦时，原生键盘会被自动唤起。然而实际情况却并非如此。在我的开发过程中，遇到了非常多奇怪的表现不一致问题，同一套代码，不同的机型，系统表现都不一致。不过幸运的是，最后都成功解决，这里记录下我的尝试路径。

&emsp;&emsp;首先我的键盘区域需要在一个弹出蒙层中触发，所以最外层有一个全屏的蒙层动效`Drawer`组件，根据视觉输出`TextInput`需要放在一个定制的`View`组件中进行布局定制，于是我们有大致下面的嵌套结构：

```javascript
	<Drawer>
		<View>
			<TextInput />
		</View>
	</Drawer>
```

&emsp;&emsp;接着我按照如下的步骤进行了尝试及优化，最终得到了稳定的弹出结果：

- 版本一： 仅设置`TextInput`的`autoFocus`属性为`true`；通过控制`Drawer`的挂载来进行整个输入框的显隐。结果：ios表现正常，android大部分有问题，主要表现为可以显示输入框，但是原生键盘没有唤起，显示上输入框有聚焦效果。须要二次点击输入框才能唤起键盘。
- 版本二： 分析版本一的过程中发现仅控制`Drawer`的挂载，实际上外层卸载的时候，没有卸载到`TextInput`组件，跟我们通常的理解不一致（有可能是安卓系统的一些内部处理问题）。于是在此基础上，我对每一层嵌套都使用了同一个哨兵变量控制强制挂载和卸载。结果：比版本一略好，但是还是经常出现无法唤起的问题。
- 版本三： 在版本二的基础上，将`autoFocus`的布尔属性也放入`state`中进行控制，企图达到重新聚焦唤起的作用。控制`autoFocus`的回调我放入了`TextInput`的`onLayout`中触发，确保输入框出现后再进行唤起。结果：ios都正常唤起，大部分android正常唤起，仅少部分机型仍须二次点击。
- 最终版本： 不使用`autoFocus`，直接使用`ref`控制输入框，调用输入框`focus`方法。在`onLayout`的回调中设置一定延时（时间比较关键，取0让系统自己决定不行，我这边取了`50ms`），确保`ref`能拿到内容，同时要触发一次页面`rerender`。这种方式比较hack，但能得到稳定的效果，代码如下：

```javascript
 // ...
 handleTextInputDidMount = () => {
	 // event loop to avoid engine render?
	 let handler = setTimeout(() => {
		 this.textInput && this.textInput.focus()
		 clearTimeout(handler)
	 }, 50)
	 // hack. without this, u might not call the keyboard
	 this.forceUpdate()
 }
 render() {
	 return (
		 // ...
		 isTextInputShow && <Drawer>
			{
				isTextInputShow && <View>
					{
						isTextInputShow && <TextInput
							onLayout={this.handleTextInputDidMount}
							ref={textInput => this.textInput = textInput}
						/>
					}
				</View>
			}
		 </Drawer>
	 )
 }
```

&emsp;&emsp;看上去很挫，但是it really works（摊手

### border-radius

&emsp;&emsp;iphone 6 上失效, 添加`overflow:'hidden'`样式可解决。

### Dimensions.get('window')与Dimensions.get('screen')的选择

&emsp;&emsp;window为app开启后的可视窗口大小对象，screen是设备的整个屏幕大小对象。一般来说我们需要获取screen的参数按照GUI设计参数进行计算适配。但是由于安卓系统多样性，`Dimensions.get('screen')`有时会获取到不准确的值，所以目前还是推荐使用`Dimensions.get('window')`。

### 字符串相关内容必须置于Text组件中

&emsp;&emsp;这种问题通常发生在`未置成Boolean值的属性 && <Comp />`的场景中，其实本意上开发者是想通过隐式加短路判断的方式去控制后面组件的渲染。但如果当前面的判断属性是一个字符串或数值，比如0这样的，那最终这段返回的就是个0.就会出现一个没有被`<Text>`包裹的错误：

 - `Cannot Add a child that doesn't have a YogaNode to a parent with out a measure function`

### RN的Modal须通过onRequestClose来响应安卓端的物理键返回回调

&emsp;&emsp;说白了，在安卓平台中，Modal的隐藏直接通过`onRequestClose`控制。不使用`BackHandler.addEventListener('hardwareBackPress', () => {}`。

### 字体粗细问题

&emsp;&emsp;由于不同平台、不同版本、不同厂商的系统间应用的字体不尽相同，我们如果按照在web端的直觉去进行样式设计，关于粗细很可能就是直接一个`400`,`500`的值设上去了，然而真实情况是，同样一个`500`加粗值，在IOS上表现正常，而Android却要调到`700`才有效果。根据文档建议，在RN中关于粗细，我们应当直接使用`normal`或`bold`属性，它会自动去系统中匹配最接近的数值。

![](fontWeight.jpg)

### Text嵌套层级影响换行

&emsp;&emsp;本意是根据官方的意思继承样式，不用嵌套内部的Text节点每个都应用样式；后发现这样会影响换行及显示：

```javascript
// has problem
<Text>
  <Text>
  </Text>
    <Text>
  </Text>
</Text>

// prefer
<View>
  <Text>
  </Text>
  <Text>
  </Text>
</View>
```

### 内嵌样式与StyleSheet的区别

&emsp;&emsp;直接在对象中编写样式和通过`StyleSheet.create`创建有什么差异？

Performance:

> &emsp;Making a stylesheet from a style object makes it possible to refer to it by ID instead of creating a new style object every time.
It also allows to send the style only once through the bridge. All subsequent uses are going to refer an id (not implemented yet).
anife
&emsp;&emsp;即通过`StyleSheet`构建的样式对象能够通过ID的形式进行复用，不会在`rerender`中再进行渲染。