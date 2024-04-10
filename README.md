# 一.web2D、web3D电子书


## 1. 项目目标

1. 学习`canvas`、`webGL`、`threeJS`、`webGIS`基础知识
2. 实战相关的应用

## 2. 项目文件说明

### 2.1 canvas
1. canvas基础知识：docs和demo
2. canvas常见应用：mini-project（比如富文本，比如表格）
> 尝试参与多种开源库进行pr

### 2.2 three.js
1. three.js基础知识：docs和demo
2. three.js常见应用：mini-project（比如高德地图上叠加路线）
> 尝试自研three.js实现多种数据源的3D构建和2D构建

### 2.3 webGL
1. webGL基础知识：docs和demo


## 3. 目前正在做的事情

### 3.1 canvas

```shell
cd canvas 
npm install 
npm run docs:dev
```

#### 3.1.1 Vue3 + Vite实现简单的白板

通过[白板项目](https://github.com/wbccb/canvas-web3D/tree/main/canvas/mini-project/mini-whiteboard)，熟练掌握canvas的常见场景编码，培养canvas坐标、滑动、放大缩小等综合性应用的开发能力，掌握常见的canvas优化方案

> 开发进度：

##### v0.1.0版本
- [x]  画布背景网格显示
- [x]  支持绘制矩形
- [x]  无限画布
- [x]  无限画布移动时能够正常重绘所有图形(scrollX和scrollY的修正)
- [x]  支持绘制菱形
- [x]  支持绘制自由画笔
- [x]  支持绘制多行文字
- [x]  支持绘制图片
- [x]  支持整体画布放大缩小
- [x]  支持转化为图片下载
- [x]  性能优化总结
- [ ]  支持【选中】、【拖动】、【缩放】、【旋转】
- [ ]  支持框选多个元素
- [ ]  构建插件架构，为后续功能开发做准备
- [ ]  支持切换当前模式为svg
- [ ]  支持转化为svg进行绘制


##### v0.2.0版本
- [ ]  性能优化实践
- [ ]  交互优化，点击拖拽形成具体的绘制图形，绘制成功后恢复到无状态
- [ ]  增加橡皮擦功能
- [ ]  绘制的图形支持选中、拖动、缩放、旋转
- [ ]  支持转化为图片逻辑优化: 没有切割完整，还有大量空白的地方


#### 3.1.2 基于canvas的excel预览电子表格
