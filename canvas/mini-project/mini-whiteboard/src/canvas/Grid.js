import BaseCanvas from "./base/BaseCanvas.js";

/**
 * 将BaseCanvas对象传入，使用BaseCanvas.xxx提供的通用方法进行业务开发
 */
class Grid {
  constructor(baseCanvas, options = {}) {
    this.baseCanvas = baseCanvas;
    this.options = options; // 包含网格的格子大小
    this.size = options.size;

    this.width = baseCanvas.getWidth();
    this.height = baseCanvas.getHeight();

    const ctx = this.baseCanvas.getContext();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#dfe0e1";

    this.renderHorizontal();
    this.renderVertical();
  }

  renderHorizontal() {
    const w = this.width;
    const h = this.height;
    const ctx = this.baseCanvas.getContext();
    const gridSize = this.size;
    console.error("绘制网格", this.width, this.height);
    console.error("h / 2", h / 2);

    for (let j = 0; j <= h; j = j + gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.closePath();
      ctx.stroke();
    }
  }

  renderVertical() {
    const w = this.width;
    const h = this.height;
    const ctx = this.baseCanvas.getContext();
    const gridSize = this.size;
    for (let i = 0; i <= w; i = i + gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      // TODO 实现刻度尺，方便比对坐标，现在rect画出来的坐标都不对
      // if (i % (4 * gridSize) === 0) {
      //   ctx.save();
      //   ctx.beginPath();
      //   ctx.arc(i, 0, 2, 0, 2 * Math.PI, false);
      //   ctx.fillText(`(${i},0)`, i, 10);
      //   ctx.closePath();
      //   ctx.restore();
      // }
      ctx.lineTo(i, h);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

export default Grid;
