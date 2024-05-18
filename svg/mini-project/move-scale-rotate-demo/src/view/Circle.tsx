import BaseNode from "./base/BaseNode.tsx";

function SvgCircle(props: any) {
  const { x = 0, y = 0, r = 4, className } = props;
  const attrs: Record<string, any> = {
    cx: x,
    cy: y,
    r,
    fill: "transparent",
    fillOpacity: 1,
    strokeWidth: "1",
    stroke: "#000",
    strokeOpacity: 1,
  };
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
  return <circle {...attrs} />;
}
const Circle = (props: any) => {
  const getShape = () => {
    const { model } = props;
    const { x, y, r } = model;
    const style = model.getNodeStyle();
    return <SvgCircle {...style} x={x} y={y} r={r} />;
  };

  return <BaseNode getShape={getShape} />;
};

export default Circle;
