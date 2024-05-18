# svg小型demo

为了解决[LogicFlow项目](https://github.com/didi/LogicFlow)中【移动】、【缩放】、【旋转】等相关功能的联动问题

> 关联`https://github.com/didi/LogicFlow/issues/1446`

## 1.分析

### 1.1 第三方demo思路分析

> 基于[codesandbox示例](https://codesandbox.io/s/editor-example-yqp8ce?file=/src/demos/demo3-drag/edit/drag/index.tsx)的思路分析

### 1.2 x6相关逻辑分析

### 1.3 LogicFlow相关逻辑分析


## 2.设计与实现

### 2.1 根据LogicFlow复刻一个基础版本

-[x] 【view】初始化Rect和Circle图形
-[x] 【view】初始化anchor布局
-[x] 【view】初始化图形的Control布局（用于拖拽拉伸）
-[ ] 【model】初始化对应的model和GraphModel类
-[ ] 初始化点击和触摸事件
-[ ] 移动事件
-[ ] 旋转事件：增加anchor+事件交互
-[ ] 缩放事件
  -[ ] 没有旋转时的缩放逻辑
  -[ ] 旋转后的缩放逻辑
  -[ ] 旋转移动后的缩放逻辑


### 2.2 依靠上面第1点的分析进行基础版本的优化
> 包括第三方demo和x6的思路


### 2.3 根据基础版本分析LogicFLow相关逻辑存在的问题