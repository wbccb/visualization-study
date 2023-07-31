import BaseCanvas from "./base/BaseCanvas.js";
import {nanoid} from "nanoid";

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

    this.baseCanvas.onEvent("wheelChange", ({scrollX, scrollY}) => {
      this.render();
    });

    this.render();
  }

  render() {
    // 初始化或者滑动时触发全部重新绘制
    // 先进行translate
    // 然后再根据原来的坐标进行绘制
    this.baseCanvas.clearCanvas();
    // 绘制网格
    this.renderHorizontal();
    this.renderVertical();
    // 绘制坐标系
    this.renderCoordinateAxis();
    // 绘制原点
    this.renderCenter();
  }

  /**
   * 绘制坐标轴，可以方便进行坐标调试和滑动效果查看
   */
  renderCoordinateAxis() {
    const arrowSize = 10;
    const space = 20;

    const width = this.width;
    const height = this.height;

    const x0 = 0;
    const y0 = 0;

    // 计算坐标系的原点坐标

    // 计算坐标系x轴的最远坐标点以及对应三角形的坐标点

    // 计算坐标系y轴的最远坐标点以及对应三角形的坐标点
  }

  renderCenter() {
    // 显示原点坐标
    const width = this.width;
    const height = this.height;
    const ctx = this.baseCanvas.ctx;
    const state = this.baseCanvas.state;

    ctx.save();

    ctx.translate(state.scrollX, state.scrollY);

    ctx.strokeStyle = "blue";
    ctx.beginPath();

    // const [arcX, arcY] = this.getXYByScroll(width / 2, height / 2);
    const [arcX, arcY] = [width / 2, height / 2];
    ctx.arc(arcX, arcY, 2, 0, 2 * Math.PI, true);

    // const [textX, textY] = this.getXYByScroll(width / 2 + 5, height / 2 + 5);
    const [textX, textY] = [width / 2 + 5, height / 2 + 5];
    ctx.fillText("中心点", textX, textY);

    ctx.stroke();

    // this.saveItem(id, "baseDrawCenterArc");
    ctx.restore();
  }

  renderHorizontal() {
    const w = this.width;
    const h = this.height;
    const ctx = this.baseCanvas.getContext();
    const state = this.baseCanvas.state;
    const gridSize = this.size;
    console.error("绘制网格", this.width, this.height);
    console.error("h / 2", h / 2);

    ctx.save();
    ctx.translate(state.scrollX, state.scrollY);

    for (let j = 0; j <= h; j = j + gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  renderVertical() {
    const w = this.width;
    const h = this.height;
    const ctx = this.baseCanvas.getContext();
    const gridSize = this.size;
    const state = this.baseCanvas.state;

    ctx.save();
    ctx.translate(state.scrollX, state.scrollY);

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
    ctx.restore();
  }
}

export default Grid;
