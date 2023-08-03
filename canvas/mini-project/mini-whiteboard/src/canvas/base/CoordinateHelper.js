import {ElMessage} from "element-plus";

/**
 * 对触摸点的坐标进行转化，因为我们可能会移动画布，因此需要根据scroll进行canvas坐标的转化
 */
class CoordinateHelper {
  constructor(baseCanvas) {
    this.baseCanvas = baseCanvas;
  }

  getTouchCanvasPoint(event, canvasScrollX, canvasScrollY) {
    const {clientX, clientY} = event;
    // canvas可能不是以左上角开始绘制的，因此还得减去canvas的top和left
    const {x, y, top, left} = this.baseCanvas.getCanvasDom().getBoundingClientRect();
    const {offsetLeft, offsetTop} = this.baseCanvas.getCanvasDom();

    const infoX = clientX - left - canvasScrollX;
    const infoY = clientY - top - canvasScrollY;
    // ElMessage.info({
    //   message: "点击的坐标是" + infoX + "," + infoY,
    // });

    // 经过调试可以知道！infoX和infoY计算出来的是相对坐标，也就是无论如何偏移！
    // infoX和infoY的值都是一样的啊！！！！！
    // 比如没有偏移时,x=100,y=100
    // 偏移了，点击坐标系的(100, 100)得到的x和y也是(100, 100)

    return {
      x: clientX - left - canvasScrollX,
      y: clientY - top - canvasScrollY,
    };
  }

  getTouchBoundaryMaxRect(event) {
    const {clientX, clientY} = event;
    const {top, left} = this.baseCanvas.getCanvasDom().getBoundingClientRect();

    const touchDx = clientX - left;
    const touchDy = clientY - top;

    return {
      maxWidth: this.baseCanvas.width - touchDx,
      maxHeight: this.baseCanvas.height - touchDy,
    };
  }

  getTouchX(event) {}

  getTouchY() {}
}

export default CoordinateHelper;
