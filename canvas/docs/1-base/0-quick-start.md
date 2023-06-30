# canvas基础知识

2d绘图功能，绘图步骤主要为：
- 建立canvas画布
- 通过canvas画布获取上下文对象，可以认为是画笔
- 设置画笔颜色
- 设置图形形状
- 绘制图形

> 尺寸不能设置太大，尽量控制在4000之内，尺寸的极限值会因为浏览器、平台的不同而不同


## canvas与svg的对比

- svg: 矢量图形，基于XML，缩放不失真；支持鼠标事件，交互方便，不适合图形数量较多的场景
- canvas: 位图，缩放失真，鼠标事件只能通过canvas接收，其内部图形无法接收，适合图形数量较多的场景

> 注：当canvas数量太大的适合，也会造成卡顿，这个适合只能选择`WebGL`，`WebGL`是另外一套逻辑了

## 设置width和height

当没有手动设置时，`canvas`默认宽度是`300px`，高度是`150px`

直接在`html`上设置`width`和`height`
```js
<canvas id="app" width="700" height="300"></canvas>
```

使用js设置`width`和`height`
```js
const canvas = document.getElementById("app");
canvas.width = 700;
canvas.height = 399;
```

## canvas上下文对象

> 可以认为就是在`canvas`上绘画的画笔！

```js
const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "blue";
ctx.fillRect(100, 100, 200, 200);
```

## canvas画布的坐标系和栅格系统

1. canvas的坐标系是以像素的宽度为基底的，一个格子就是一个像素，一个像素具有`rgba`数据
2. canvas画图的像素的数量等于画布的宽度乘以高度
3. x轴以原点为基础，右边的值越来越大
4. y轴以原点为基础，下边的值越来越大




## 填充矩形 && 描边矩形 && 清除矩形

### 填充矩形

```js
ctx.fillRect(x, y, w, h)
```

### 描边矩形

```js
ctx.lineWidth = 20; // 描边宽度
ctx.strokeStyle = "red"; // 描边颜色
ctx.strokeRect(x, y, w, h); // 绘制描边

ctx.lineWidth = 3; // 描边宽度
ctx.strokeStyle = "#00000"; // 描边颜色
ctx.strokeRect(x, y, w, h); // 绘制描边
```

### 清理矩形

只会清除描边的内描边 + 填充矩形
```js
ctx.clearRect(x, y, w, h);
```




## 绘制路线


```js
ctx.beginPath();
ctx.move(100, 100);
ctx.lineTo(400, 100); // 绘制边
ctx.lineTo(400, 300); // 绘制边
ctx.closePath(); // 闭合路线
ctx.stroke();
```

1. 建立第一条路径：`beginPath()`
2. 建立子路径，设置起点：`moveTo(x, y)`，不然两条子路径会连接在一起
3. 显示路径：填充`fill()` 或者 描边`stroke()`
4. 闭合路径(与moveTo的起点连接起来)：`closePath()`
5. 建立第二条路径，清空第一条路径：`beginPath()`

主要分为：
1. 绘制直线
2. 绘制圆弧 
3. 绘制切线圆弧
4. 绘制二次贝塞尔曲线
5. 绘制三次贝塞尔曲线
6. 绘制矩形

> 具体可以查看`demo/canvas-01-quick-start.html`


