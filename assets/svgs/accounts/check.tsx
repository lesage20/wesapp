import Svg, { Path, SvgProps } from "react-native-svg";

const CheckIcon = (props: SvgProps) => (
  <Svg width={16} height={13} viewBox="0 0 16 13" fill="none" {...props}>
    <Path
      d="M1 8.5C1 8.5 2.5 8.5 4.5 12C4.5 12 10.0588 2.83333 15 1"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckIcon;
