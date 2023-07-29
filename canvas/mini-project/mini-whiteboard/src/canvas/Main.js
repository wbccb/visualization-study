import BaseCanvas from "./base/BaseCanvas.js";

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
}

export default Main;
