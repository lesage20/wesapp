import Svg, { Line, Polyline, SvgProps } from "react-native-svg";

const DoubleCheckIcon = ({ color, ...props }: SvgProps) => (
  <Svg
    fill={color}
    width={24}
    height={24}
    viewBox="0 0 24 24"
    id="check-double"
    data-name="Flat Line"
    className="icon flat-line"
    {...props}
  >
    <Line
      id="primary"
      x1={13.22}
      y1={16.5}
      x2={21}
      y2={7.5}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <Polyline
      id="primary-2"
      data-name="primary"
      points="3 11.88 7 16.5 14.78 7.5"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </Svg>
);

export default DoubleCheckIcon;
