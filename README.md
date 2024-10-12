# 可视化相关

## 1. 目前正在做的事情

### 1.1 canvas

相关文档：基础、进阶、难点总结
```shell
cd canvas/docs 
npm install 
npm run docs:dev
```

#### 1.1.1 Vue3 + Vite实现简单的白板

通过[白板项目](https://github.com/wbccb/canvas-web3D/tree/main/canvas/mini-project/mini-whiteboard)，熟练掌握canvas的常见场景编码，培养canvas坐标、滑动、放大缩小等综合性应用的开发能力，掌握常见的canvas优化方案

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
- [ ]  svg模式支持【选中】、【拖动】、【缩放】、【旋转】


##### v0.2.0版本
- [ ]  性能优化实践
- [ ]  交互优化，点击拖拽形成具体的绘制图形，绘制成功后恢复到无状态
- [ ]  增加橡皮擦功能
- [ ]  支持转化为图片逻辑优化: 没有切割完整，还有大量空白的地方

### 1.2 richText

[基于TipTap的富文本编辑器](https://github.com/wbccb/visualization-study/tree/main/richText)
