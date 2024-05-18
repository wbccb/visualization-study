import BaseNode from "./base/BaseNode.tsx";
import { Point, Size } from "../type";

type SvgRectProps = {
  className?: string;
  radius?: number;
  stroke?: string;
  strokeDasharray?: string;
} & Point &
  Size;

function SvgRect(props: SvgRectProps) {
  const { x, y, width, height, className, radius } = props;

  const leftTopX = x - width / 2;
  const leftTopY = y - height / 2;
  const attrs: Record<string, any> = {};
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v;
    if (valueType !== "object") {
      attrs[k] = v;
    }
  });

  if (className) {
    attrs.className = `lf-basic-shape ${className}`;
  } else {
    attrs.className = "lf-basic-shape";
  }
  if (radius) {
    attrs.rx = radius;
    attrs.ry = radius;
  }
  attrs.x = leftTopX;
  attrs.y = leftTopY;
  return <rect {...attrs} />;
}

SvgRect.defaultProps = {
  className: "",
  radius: "",
};

const Rect = (props: any) => {
  const getShape = () => {
    const { model } = props;
    return (
      <SvgRect
        x={model.x}
        y={model.y}
        width={model.width}
        height={model.height}
        radius={model.radius}
      />
    );
  };

  return <BaseNode getShape={getShape}></BaseNode>;
};

const RectResize = (props: any) => {
  const { isSelected } = props.model;

  // 选中矩形的每一个点就是Control
  const Control = (controlProps: any) => {
    const { index, x, y } = controlProps;

    const onMouseDown = () => {};

    return (
      <g className={`lf-resize-control-${index}`}>
        <Rect
          className="lf-node-control"
          {...{ x, y }}
          onMouseDown={onMouseDown}
        />
      </g>
    );
  };
  // 选中矩形
  const getResizeControl = (resizeProps: any) => {
    const { model, graphModel } = resizeProps;
    const { x, y, width, height } = model;
    const box = {
      minX: x - width / 2,
      minY: y - height / 2,
      maxX: x + width / 2,
      maxY: y + height / 2,
    };
    const { minX, minY, maxX, maxY } = box;
    const controlList = [
      // 左上角
      {
        x: minX,
        y: minY,
      },
      // 右上角
      {
        x: maxX,
        y: minY,
      },
      // 右下角
      {
        x: maxX,
        y: maxY,
      },
      // 左下角
      {
        x: minX,
        y: maxY,
      },
    ];

    return (
      <g className="lf-resize-control">
        {controlList.map((control, index) => (
          <Control
            index={index}
            {...control}
            model={model}
            graphModel={graphModel}
          />
        ))}
      </g>
    );
  };

  return (
    <g>
      <Rect />
      {isSelected ? getResizeControl(props) : ""}
    </g>
  );
};

export default RectResize;
