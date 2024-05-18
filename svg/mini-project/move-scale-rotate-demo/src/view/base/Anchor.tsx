import Rect from "../Rect.tsx";
import Circle from "../Circle.tsx";

interface AnchorProps {
  node: any;
  anchorData: any;
  style: any;
}

function getAnchorShape(props: any) {
  const { anchorData, style, node } = props;
  const anchorShape = node.getAnchorShape(anchorData);
  if (anchorShape) return anchorShape;
  const { x, y } = anchorData;
  const hoverStyle = {
    ...style,
    ...style.hover,
  };
  return (
    <g>
      <Circle className="lf-node-anchor-hover" {...hoverStyle} {...{ x, y }} />
      <Circle className="lf-node-anchor" {...style} {...{ x, y }} />
    </g>
  );
}

const Anchor = (props: { node: typeof Rect }) => {
  return (
    // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改类名
    <g className="lf-anchor">
      <g>{getAnchorShape(props)}</g>
    </g>
  );
};

export default Anchor;
