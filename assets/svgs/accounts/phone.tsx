import Svg, { G, Path, Rect, SvgProps } from "react-native-svg";

const PhoneIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
    <G
      fill="none"
      stroke="black"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <Rect width={12.5} height={18.5} x={5.75} y={2.75} rx={3} />
      <Path d="M11 17.75h2" />
    </G>
  </Svg>
);
export default PhoneIcon;
