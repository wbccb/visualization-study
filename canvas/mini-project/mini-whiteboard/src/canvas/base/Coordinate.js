/**
 * 对触摸点的坐标进行转化，因为我们可能会移动画布，因此需要根据scroll进行canvas坐标的转化
 */
class Coordinate {
  constructor(baseCanvas) {
    this.baseCanvas = baseCanvas;
  }

  getTouchCanvasPoint(event, canvasScrollX, canvasScrollY) {
    const {clientX, clientY} = event;
    // canvas可能不是以左上角开始绘制的，因此还得减去canvas的top和left
    const {x, y, top, left} = this.baseCanvas.getCanvasDom().getBoundingClientRect();
    const {offsetLeft, offsetTop} = this.baseCanvas.getCanvasDom();
    // const {offsetLeft, offsetTop} = this.baseCanvas.getCanvasDom();
    // canvas可能还会滑动，因此得减去scrollX和scrollY

    // console.warn("=====================================");
    // console.error("top", top, left);
    // console.error("offsetLeft", offsetTop, offsetLeft);
    // console.error("canvasScrollY", canvasScrollX, canvasScrollY);
    // console.error("最终点击的canvas坐标", clientX - left, clientY - top);
    // console.warn("=====================================");

    // console.error("offsetTop", offsetTop, offsetLeft);

    console.warn("----- getTouchEvent-----", canvasScrollX, canvasScrollY);
    return {
      x: clientX - left - canvasScrollX,
      y: clientY - top - canvasScrollY,
    };
  }

  getTouchX(event) {}

  getTouchY() {}
}

export default Coordinate;
