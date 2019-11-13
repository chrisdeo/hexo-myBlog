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

&emsp;&emsp;有了交换的辅助函数，剩下的就是原地快排的函数主体，大致思路如下：

1. 设置基准点。
2. 从基准点后开始循环。
3. 从前向后扫描，找到比基准点大的值（移动左指针）；
4. 从后向前扫描，找到比基准点小的值（移动右指针）；
5. 交换两值，最终目的是指针重合后（找到中位线），中位线左侧值都小于基准值，右侧都大于基准值；
6. 当左指针大于右指针时跳出循环，此时一次轮回完成，交换基准位置到中位线处；
7. 在中位线左右侧分别递归上述过程。

```javascript
function quickSortInPlace(arr, from, to) {
    // 递归出口，起止扫描同位置时，意味着仅剩一个元素，无需递归
    if (from < to) {
        let pivot = arr[from]; // 基准点
        let lStart = from + 1; // 开始比较的值 从基准点后一个开始
        let rEnd = to - 1; // 遍历
        while(true) {
            while (lStart <= rEnd && arr[lStart] < pivot) {
                lStart++;
            }
            while (lStart <= rEnd && arr[rEnd] >= pivot) {
                rEnd--;
            }
            if (lStart > rEnd) {
                break;
            } else {
                swap(arr, lStart, rEnd);
            }
        }
        swap(arr, from, rEnd); // 交换基准到中间位置，此时rEnd已在中间指针
        quickSortInPlace(arr, from, rEnd);
        quickSortInPlace(arr, rEnd + 1, to);
    }
}
```

##### 分区问题

&emsp;&emsp;其实上面已经实现了基本的原地快排算法，但依旧有问题。主要表现在分区时是否能使当前区域等分。若都能均分，就是我们讨论的最快情形**O(nlogn)**。但如果每次分区，都有一个区域是空的，那相当于退化了，又变成逐个循环的**O(n^2)**情形。所以如果一个数组已经排好序了，按照最开始的做法，每次分块都会造成空间浪费，且性能也会退化。

&emsp;&emsp;那有什么方案是专门用来进行基准值选择的呢？

##### 三数取中

&emsp;&emsp;字面意思理解，就是取三个数字中大小在中间的数字，MDZZ。

&emsp;&emsp;结合快排分区来说，我们可以很容易得到头、尾元素肯定是要参与其内的，剩下一个元素我们可以结合一下源码：

```javascript
var GetThirdIndex = function(a, from, to) {
    var t_array = new InternalArray();
    // Use both 'from' and 'to' to determine the pivot candidates.
    var increment = 200 + ((to - from) & 15);
    var j = 0;
    from += 1;
    to -= 1;
    for (var i = from; i < to; i += increment) {
        t_array[j] = [i, a[i]];
        j++;
    }
    t_array.sort(function(a, b) {
        return comparefn(a[1], b[1]);
    });
    var third_index = t_array[t_array.length >> 1][0];
    return third_index;
}

var QuickSort = function QuickSort(a, from, to) {
    var third_index = 0;
    // 略
    if (to - from <= 10) {
        InsertionSort(a, from, to);
        return;
    }
    if (to - from > 1000) {
        third_index = GetThirdIndex(a, from, to);
    } else {
        third_index = from + ((to - from) >> 1);
    }
    // 略
}
```

&emsp;&emsp;大概理解下：

1. 初始化第三个参与比较的基准数字为0；
2. 当区间在11~1000内时，取`from + (to - from) / 2`;
3. 区间大于1000时，会取一个增量区间（200~215），在`from`到`to`间以该增量区间进行取值构成新数组，新数组排序后返回中间值的索引充当第三个比较基准。
4. 最后`from`、`to`、`third_index`三数比较（过程见源码），中间值作基准值。

```javascript
// v0 <= v1 <= v2
a[from] = v0;
a[to - 1] = v2;
var pivot = v1;
```

##### 源码分区

&emsp;&emsp;在以上基础上，得到源码中的分区实现：

```javascript
partition: for (var i = low_end + 1; i < high_start; i++) {
    var element = a[i];
    var order = comparefn(element, pivot);
    if (order < 0) {
        a[i] = a[low_end];
        a[low_end] = element;
        low_end++;
    } else if (order > 0) {
        do {
            high_start--;
            if (high_start == i) break partition;
            var top_elem = a[high_start];
            order = comparefn(top_elem, pivot);
        } while (order > 0);
        a[i] = a[high_start];
        a[high_start] = element;
        if (order < 0) {
            element = a[i];
            a[i] = a[low_end];
            a[low_end] = element;
            low_end++;
        }
    }
}
if (to - high_start < low_end - from) {
    QuickSort(a, high_start, to);
    to = low_end;
} else {
    QuickSort(a, from, low_end);
    from = high_start;
}
```

&emsp;&emsp;分析可以得到大致思路如下：

1. 先找到基准索引，然后交换基准与下界；
2. 从第二个位置开始扫描，遇到比基准值小的，与基准值交换位置，同时`low_end`自增，标志基准的位置；
3. 遇到比基准值大的情况，开始从上边界往前扫描，直到找到比基准值小的元素（与外部扫描指针重合，则跳出循环）；
4. 此时，将我们找到的比基准值小的元素 与 前面比基准值大的交换位置；
5. 然后将基准值与这个较小值换位，`low_end`自增；
6. 第一round分区结束，**取范围小的区域进行递归（减少递归的深度）**，另外一个区域则继续通过`while`循环处理。