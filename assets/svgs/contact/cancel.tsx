import Svg, { Circle, Path, SvgProps } from "react-native-svg";

const CancelIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={12} fill="#E5E7E7" />
    <Path d="M17.8173 7L7 17.8173" stroke="#030303" strokeWidth={0.901443} />
    <Path
      d="M17.8164 17.8173L6.99909 7"
      stroke="#030303"
      strokeWidth={0.901443}
    />
  </Svg>
);

export default CancelIcon;
