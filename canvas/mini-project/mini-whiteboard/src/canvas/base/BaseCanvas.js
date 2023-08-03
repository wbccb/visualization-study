import CoordinateHelper from "./CoordinateHelper.js";
import {throttle} from "../util/utils.js";
import EventListener from "../util/eventListener.js";
import {nanoid} from "nanoid";
import TextHelper from "./TextHelper.js";

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
    this.coordinateHelper = new CoordinateHelper(this);
    this.textHelper = new TextHelper(this);

    if (isRenderImmediately) {
      //如果isRenderImmediately=false，那么renderCanvas可以在各自的管理类中进行管理
      this.renderCanvas();
    }

    // 所有绘制数据的管理，用于清除某一个数据进行重绘
    this.elements = {};

    this.initListener();
  }

  initListener() {
    const forceRender = throttle(this.reRender, 0);
    // 注册滑动事件，由于有两个canvas，因此wheel事件注册在它们的parent上
    this.canvasDom.parentElement.addEventListener("wheel", (event) => {
      const {deltaX, deltaY} = event;
      const oldScrollX = this.state.scrollX;
      const oldScrollY = this.state.scrollY;

      // console.info("wheel", deltaX, deltaY);

      this.state.scrollX = oldScrollX - deltaX;
      this.state.scrollY = oldScrollY - deltaY;

      // 滑动的同时要设置对应的
      // this.ctx.translate(this.state.scrollX, this.state.scrollY);

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
    return this.coordinateHelper.getTouchCanvasPoint(event, scrollX, scrollY);
  }

  getTouchBoundaryMaxRect(event) {
    return this.coordinateHelper.getTouchBoundaryMaxRect(event);
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

  /**
   * 清除画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  clearAll() {
    this.elements = {};
    this.reRender();
  }

  /**
   * 封装ctx一系列操作，增强代码复用
   */
  baseDrawRect(id, data, isTouch = false) {
    // 目前scrollX和scrollY都已经在点击中计算出来了，因此这里的x和y都是有偏移量scroll的值
    let {x, y, w, h, scrollX: lastScrollX, scrollY: lastScrollY} = data;
    this.ctx.save();
    const state = this.state;

    // 我去！！！你要记住一件事，你下面是要this.ctx.translate(state.scrollX, state.scrollY)
    // 因此你的rect可以恢复到没有scrollX的位置啊啊啊啊！！也就是x和y一直都不变！！！！！然后原点translate即可！！！啊啊啊啊
    // 其它也是这样啊！！！！无论如何滑动，绘制时的x和y都是一样的，我们只操作ctx.translate！！！

    this.ctx.translate(state.scrollX, state.scrollY);

    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.restore();

    // 此时的x和y都是相对坐标，无论如何偏移，x和y都是一样的
    // 因为我们每次都ctx.translate(state.scrollX, state.scrollY)
    // 因此不用考虑偏移量
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
    const state = this.state;
    const {x, y, w, h} = data;
    ctx.save();
    ctx.translate(state.scrollX, state.scrollY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = "2px";
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y - h / 2);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    this.saveItem(id, "baseDrawDiamond", {
      x,
      y,
      w,
      h,
    });
  }

  setDrawPenStartPoint(data) {
    this.penDataArray = data;
  }

  addDrawPenPoint(id, data) {
    const {x, y} = data;
    const len = this.penDataArray.length;
    const [lastX, lastY] = this.penDataArray[len - 1];

    const distance = Math.abs(x - lastX) + Math.abs(y - lastY);
    if (distance > 5) {
      // 稀释点位，不然会非常非常多，绘制的时候要时刻触发，不然会有闪闪的情况
      // 虽然我们绘制的时候很多时候都是同样数据绘制一次，但是感官比较流畅
      this.penDataArray.push([x, y]);
    }
    // 触发自由画笔绘制
    this.baseDrawPen(id, this.penDataArray);
  }

  baseDrawPen(id, array) {
    const [firstPointX, firstPointY] = array[0];
    const ctx = this.ctx;
    const state = this.state;

    ctx.save();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.translate(state.scrollX, state.scrollY);
    ctx.beginPath();
    ctx.moveTo(firstPointX, firstPointY);
    // 点效率太低，直接线
    for (let i = 1; i < array.length; i++) {
      const [x, y] = array[i];
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();
    this.saveItem(id, "baseDrawPen", this.penDataArray);
  }

  /**
   * 开发步骤：
   * 1. 实现基础功能
   * 2. 进行架构设计
   * 3. 完善架构中多行文本的处理
   */
  baseStartDrawText(id, data, finishDrawTextFn) {
    const {x, y, w, h} = data;
    const ctx = this.ctx;

    this.textHelper.showTextArea(x, y, w, h, (textAreaValue) => {
      // onblur时回调该方法，进行canvas的绘制
      data.textAreaValue = textAreaValue;
      this.baseDrawText(id, data);
      finishDrawTextFn && finishDrawTextFn();
    });
  }

  isShowTextArea() {
    return this.textHelper.isShowTextArea();
  }

  // TODO 绘制文本
  baseDrawText(id, data) {
    const {x, y, w, h, textAreaValue} = data;
    const ctx = this.ctx;
    // 1.点击位置后，使用document.createElement("textArea")，然后根据点击的位置，设置width+height+border+innerText
    // 2.还要判断是否是距离canvasWidth边缘地方，进行换行操作（在外部传入w和h时已经做判断了！）

    // TODO 3.失去焦点后，我们要将textArea的内容绘制到canvas上面，使用context.fillText()

    // TODO (这个放在后面选中做)4.再次点击时，检测是否命中该text，获取到该text的内容，然后放入到textArea中

    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "12px";
    ctx.textBaseline = "ideographic";
    const value = textAreaValue;
    // TODO 切割为多行文字，然后偏移y进行绘制
    ctx.fillText(value, x, y);
    ctx.restore();

    this.saveItem(id, "baseDrawText", data);
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
    this.elements[id] = {
      type: type,
      data: data,
    };
    if (!window.test) {
      window.test = {};
    }
    if (!window.test[id]) {
      window.test[id] = [JSON.stringify(data)];
    } else {
      window.test[id].push(JSON.stringify(data));
    }
  }

  reRender() {
    // 清除所有画布
    this.clearCanvas();

    const keys = Object.keys(this.elements);
    for (const id of keys) {
      const {type, data} = this.elements[id];
      // data携带scrollX以及已经加上scrollX的x和y
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
