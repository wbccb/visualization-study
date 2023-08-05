import BaseCanvas from "./base/BaseCanvas.js";
import {nanoid} from "nanoid";
import {throttle} from "./util/utils.js";
import {EventType, globalConfig, HTMLEventType} from "./config/config.js";
import EventListener from "./util/eventListener.js";
import {ElMessage} from "element-plus";
import {initData} from "./config/mockInitData.js";

export const Status = {
  NO: "无状态",
  Rect: "绘制矩形",
  Diamond: "绘制菱形",
  PEN: "自由画笔",
  TEXT: "多行文字",
  IMAGE: "点击上传图片并绘制",
};

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class LocationController extends EventListener {
  constructor(baseCanvas, options = {}) {
    super("LocationController");
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
    this.initMockData();
  }

  init() {}

  initListener() {
    // 绘制矩形、菱形....
    // 记录目前点击的canvas坐标，注册pointermove和pointerup事件
    // pointermove：鼠标拖动计算出对应的位置，不断进行渲染，形成一种放大缩小的效果
    // pointerup: 绘制结束，注销两个事件

    this.initPointerdownEvent();
  }

  initMockData() {
    this.baseCanvas.setData(initData);
    this.baseCanvas.reRender();
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
    } else if (this.status === Status.IMAGE) {
      if (this.drawImageFirstClick) {
        this.drawImageFirstClick = false;
        return;
      }

      // 点击时将图片绘制到canvas上，没点击之前是可以进行拖动的
      const imageData = this.baseCanvas.getBase64Image();
      if (!imageData) {
        alert("图片为空");
        return;
      }
      const data = {
        x: x,
        y: y,
        imageData: imageData,
      };
      this.baseCanvas.baseDrawImage(this.startPointId, data);

      // 停止监听
      this.baseCanvas.canvasDom.removeEventListener("pointermove", this.eventListenerPointerMove);
      this.baseCanvas.canvasDom.removeEventListener("pointerup", this.eventListenerPointerUp);
      // 取消目前的图片选中状态
      this.emit(EventType.STATUS_CHANGE);
    }
  }

  onPointMove(e) {
    e.preventDefault();
    const ctx = this.ctx;
    // TODO 监听鼠标滑动的事件
    const canvasPoint = this.baseCanvas.getTouchCanvasPoint(e);

    const w = canvasPoint.x - this.startPoint.x;
    const h = canvasPoint.y - this.startPoint.y;

    // console.log(w, h);

    // TODO 如何清除之前画的？
    // 每次清除都要进行重绘
    console.log("onPointMove!!!!!!!!");
    this.baseCanvas.deleteItem(this.startPointId);
    let fn;
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
      case Status.IMAGE:
        fn = (id, data) => {
          const {x, y} = data;
          this.baseCanvas.baseUpdateDrawImage(x, y);
        };
        data = {
          x: canvasPoint.x,
          y: canvasPoint.y,
        };
        break;
    }

    if (!fn) {
      return;
    }
    fn.call(this.baseCanvas, this.startPointId, data, true);
  }

  onPointUp(e) {
    // TODO 监听鼠标滑动的事件
    console.log("pointerup!!!!!!!!");

    this.startPointId = undefined;
    this.startPoint = undefined;

    const canvasDom = this.baseCanvas.getCanvasDom();
    canvasDom.removeEventListener("pointermove", this.eventListenerPointerMove);
    canvasDom.removeEventListener("pointerup", this.eventListenerPointerUp);

    // TODO 后期应该设计成点击某一个就为某一种状态，然后绘制成功后就恢复到没有状态的情况
  }

  changeStatus(status) {
    this.status = status;

    if (status === Status.IMAGE) {
      // TODO 不能单纯监听canvas事件，必须扩大范围
      this.baseCanvas.canvasDom.addEventListener("pointermove", this.eventListenerPointerMove);
      this.baseCanvas.canvasDom.addEventListener("pointerup", this.eventListenerPointerUp);
      this.drawImageFirstClick = true;

      this.baseCanvas.baseStartDrawImage(() => {
        // 取消图片触发的回调
        this.emitEvent(EventType.STATUS_CHANGE);
      });
    }
  }

  clearAll() {
    this.baseCanvas.clearAll();
  }

  setScale(scale) {
    this.baseCanvas.setScale(scale);
  }
}

export default LocationController;
