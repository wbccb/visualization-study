import Coordinate from "./Coordinate.js";
import {throttle} from "../util/utils.js";
import EventListener from "../util/eventListener.js";

/**
 * 封装通用方法，在这个类中进行canvas的初始化，然后将canvas传入到管理类中
 * 宽度和高度由domId的css对应的width和height控制
 */
class BaseCanvas extends EventListener {
  constructor(domId, isRenderImmediately = true) {
    super(domId);
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

    this.initListener();
  }

  initListener() {
    const forceRender = throttle(this.reRender, 0);
    // 注册滑动事件，由于有两个canvas，因此wheel事件注册在它们的parent上
    this.canvasDom.parentElement.addEventListener("wheel", (event) => {
      const {deltaX, deltaY} = event;
      const scrollX = this.state.scrollX;
      const scrollY = this.state.scrollY;

      console.info("wheel", deltaX, deltaY);

      this.state.scrollX = scrollX - deltaX;
      this.state.scrollY = scrollY - deltaY;

      // 滑动的同时要设置对应的
      // this.ctx.translate(this.state.scrollX, this.state.scrollY);

      console.info("最新的scrollX/scrollY", this.state.scrollX, this.state.scrollY);

      forceRender.call(this);
      this.emitEvent("wheelChange", {
        scrollX,
        scrollY,
      });
    });
  }

  getTouchCanvasPoint(event) {
    const scrollX = this.state.scrollX;
    const scrollY = this.state.scrollY;
    return this.coordinate.getTouchCanvasPoint(event, scrollX, scrollY);
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
    // 目前scrollX和scrollY都已经在点击中计算出来了，因此这里的x和y都是有偏移量scroll的值
    const {x, y, w, h} = data;
    this.ctx.save();
    const state = this.state;
    // this.ctx.translate(state.scrollX, state.scrollY);

    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();

    // 保存的都是没有scrollX和scrollY的值
    this.saveItem(id, "baseDrawRect", {
      x,
      y,
      w,
      h,
    });
  }

  getXYByScroll(x, y) {
    const scrollX = this.state.scrollX;
    const scrollY = this.state.scrollY;

    return [x + scrollX, y + scrollY];
    // return {
    //   x: x + scrollX,
    //   y: y + scrollY,
    // };
  }

  deleteItem(id) {
    if (!this.elements[id]) {
      // 不存在的话不用触发重绘
      return;
    }
    // 清除指定item
    delete this.elements[id];
    // 重绘其它元素
    this.reRender();
  }

  saveItem(id, type, data = {}) {
    // 存储的data={x,y}中的x和y应该是去除scrollX和scrollY的值
    data.x = data.x - this.state.scrollX;
    data.y = data.y - this.state.scrollY;
    this.elements[id] = {
      type: type,
      data: data,
    };
  }

  reRender() {
    // 清除所有画布
    this.clearCanvas();

    const keys = Object.keys(this.elements);
    for (const id of keys) {
      const {type, data} = this.elements[id];
      // 转化为最新scrollX和scrollY的值
      data.x = data.x + this.state.scrollX;
      data.y = data.y + this.state.scrollY;
      this[type](id, data);
    }
  }

  addEventListener(type, fn) {
    this.canvasDom.addEventListener(type, fn);
  }

  removeEventListener(type, fn) {
    this.canvasDom.removeEventListener(type, fn);
  }
}

export default BaseCanvas;
