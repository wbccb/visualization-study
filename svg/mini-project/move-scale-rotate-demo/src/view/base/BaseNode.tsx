import RotateControlPoint from "./RotateControlPoint.tsx";
import Anchor from "./Anchor.tsx";
import { EventType } from "../../utils/constants.ts";
import { map } from "lodash-es";

const BaseNode = (props: any) => {
  // 外部实现自行实现对应的界面，比如矩形就实现矩形，菱形就实现菱形
  const { getShape } = props;

  const getText = () => {};

  // 右上角的旋转点
  const getRotateControl = () => {
    const { model, graphModel } = props;
    const { isSelected, isHitable, enableRotate, isHovered } = model;
    const { style } = model.getRotateControlStyle();
    if (isHitable && (isSelected || isHovered) && enableRotate) {
      return (
        <RotateControlPoint
          graphModel={graphModel}
          nodeModel={model}
          eventCenter={graphModel.eventCenter}
          style={style}
        />
      );
    }
  };

  const setHoverOFF = (ev) => {
    const { model, graphModel } = props;
    const nodeData = model.getData();
    if (!model.isHovered) return;
    model.setHovered(false);
    graphModel.eventCenter.emit(EventType.NODE_MOUSELEAVE, {
      data: nodeData,
      e: ev,
    });
  };

  // 锚点布局
  const getAnchors = () => {
    const { model } = props;
    const { isSelected, isHitable, isDragging, isShowAnchor } = model;
    if (isHitable && (isSelected || isShowAnchor) && !isDragging) {
      return map(model.anchors, (anchor, index) => {
        return (
          <Anchor
            anchorData={anchor}
            node={this}
            anchorIndex={index}
            setHoverOFF={setHoverOFF}
          />
        );
      });
    }
    return [];
  };

  const nodeShapeInner = (
    // getShape(): 整个形状
    // getText(): 整个文本
    // getRotateControl(): 右上角的锚点
    // getAnchors(): 锚点
    <g className="lf-node-content">
      <g>
        {getShape()}
        {getText()}
        {getRotateControl()}
      </g>
      {getAnchors()}
    </g>
  );

  return <g>{nodeShapeInner}</g>;
};

export default BaseNode;
