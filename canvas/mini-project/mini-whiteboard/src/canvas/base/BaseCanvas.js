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
  baseDrawRect(id, data, isTouch = false) {
    // 目前scrollX和scrollY都已经在点击中计算出来了，因此这里的x和y都是有偏移量scroll的值
    let {x, y, w, h, scrollX: lastScrollX, scrollY: lastScrollY} = data;
    this.ctx.save();
    const state = this.state;

    //TODO 为什么可以不用translate，坐标就是对的？？？
    // 答：saveItem()的时候我主动减去了scrollX!难道我这里拿到的x是有加上scrollX的？？
    // 最终答：因为坐标原点没有变化！我现在滑动后，是将坐标系translate然后重绘制，每次重绘制后都会restore
    // 因此我的坐标系的原点还是中央那个点！虽然我的画布偏移了！！！但是记住，我每次重绘制后都会restore
    // 坐标系还是原点啊，因此我绘制矩形时，手指触碰的位置还是用 clientX-left，而不用加上scrollX！因为坐标系都没变化！

    if (!isTouch) {
      console.warn("----- isTouch-----", lastScrollX, state.scrollX);
      console.warn("----- isTouch-----", lastScrollY, state.scrollY);
      // TODO 为啥去掉这一句就正常了？不去掉滑动时位置都重绘错误
      // x = x + lastScrollX - state.scrollX;
      // y = y + lastScrollY - state.scrollY;
    }

    // console.error("绘制矩形中x====", x, lastScrollX, state.scrollX);
    // console.info("绘制矩形中y====", y, lastScrollY, state.scrollY);
    // console.warn("不停绘制的差值是", lastScrollY - state.scrollY);
    // console.warn("不停绘制的差值是", data.scrollY - state.scrollY);

    // Coordinate.js不减去scrollX和scrollY
    // 这里不translate(scrollX, scrollY)
    // 那么就一切正常！
    console.warn("----- ctx.translate-----", state.scrollX, state.scrollY);
    this.ctx.translate(state.scrollX, state.scrollY);

    //TODO 那存储该如何存储？？不能存储没有scrollX的坐标吧？？

    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();

    // 此时的x和y都是加上偏移量scrollX和scrollY的
    this.saveItem(id, "baseDrawRect", {
      x,
      y,
      w,
      h,
      scrollX: state.scrollX,
      scrollY: state.scrollY,
    });
  }

  baseDrawDiamond(id, data) {
    const ctx = this.ctx;
    const {x, y, w, h} = data;
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = "2px";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.restore();
    this.saveItem(id, "baseDrawDiamond", {
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
    data.x = data.x;
    data.y = data.y;
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
      data.x = data.x;
      data.y = data.y;
      this[type](id, data, false);
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
