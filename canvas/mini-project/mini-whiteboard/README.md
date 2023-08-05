# Vue3 + Vite实现简单的白板

通过白板项目，熟练掌握canvas的常见场景编码，培养canvas坐标、滑动、放大缩小等综合性应用的开发能力，掌握常见的canvas优化方案

## 开发进度
- [x]  画布背景网格显示
- [x]  支持绘制矩形
- [x]  无限画布
- [x]  无限画布移动时能够正常重绘所有图形(scrollX和scrollY的修正)
- [x]  支持绘制菱形
- [x]  支持绘制自由画笔
- [x]  支持绘制多行文字
- [x]  支持绘制图片
- [x]  支持整体画布放大缩小
- [ ]  绘制的图形支持选中、拖动、缩放、旋转
- [ ]  支持框选多个元素，进行移动、旋转: 借鉴下LogicFlow的Selection插件
- [ ]  支持转化为图片下载

- [ ]  性能优化实践

- [ ]  支持切换当前模式为svg
- [ ]  支持转化为svg进行绘制

- [ ]  交互优化，点击拖拽形成具体的绘制图形，绘制成功后恢复到无状态
- [ ]  增加橡皮擦功能


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

### 绘制文本

- 输入框改变文本后如何位置后，使用统一的fontStyle以及textBaseline="top"进行canvas的绘制
- 多行文本利用textArea+div的宽度比较进行换行符插入，然后利用换行符进行切割，利用y+lineHeight作为偏移量进行每一行文字的绘制
- 绘制textarea的宽度根据div+textarea的宽度比较进行换行符的插入（自动换行）
- 绘制textarea的高度根据换行符进行高度的lineHeight增加（自动调整高度）
- wheel移动画板的时候直接让textarea失去焦点，进行绘制
- （TODO）复制黏贴文本时如何自动实现换行


### 绘制图片

- 点击上传图片，解析得到图片内容
- 鼠标没有点击之前，图片已经绘制成功，跟随鼠标移动进行图片的移动
- 鼠标点击时，触发图片的canvas的绘制功能，div装载的图片进行销毁
- (TODO) 拖拽卡顿
- (TODO) 从按钮点击后触发拖拽功能，如何触发canvas.pointerMove事件


### 整体放大缩小

- 整体缩放时，所有值都应该进行`scale`比例的放大或者缩小
- 放大缩小后移动的距离还是原来的值，比如你稍微滑动是scrollX+1px，现在滑动也是scrollX+1px
- 在`baseCanvas.setScale()`中进行所有数据的`scale`比例的放大或者缩小，包括scrollX、scrollY、各种元素的x、y、w、h等等
- 在`baseCanvas.setScale()`处理后，其它代码逻辑就不用改变

### 元素选中



## 性能优化
1. https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas


# 参考
1. [我做了一个在线白板！](https://juejin.cn/post/7091276963146530847)
2. [LogicFlow](https://github.com/didi/LogicFlow)
3. [excalidraw](https://github.com/excalidraw/excalidraw)
4. [用 canvas 搞一个滑动刻度尺](https://juejin.cn/post/6962152799601688613)