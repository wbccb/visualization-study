# canvas基础知识

2d绘图功能

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
ctx
```

