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