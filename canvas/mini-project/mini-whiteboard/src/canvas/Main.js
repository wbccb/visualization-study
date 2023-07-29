import BaseCanvas from "./base/BaseCanvas.js";
import {nanoid} from "nanoid";

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class Main {
  constructor(baseCanvas, options = {}) {
    this.baseCanvas = baseCanvas;

    this.width = baseCanvas.width;
    this.height = baseCanvas.height;

    const ctx = this.baseCanvas.getContext();
    ctx.lineWidth = options.strokeStyle ? options.strokeStyle : 1;
    ctx.strokeStyle = options.strokeStyle ? options.strokeStyle : "#dfe0e1";
    ctx.fillStyle = options.fillStyle ? options.fillStyle : "#dfe0e1";

    this.ctx = ctx;
    this.init();
    this.initListener();
  }

  init() {
    const ctx = this.ctx;
    const width = this.baseCanvas.getWidth();
    const height = this.baseCanvas.getHeight();
    // 将画布中心移动到canvas的中心为止
    // 显示原点坐标
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 2, 0, 2 * Math.PI, true);
    ctx.fillText("中心点", width / 2 + 5, height / 2 + 5);
    ctx.stroke();
  }

  initListener() {
    // 绘制矩形、菱形....
    // 记录目前点击的canvas坐标，注册pointermove和pointerup事件
    // pointermove：鼠标拖动计算出对应的位置，不断进行渲染，形成一种放大缩小的效果
    // pointerup: 绘制结束，注销两个事件

    this.startDrawRect();
  }

  /**
   * 需要一个触发时机，比如点击了某一个矩形触发绘制功能
   */
  startDrawRect() {
    function throttle(fn, wait = 10) {
      // wait限制过大会导致画rect时显得很卡顿
      let time = new Date().getTime();
      const that = this;
      return function (...args) {
        // return (...args) => {  // 箭头函数的this依赖于上一层，因此这里的fn.call(this, ...args)就是throttle的this
        const currentTime = new Date().getTime();
        if (currentTime - time > wait) {
          fn.call(this, ...args);
          time = currentTime;
        }
      };
    }

    const fn = throttle(this.onPointMove);
    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.addEventListener("mousedown", (e) => {
      this.onPointDown(e);
    });
    canvasDom.addEventListener("mousemove", (e) => {
      if (!this.startPointId) return;
      fn.call(this, e); // 相当于this.fn而不是window.fn
    });
    canvasDom.addEventListener("mouseup", (e) => {
      this.onPointUp(e);
    });
  }

  onPointDown(e) {
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);
    console.log("pointerdown!!!!!!!!");

    this.startPoint = {
      x: canvasPoint.x,
      y: canvasPoint.y,
    };
    this.startPointId = nanoid(); //=> "V1StGXR8_Z5jdHi6B-myT"
  }

  onPointMove(e) {
    const ctx = this.ctx;
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);

    const w = canvasPoint.x - this.startPoint.x;
    const h = canvasPoint.y - this.startPoint.y;

    // TODO 如何清除之前画的？
    // 每次清除都要进行重绘
    if (Math.abs(w) + Math.abs(h) > 5) {
      console.log("onPointMove!!!!!!!!");
      this.baseCanvas.deleteItem(this.startPointId); // 清除画布
      this.baseCanvas.baseDrawRect(this.startPointId, this.startPoint.x, this.startPoint.y, w, h);
    }
  }

  onPointUp(e) {
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);
    console.log("pointerup!!!!!!!!");

    this.startPointId = undefined;
    this.startPoint = undefined;
  }
}

export default Main;
