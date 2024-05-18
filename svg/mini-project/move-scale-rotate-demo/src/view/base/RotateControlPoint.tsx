import Circle from "../Circle.tsx";

const RotateControlPoint = (props: any) => {
  const { cx, cy } = props;
  return (
    <g className="lf-rotate-control">
      <g onMouseDown={(ev) => {}}>
        <Circle cx={cx} cy={cy} />
      </g>
    </g>
  );
};

export default RotateControlPoint;
