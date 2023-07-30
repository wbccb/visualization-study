import Coordinate from "./Coordinate.js";

/**
 * 封装通用方法，在这个类中进行canvas的初始化，然后将canvas传入到管理类中
 * 宽度和高度由domId的css对应的width和height控制
 */
class BaseCanvas {
  constructor(domId, isRenderImmediately = true) {
    // 外部传入的canvas，为了所有元素都绘制在同一个canvas上面
    const canvasDom = document.getElementById(domId);
    if (!canvasDom) {
      console.error("document.getElmentById为空");
      return;
    }
    const ctx = canvasDom.getContext("2d");

    this.canvasDom = canvasDom;
    this.ctx = ctx;

    const {offsetWidth, offsetHeight} = canvasDom;
    this.width = offsetWidth;
    this.height = offsetHeight;

    this.state = {
      scale: 1,
      scrollX: 0,
      scrollY: 0,
    };
    this.coordinate = new Coordinate(this);

    if (isRenderImmediately) {
      //如果isRenderImmediately=false，那么renderCanvas可以在各自的管理类中进行管理
      this.renderCanvas();
    }

    // 所有绘制数据的管理，用于清除某一个数据进行重绘
    this.elements = [];
  }

  getTouchCanvasPoint(event) {
    return this.coordinate.getTouchCanvasPoint(event);
  }

  getCanvasDom() {
    return this.canvasDom;
  }

  renderCanvas() {
    const canvasDom = this.canvasDom;
    const ctx = this.ctx;

    const width = this.width;
    const height = this.height;
    const devicePixelRatio = window.devicePixelRatio;
    canvasDom.width = width * devicePixelRatio;
    canvasDom.height = height * devicePixelRatio;
    console.warn("目前得到的width和height", width, height);
    console.warn(
      "目前得到的canvasDom放大devicePixelRatio后",
      width * devicePixelRatio,
      height * devicePixelRatio,
    );
    // 如果<canvasDom>的宽度和高度是800px，那么乘以devicePixelRatio=2就会变成1600px
    // <canvasDom width=1600 height=1600>，那么整体会缩小0.5倍，为了适应800px的CSS限制
    // 2个物理像素就会填充1个CSS像素，会更加清晰，也就是2px（物理像素）= 1pt（CSS像素）
    // 但是带来的影响也就是所有绘制的东西都缩小了一半，因此我们得手动放大两倍
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  getContext() {
    return this.ctx;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getTouch() {}

  /**
   * 清除画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 封装ctx一系列操作，增强代码复用
   */
  baseDrawRect(id, data) {
    const {x, y, w, h} = data;
    this.ctx.strokeRect(x, y, w, h);

    this.saveItem(id, "baseDrawRect", {
      x,
      y,
      w,
      h,
    });
  }

  baseDrawCenterArc(id) {
    const width = this.width;
    const height = this.height;
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();
    this.ctx.arc(width / 2, height / 2, 2, 0, 2 * Math.PI, true);
    this.ctx.fillText("中心点", width / 2 + 5, height / 2 + 5);
    this.ctx.stroke();

    this.saveItem(id, "baseDrawCenterArc");
  }

  saveItem(id, type, data = {}) {
    this.elements[id] = {
      type: type,
      data: data,
    };
  }

  deleteItem(id) {
    if (!this.elements[id]) {
      // 不存在的话不用触发重绘
      return;
    }
    // 清除所有画布
    this.clearCanvas();
    // 清除指定item
    delete this.elements[id];
    // 重绘其它元素
    const keys = Object.keys(this.elements);
    for (const id of keys) {
      const {type, data} = this.elements[id];
      this[type](id, data);
    }
  }
}

export default BaseCanvas;
