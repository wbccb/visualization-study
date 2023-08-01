# Vue3 + Vite实现简单的白板

通过白板项目，熟练掌握canvas的常见场景编码，培养canvas坐标、滑动、放大缩小等综合性应用的开发能力，掌握常见的canvas优化方案

## 开发进度
- [x]  画布背景网格显示
- [x]  支持绘制矩形
- [x]  无限画布
- [x]  无限画布移动时能够正常重绘所有图形(scrollX和scrollY的修正)
- [ ]  支持绘制菱形、三角形、圆形、线段、箭头、自由画笔、文字、图片
- [ ]  绘制的图形支持拖动、缩放、旋转
- [ ]  支持放大缩小
- [ ]  性能优化实践
- [ ]  支持下载图片
- [ ]  支持转化为svg

## canvas文件夹

实现`canvas`的相关功能，包括背景网格、矩形、菱形、三角形、圆形、线段、箭头、自由画笔、文字、图片的相关封装

> 动画可以参考：https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Advanced_animations

## 其它文件

使用`vue3+vite`进行项目的UI构建，使用`canvas文件夹`作为核心库，在UI界面中进行切换展示`canvas`的相关功能，主要有：

- 基础功能展示
- 性能优化展示（未优化前和优化后的性能对比）


## 设计模式

> 可能涉及到下面这三种设计模式

- 装饰者模式
- 命令模式
- 访问者模式



## 问题总结

### wheel移动画布时，原点需不需要移动？移动后的绘制其它图形的坐标需不需要转化？

滑动画布后，会计算得出`scrollX`和`scrollY`值，然后绘制多种元素时，都进行整体的`translate(x+scrollX, y+scrollY)`

这样就不用每个坐标都进行叠加计算了

```js
x = x+scrollX
y = y+scrollY
```

### 绝对定位会导致wheel事件无法触发

去掉下面的`position: absolute`即可触发

```css
#canvas, #main {
    width: 600px;
    height: 600px;
    position: absolute;
    top: 0px;
    left: 0px;
    overflow: scroll;
}
```

## 性能优化
1. https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
2. 


# 参考
1. [我做了一个在线白板！](https://juejin.cn/post/7091276963146530847)
2. [LogicFlow](https://github.com/didi/LogicFlow)
3. [excalidraw](https://github.com/excalidraw/excalidraw)
4. [用 canvas 搞一个滑动刻度尺](https://juejin.cn/post/6962152799601688613)