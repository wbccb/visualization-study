import {Point} from "../type";


export function calculateWidthAndHeight(
  downPoint: Point,
  movePoint: Point,
  oldCenter: Point,
  angle: number,
) {
  // 坐标都是没旋转之前的坐标，然后使用transform!!!!

  // downPoint + oldCenter计算出不变的点的坐标
  const freezePoint: Point = {
    x: oldCenter.x - (downPoint.x - oldCenter.x),
    y: oldCenter.y - (downPoint.y - oldCenter.y),
  };
  // movePoint + freezePoint计算出新的中心点
  const newCenter = getNewCenter(freezePoint, movePoint);

  // 旋转angle使得angle=0，得到对应的movePoint(angle=0)的坐标
  const angleZeroMovePoint: Point = calculatePointAfterRotateAngle(
    movePoint,
    newCenter,
    -angle,
  );
  const angleZeroFreezePoint: Point = calculatePointAfterRotateAngle(
    freezePoint,
    newCenter,
    -angle,
  );
  const width = Math.abs(angleZeroMovePoint.x - angleZeroFreezePoint.x);
  const height = Math.abs(angleZeroMovePoint.y - angleZeroFreezePoint.y);

  return {
    width,
    height,
    center: newCenter,
    freezePoint,
  };
}

/**
 * 根据两个点获取中心点坐标
 */
function getNewCenter(startPoint: Point, endPoint: Point) {
  const {x: x1, y: y1} = startPoint;
  const {x: x2, y: y2} = endPoint;
  const newCenter = {
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2,
  };
  return newCenter as Point;
}

/**
 * 旋转矩阵公式，可以获取某一个坐标旋转angle后的坐标
 * @param p 当前坐标
 * @param center 旋转中心
 * @param angle 旋转角度（不是弧度）
 */
export function calculatePointAfterRotateAngle(
  p: Point,
  center: Point,
  angle: number,
) {
  const radian = angleToRadian(angle);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const x = dx * Math.cos(radian) - dy * Math.sin(radian) + center.x;
  const y = dx * Math.sin(radian) + dy * Math.cos(radian) + center.y;
  return {
    x,
    y,
  };
}

/**
 * 角度转弧度
 * @param angle 角度
 */
function angleToRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

/**
 * 弧度转角度
 * @param radian 弧度
 */
export function radianToAngle(radian: number) {
  return (radian / Math.PI) * 180;
}
