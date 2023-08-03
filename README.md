# web2D、web3D电子书


## 项目目标

1. 学习`canvas`、`webGL`、`threeJS`、`webGIS`基础知识
2. 实战相关的应用

## 项目文件说明

### canvas
1. canvas基础知识：docs和demo
2. canvas常见应用：mini-project（比如富文本，比如表格）
> 开源库[G2](https://github.com/antvis/G2) 学习以及尝试参与issues修复

### three.js
1. three.js基础知识：docs和demo
2. three.js常见应用：mini-project（比如高德地图上叠加路线）
> 尝试自研three.js实现多种数据源的3D构建和2D构建

### webGL
1. webGL基础知识：docs和demo


## 目前正在做的事情

### canvas

```shell
cd canvas 
npm install 
npm run docs:dev
```

#### Vue3 + Vite实现简单的白板

通过白板项目，熟练掌握canvas的常见场景编码，培养canvas坐标、滑动、放大缩小等综合性应用的开发能力，掌握常见的canvas优化方案

开发进度：
- [x]  画布背景网格显示
- [x]  支持绘制矩形
- [x]  无限画布
- [x]  无限画布移动时能够正常重绘所有图形(scrollX和scrollY的修正)
- [x]  支持绘制菱形
- [x]  支持绘制自由画笔
- [ ]  支持绘制文字
- [ ]  支持绘制图片
- [ ]  绘制的图形支持选中、拖动、缩放、旋转
- [ ]  支持整体画布放大缩小
- [ ]  性能优化实践
- [ ]  支持下载图片
- [ ]  支持转化为svg