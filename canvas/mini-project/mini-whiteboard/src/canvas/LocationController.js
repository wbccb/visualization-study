import BaseCanvas from "./base/BaseCanvas.js";
import {nanoid} from "nanoid";
import {throttle} from "./util/utils.js";
import {globalConfig} from "./config/config.js";

export const Status = {
  Rect: "绘制矩形",
  Diamond: "绘制菱形",
  PEN: "自由画笔",
  TEXT: "多行文字",
};

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class LocationController {
  constructor(baseCanvas, options = {}) {
    this.baseCanvas = baseCanvas;

    this.width = baseCanvas.width;
    this.height = baseCanvas.height;

    const ctx = this.baseCanvas.getContext();
    ctx.lineWidth = options.strokeStyle ? options.strokeStyle : 1;
    ctx.strokeStyle = options.strokeStyle ? options.strokeStyle : "#dfe0e1";
    ctx.fillStyle = options.fillStyle ? options.fillStyle : "#dfe0e1";

    this.ctx = ctx;

    this.status = options.status || Status.Rect;
    this.init();
    this.initListener();
  }

  init() {}

  initListener() {
    // 绘制矩形、菱形....
    // 记录目前点击的canvas坐标，注册pointermove和pointerup事件
    // pointermove：鼠标拖动计算出对应的位置，不断进行渲染，形成一种放大缩小的效果
    // pointerup: 绘制结束，注销两个事件

    this.initPointerdownEvent();
  }
  /**
   * 需要一个触发时机，比如点击了某一个矩形触发绘制功能
   */
  initPointerdownEvent() {
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
      console.warn("LocationController pointerDown");
      this.onPointDown(e);
    });
  }

  onPointDown(e) {
    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.addEventListener("pointermove", this.eventListenerPointerMove);
    canvasDom.addEventListener("pointerup", this.eventListenerPointerUp);
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

    if (this.status === Status.PEN) {
      const item = [x, y];
      this.baseCanvas.setDrawPenStartPoint([item]);
    } else if (this.status === Status.TEXT) {
      if (this.baseCanvas.isShowTextArea()) {
        // 当前正在绘制文本，你又点击触发了一次文本绘制
        // 延迟触发下一次绘制，先触发onBlur进行文本绘制，然后再触发你这次的文本绘制
        this.onPointUp();
        setTimeout(() => {
          this.onPointDown(e);
        }, 0);
        return;
      }
      const {distanceToMaxX, distanceToMaxY} = this.baseCanvas.getTouchBoundaryMaxRect(e);
      const data = {
        x: x,
        y: y,
        w: distanceToMaxX >= 100 ? 100 : distanceToMaxX - 10, // 如果distanceToMaxX很小，说明距离边界很近
        h: globalConfig.fontLineHeight, // lineHeight的高度
      };
      console.info("绘制文本的宽高", data.w, data.h);
      this.baseCanvas.baseStartDrawText(this.startPointId, data, () => {
        // 结束绘制文本
        this.onPointUp();
      });
    }
  }

  onPointMove(e) {
    const ctx = this.ctx;
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);

    const w = canvasPoint.x - this.startPoint.x;
    const h = canvasPoint.y - this.startPoint.y;

    // console.log(w, h);

    // TODO 如何清除之前画的？
    // 每次清除都要进行重绘
    // if (Math.abs(w) + Math.abs(h) > 0) {
    // console.log("onPointMove!!!!!!!!");
    this.baseCanvas.deleteItem(this.startPointId);
    let fn = this.baseCanvas.baseDrawRect;
    let data;
    switch (this.status) {
      case Status.Rect:
        fn = this.baseCanvas.baseDrawRect;
        data = {
          x: this.startPoint.x,
          y: this.startPoint.y,
          w,
          h,
        };
        break;
      case Status.Diamond:
        fn = this.baseCanvas.baseDrawDiamond;
        data = {
          x: this.startPoint.x,
          y: this.startPoint.y,
          w,
          h,
        };
        break;
      case Status.PEN:
        fn = this.baseCanvas.addDrawPenPoint;
        data = {
          x: canvasPoint.x,
          y: canvasPoint.y,
        };
        break;
      case Status.TEXT:
        fn = () => {};
        data = {};
        break;
    }

    fn.call(this.baseCanvas, this.startPointId, data, true);
    // }
  }

  onPointUp(e) {
    // TODO 监听鼠标滑动的事件
    console.log("pointerup!!!!!!!!");

    this.startPointId = undefined;
    this.startPoint = undefined;

    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.removeEventListener("pointermove", this.eventListenerPointerMove);
    canvasDom.removeEventListener("pointerup", this.eventListenerPointerUp);
  }

  changeStatus(status) {
    this.status = status;
  }

  clearAll() {
    this.baseCanvas.clearAll();
  }
}

export default LocationController;
