/**
 * 对触摸点的坐标进行转化，因为我们可能会移动画布，因此需要根据scroll进行canvas坐标的转化
 */
class Coordinate {
  constructor(baseCanvas) {
    this.baseCanvas = baseCanvas;
  }

  getTouchCanvasPoint(event) {
    const {offsetX, offsetY, clientX, clientY} = event;
    // canvas可能不是以左上角开始绘制的，因此还得减去canvas的top和left
    const {x, y, top, left} = this.baseCanvas.getCanvasDom().getBoundingClientRect();
    // const {offsetLeft, offsetTop} = this.baseCanvas.getCanvasDom();
    // canvas可能还会滑动，因此得减去scrollX和scrollY

    console.error("top", top, left);
    // console.error("offsetTop", offsetTop, offsetLeft);

    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  getTouchX(event) {}

  getTouchY() {}
}

export default Coordinate;
