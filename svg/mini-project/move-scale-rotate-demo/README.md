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

-[x] 【view】初始化view相关的Rect、Circle、Anchor、Control布局
-[ ] 【model】初始化对应的model和GraphModel类，做到能够正常显示出图形
-[ ] 初始化点击和触摸事件，做到能够移入图形就能显示出anchors，点击能够显示拉伸的矩形Control
-[ ] 移动事件，能够移动整体图形 + 相关数学知识进行详细备注
-[ ] 旋转事件：增加anchor+事件交互，能够旋转整体图形 + 相关数学知识进行详细备注
-[ ] 缩放事件，能够缩放整体图形 + 相关数学知识进行详细备注
  -[ ] 没有旋转时的缩放逻辑
  -[ ] 旋转后的缩放逻辑
  -[ ] 旋转移动后的缩放逻辑


### 2.2 依靠上面第1点的分析进行基础版本的优化
> 包括第三方demo和x6的思路


### 2.3 根据基础版本分析LogicFLow相关逻辑存在的问题