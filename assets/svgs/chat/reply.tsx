import Svg, { Path, Polyline, SvgProps } from "react-native-svg";

const SVGComponent = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#018181"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Polyline points="9 17 4 12 9 7" />
    <Path d="M20 18v-2a4 4 0 00-4-4H4" />
  </Svg>
);
export default SVGComponent;
