import {calculatePointAfterRotateAngle, calculateWidthAndHeight, radianToAngle} from "./math.ts";

class Transform {

  nodeModel: Record<string, any>;
  props: Record<string, any>;

  constructor(props: Record<string, any>) {
    this.props = props;
    this.nodeModel = props.nodeModel;
  }

  getRotateResize({index, pct, resize}: {
    index: number;
    pct: number;
    resize: { deltaX: number; deltaY: number; width: number; height: number }
  }) {
    const {deltaX, deltaY, width: oldWidth, height: oldHeight} = resize;
    const {rotate, x: downCenterX, y: downCenterY} = this.nodeModel;
    const angle = radianToAngle(rotate);

    const {x: propsX, y: propsY} = this.props;
    // 从原来的中心点 oldCenter和一开始的触摸点 (startX, startY)计算出右下角的坐标
    const zeroAngleDownPoint = {
      x: propsX, // control锚点的坐标x
      y: propsY, // control锚点的坐标y
    };
    // 这里的this.nodeModel.x每次move都会更新一次
    // 但是我们drag.ts中总是move时e.clientX-this.downEvent.clientX
    const oldCenter = {x: downCenterX, y: downCenterY};
    const downPoint = calculatePointAfterRotateAngle(
      zeroAngleDownPoint,
      oldCenter,
      angle,
    ); // 得到旋转之后的坐标
    const movePoint = {x: downPoint.x + deltaX, y: downPoint.y + deltaY}; // 得到旋转之后的坐标

    const {
      width: newWidth,
      height: newHeight,
      center: newCenter,
      freezePoint,
    } = calculateWidthAndHeight(downPoint, movePoint, oldCenter, angle);
    // resize.width = newWidth;
    // resize.height = newHeight;

    // 修正中心点坐标：因为你现在是以旋转后的坐标系去固定死freezePoint，但是你要想到一个问题，你最终是要恢复到未旋转时的坐标的
    // 比如你拉伸右下角的坐标，你要保证左上角的坐标不变，不是保证（旋转后的坐标系）左上角坐标不变，而是要保证：最终恢复到未旋转时的坐标时左上角的坐标要不变！
    // 因为你是以未旋转时的坐标 + tranform => 去显示坐标的
    // 如果最终恢复到未旋转时的坐标时左上角的坐标改变了，那么观感就是改变了！

    const initZeroAngleFreezePoint = calculatePointAfterRotateAngle(
      freezePoint,
      oldCenter,
      -angle,
    );
    const newZeroAngleFreezePoint = calculatePointAfterRotateAngle(
      freezePoint,
      newCenter,
      -angle,
    );
    const dx = initZeroAngleFreezePoint.x - newZeroAngleFreezePoint.x; // 100 - 120
    const dy = initZeroAngleFreezePoint.y - newZeroAngleFreezePoint.y; // 120 - 100
    // resize.center = {
    //   x: newCenter.x + dx,
    //   y: newCenter.y + dy,
    // };

    // 由于在drag.ts中每次move之后会this.startX=e.clientX
    // 所以是累加的，我move又要用到实时更新的move，而且还是zero=0的坐标
    const zeroAngleMovePoint = calculatePointAfterRotateAngle(
      movePoint,
      newCenter,
      -angle,
    );
    // 得到旋转之后的坐标
    // 触摸点也需要修正，因为你目前触发的点所形成的矩形是以newCenter去旋转的
    // 但是你的坐标系是以oldCenter为旋转中心的，最终newCenter->计算出width+height，形成新的矩形时
    // -> 如果以newCenter旋转-angle恢复到0度，此时左上角的坐标是不变的，右下角的坐标就是你的触摸坐标旋转-angle
    // -> 但是你最终还要要恢复到以oldCenter旋转-angle恢复到0度，这个时候，左上角就不对了，上面resize.center修正了
    // -> resize.center修正的同时，你要知道zeroAngleMovePoint也是以newCenter旋转得到的坐标，
    // 也需要跟resize.center一样修正，变为以oldCenter一样的坐标
    this.props.x = zeroAngleMovePoint.x + dx;
    this.props.y = zeroAngleMovePoint.y + dy;

    // 比如圆形，pct=0.5，width代表的是半径！
    const dWidth = ((newWidth * pct - oldWidth)) / pct;
    const dHeight = ((newHeight * pct - oldHeight)) / pct;

    // 没有getRotateResize之前，deltaX和deltaY是e.clientX - pointDownX
    // 但是我们现在计算出来的resize.deltaX是宽度的比较，但是不同锚点resize使得deltaX增大是不同方向的
    // 比如左上角锚点是往左边拉伸->resize.deltaX变大
    // 右上角锚点是往右边拉伸->resize.deltaX变大
    // 因此我们需要根据锚点还原下正负

    switch (index) {
      case 0:
        // 左上角
        resize.deltaX = (-1) * dWidth;
        resize.deltaY = (-1) * dHeight;
        break;
      case 1:
        // 右上角
        resize.deltaX = 1 * dWidth;
        resize.deltaY = (-1) * dHeight;
        break;
      case 2:
        // 右下角
        resize.deltaX = 1 * dWidth;
        resize.deltaY = 1 * dHeight;
        break;
      case 3:
        // 左下角
        resize.deltaX = (-1) * dWidth;
        resize.deltaY = 1 * dHeight;
        break;
      default:
        break;
    }
    // resize.width = newWidth * pct;
    // resize.height = newHeight * pct;

    return resize;
  };
}

export {Transform}
