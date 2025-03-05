> https://github.com/didi/LogicFlow/issues/1581
> 
> 记录了解决这个问题的思路

## 问题表现

经过[pull#1993](https://github.com/didi/LogicFlow/pull/1993)和[pull#2004](https://github.com/didi/LogicFlow/pull/2004)改造，在这个[LogicFlow/vue3-memory-leak的demo](https://github.com/didi/LogicFlow/tree/master/examples/vue3-memory-leak)中仍然发生了内存泄露的情况，如下图所示

![内存泄露](./image/1.png)

使用最新的代码，但是 Memory 仍然无法释放

## 解决思路

两个方向:
1. 上面的pr的修复是有效的，但是仍然没有修复干净
2. 上面的pr的修复是有效的，但是这个demo的一些代码还是造成了内存泄露的问题

-------

1. 我们按照上面pr修复思路再去检查demo的一些代码是否发生了内存泄露
2. 使用一些内存泄露的工具检测（比如[MemLab](https://github.com/facebook/memlab?spm=5aebb161.2ef5001f.0.0.3dff5171UJh1iK))

## 开始排查

经过[vue3-app](https://github.com/didi/LogicFlow/tree/master/examples/vue3-app)的运行发现，[pull#1993](https://github.com/didi/LogicFlow/pull/1993)确实是有效的，但是存在两个问题
- 只处理 `vue3-app` 中 `node` 的内存回收处理，并没有处理 `node` + `edge` 的模式
-  `vue3-app` 中 `node` 的内存能够回收90%以上，但是仍然存在一些内存泄露，造成 Memory 仍然每次清除后会小幅增加内存 => 多次 clear 后，内存泄露还是很明显的

## 接下来的思路

1. 阅读一定的文献，使用一些工具，排查出具体源码内存泄露的位置（因为代码太多了，不可能一个一个文件去看）

2. 仿造[pull#1993](https://github.com/didi/LogicFlow/pull/1993)和[pull#2004](https://github.com/didi/LogicFlow/pull/2004)先对 `edge` 进行内存泄露的处理
- 可以先通过不断屏蔽提交代码确定内存泄露最大的地方
- 检测提交代码是否有冗余没用的部分
3. 根据工具排查，对剩余的一些内存泄露地方进行优化处理

最终还是通过 Memory 进行验证内存泄露是否处理干净

## 开始排查

### 工具分析泄露位置

1. xxx
2. xxx
3. xxx

### 仿造


### 工具分析位置继续修复


# 参考
1. [如何查找和解决前端内存泄漏问题？ - 排查和分析技巧详解](https://juejin.cn/post/7232127712642547770)
2. [Memory Leaks in JavaScript: Understanding and Prevention](https://medium.com/@vikramkadu/memory-leaks-in-javascript-understanding-and-prevention-667835fcc650)
3. [Memory Leak Detection in Modern Frontend Apps](https://dev.to/shcheglov/graphql-non-standard-way-of-selecting-a-client-library-5bid)
4. [Memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management?spm=5aebb161.2ef5001f.0.0.3dff5171UJh1iK)



