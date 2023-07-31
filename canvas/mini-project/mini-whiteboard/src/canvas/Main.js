import BaseCanvas from "./base/BaseCanvas.js";
import {nanoid} from "nanoid";
import {throttle} from "./util/utils.js";

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

  init() {}

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
    const fn = throttle(this.onPointMove);
    const canvasDom = this.baseCanvas.getCanvasDom();

    // 指针函数的this绑定后无法改变
    this.eventListenerPointerMove = (e) => {
      if (!this.startPointId) return;
      fn.call(this, e); // 相当于this.fn而不是window.fn
    };

    this.eventListenerPointerUp = (e) => {
      this.onPointUp(e);
    };

    canvasDom.addEventListener("pointerdown", (e) => {
      console.warn("Main pointerDown");
      canvasDom.addEventListener("pointermove", this.eventListenerPointerMove);
      canvasDom.addEventListener("pointerup", this.eventListenerPointerUp);
      this.onPointDown(e);
    });
  }

  onPointDown(e) {
    // getTouchCanvasPoint()不加scrollX和scrollY
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);
    console.log("pointerdown!!!!!!!!");
    const {x, y} = canvasPoint;

    this.startPoint = {
      x,
      y,
    };
    this.startPointId = nanoid(); //=> "V1StGXR8_Z5jdHi6B-myT"
    console.error("新的id", this.startPointId);
  }

  onPointMove(e) {
    const ctx = this.ctx;
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);

    const w = canvasPoint.x - this.startPoint.x;
    const h = canvasPoint.y - this.startPoint.y;

    console.log(w, h);

    // TODO 如何清除之前画的？
    // 每次清除都要进行重绘
    if (Math.abs(w) + Math.abs(h) > 5) {
      console.log("onPointMove!!!!!!!!");
      this.baseCanvas.deleteItem(this.startPointId);
      this.baseCanvas.baseDrawRect(this.startPointId, {
        x: this.startPoint.x,
        y: this.startPoint.y,
        w,
        h,
      });
    }
  }

  onPointUp(e) {
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);
    console.log("pointerup!!!!!!!!");

    this.startPointId = undefined;
    this.startPoint = undefined;

    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.addEventListener("pointermove", this.eventListenerPointerMove);
    canvasDom.addEventListener("pointerup", this.eventListenerPointerUp);
  }
}

export default Main;
