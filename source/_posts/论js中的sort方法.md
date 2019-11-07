---
title: 论js中的sort方法
date: 2019-11-07 08:56:22
tags:
  - Javascript
  - 算法
  - 计算机基础
---

> &emsp;sort方法可以说是前端工程师在平日开发中接触到最多的algorithm了，但我想绝大部分人是没有关注过底层逻辑的...

<escape><!-- more --></escape>

&emsp;&emsp;就以我本人来说（先把菜鸡本体挂上来），对`Array.prototype.sort`这个方法的理解就是在较小数量的排序下会采用插入排序，大数量级则会转快排。

&emsp;&emsp;[v8 array.js](https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js)部分：

```javascript
// In-place QuickSort algorithm.
// For short (length <= 22) arrays, insertion sort is used for efficiency.

var comparefn = function (x, y) {
    if (x === y) return 0;
    if (%_IsSmi(x) && %_IsSmi(y)) {
    return %SmiLexicographicCompare(x, y);
    }
    x = TO_STRING(x);
    y = TO_STRING(y);
    if (x == y) return 0;
    else return x < y ? -1 : 1;
};

var InsertionSort = function InsertionSort(a, from, to) {
    for (var i = from + 1; i < to; i++) {
        var element = a[i];
        for (var j = i - 1; j >= from; j--) {
            var tmp = a[j];
            var order = comparefn(tmp, element);
            if (order > 0) {
                a[j + 1] = tmp;
            } else {
                break;
            }
        }
        a[j + 1] = element;
    }
};
```

&emsp;&emsp;根据注释，在数组长度不超过22的情况下，使用插入排序将更加高效。长度超过22的情况才采用快排。

### 插入排序

&emsp;&emsp;插入排序的思想很简单：

&emsp;&emsp;1. 通过逐步插入使整体有序。
&emsp;&emsp;2. 认为已插入部分有序。 
&emsp;&emsp;3. 从数组的第一个元素（自然是有序的）开始插入。
&emsp;&emsp;4. 有序数组自后向前检视，是否有比插入元素大的元素存在。
&emsp;&emsp;5. 由于是自后向前检视，那第一个拿到的元素自然是有序数组内最大的。
&emsp;&emsp;6. 如果插入元素与倒序拿到的第一个元素比较更大，那直接跳出循环。此时`i === j + 1`，相当于还是在老位置赋值。
&emsp;&emsp;7. 如果插入元素与倒序拿到的第一个元素比较更小，那就开始循环往前比较，每一次比较只要更小，之前的元素往后移一个位置，`a[j+1] = a[j]`。
&emsp;&emsp;8. 直到遇到比插入元素小的元素停下，把插入元素填到后面的坑上，`a[j + 1] = element`。 

&emsp;&emsp;其实分析到这，又想起了那天那个优先级队列的问题，感觉有点像，其实不然。这个是数组整体已知，是个静态的重新排序问题，而之前的那个则是动态比较构建有序的过程。

### 快速排序

&emsp;&emsp;最早接触快排自然是大学时期的《数据结构》课程，后面学js的时候看了《数据结构与算法JavaScript描述》一书。之所以被称为快速排序，是因为相较于其他算法的时间复杂而言，它的确很快...我们通常讨论时间复杂度都是以平均时间复杂度来衡量，快排的时间复杂度为 **O(nlogn)**。

![](complexity.jpg)

&emsp;&emsp;那什么是快排？可以理解为这是一种分治的思想，《数据结构与算法JavaScript描述》一书中给出的具体实现是通过寻找一个基准点，开辟两个数组，比基准点小的元素推入左侧数组，比基准点大的元素推入右侧数组，然后再在左右两个数组递归前面的过程，最终通过`concat`或解构方法铺平成一个数组。代码如下：

```javascript
function quickSort(arr) {
	if (!Array.isArray(arr)) return;
	if (arr.length === 0 || arr.length === 1) return arr;
	let left = [];
	let right = [];
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > arr[0]) {
			right.push(arr[i]);
		} else {
			left.push(arr[i]);
		}
	}
	return [...quickSort(left), arr[0], ...quickSort(right)];
}
```

&emsp;&emsp;上面这种方案可以说是非常直观好理解的了，但是我们也发现源码中的快排代码明显不是这么玩的，看上去要“复杂”得多。

&emsp;&emsp;我们先不直接去讨论源码中的实现，可以提出一个问题：如何优化上面这个快排算法？

&emsp;&emsp;一个比较好的介入点是“空间消耗”。在前面我们提供的快排函数中，每次递归的过程中都会开辟两个新的数组来进行小堆和大堆的放置。那有没有办法不开辟这些数组空间来进行快排呢？

#### 原地快排

&emsp;&emsp;方案自然是有的，那就是原地快排。原地快排的思想在于通过比较基准值和遍历元素的大小再交换的动作来替代分治时的空间开辟，优化了递归环节中空间损耗的问题。

&emsp;&emsp;那既然是交换，肯定需要有一个交换的函数：

```javascript
function swap(arr, from, to) {
    if (arr[from] === arr[to]) return; // 两值相等，没必要交换位置
    [arr[from], arr[to]] = [arr[to], arr[from]];
}
```

&emsp;&emsp;有了交换的辅助函数，剩下的就是原地快排的函数主体，基础思路就是，选择基准点，然后换位...怎么换，或者说如何进行分区？

&emsp;&emsp;1. 选取基准点。
&emsp;&emsp;2. 这里我们取第一个元素，同时设置一个分区指针`startIdx`。它的意义就是最后交换完成时，标记分界线，我们会将基准值与其位置的值交换。最终得到基准值左侧小，右侧大的结果（完成分区）。 

```javascript
function doPartial(arr) {
    let startIdx = 0;
    let pivot = arr[startIdx];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < pivot) {
            startIdx++;
            swap(arr, i, startIdx);
        } else {
            continue;
        }
    }
    swap(arr, 0, startIdx);
}
```

&emsp;&emsp;注意这里我们其实都是对一个数组进行修改，要改写一下前面的分区操作：

```javascript
function doPartial(arr, from, to) {
    let startIdx = from;
    let pivot = arr[startIdx];
    for (let i = 1; i < to; i++) {
        if (arr[i] < pivot) {
            startIdx++;
            swap(arr, i, startIdx);
        } else {
            continue;
        }
    }
    swap(arr, from, startIdx);
}
```

&emsp;&emsp;然后是原地快排的组合：

```javascript
function quickSortInPlace(arr, from, to) {
    if (!Array.isArray(arr) || arr.length < 2) return;
    let startIdx = from;
    let pivot = arr[startIdx];
    for (let i = from + 1; i < to; i++) {
        if (arr[i] < pivot) {
            startIdx++;
            swap(arr, i, startIdx);
        } else {
            continue;
        }
    }
    swap(arr, from, startIdx);
    quickSortInPlace(arr, from, startIdx - 1);
    quickSortInPlace(arr, startIdx + 1, to);
}
```