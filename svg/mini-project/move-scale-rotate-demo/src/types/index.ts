export type Point = {
  id?: string;
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Fill = {
  fill: string;
  fillOpacity: number;
};

export type Stroke = {
  strokeWidth: string;
  stroke: string;
  strokeOpacity: number;
};

export type Style = {
  className?: string;
};

export type RectProps = Point & Size & Fill & Stroke & Style;

export type CircleProps = {
  r: number;
  cx: number;
  cy: number;
} & Point &
  Size &
  Fill &
  Stroke &
  Style;

export type BaseProps = Point & Size & Style;
