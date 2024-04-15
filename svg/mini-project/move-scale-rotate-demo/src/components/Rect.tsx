import { BaseProps } from "../types";

const Rect = (props: BaseProps) => {
  const { x = 0, y = 0, width = 10, height = 10, className = "" } = props;
  const attrs: Record<string, any> = {
    ...props,
    x,
    y,
    width,
    height,
    className,
    fill: "transparent",
    fillOpacity: 1,
    strokeWidth: "1",
    stroke: "#000",
    strokeOpacity: 1,
  };
  return <rect {...attrs} />;
};

export default Rect;
