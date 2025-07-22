import Svg, { Path, SvgProps } from "react-native-svg";

const AddAccountIcon = (props: SvgProps) => (
  <Svg width={19} height={19} viewBox="0 0 19 19" fill="none" {...props}>
    <Path
      d="M9.49967 5.93758C9.49967 7.46787 8.25913 8.70841 6.72884 8.70841C5.19855 8.70841 3.95801 7.46787 3.95801 5.93758C3.95801 4.40729 5.19855 3.16675 6.72884 3.16675C8.25913 3.16675 9.49967 4.40729 9.49967 5.93758Z"
      stroke="#010204"
      strokeWidth={1.1875}
    />
    <Path
      d="M10.6875 8.70841C12.2178 8.70841 13.4583 7.46787 13.4583 5.93758C13.4583 4.40729 12.2178 3.16675 10.6875 3.16675"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinecap="round"
    />
    <Path
      d="M10.4045 15.8333H3.05324C2.24125 15.8333 1.58301 15.2256 1.58301 14.4761C1.58301 12.6023 3.22863 11.0833 5.25861 11.0833H8.19904C9.02649 11.0833 9.79014 11.3356 10.4045 11.7616"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.042 11.0833V15.8333M17.417 13.4583H12.667"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinecap="round"
    />
  </Svg>
);

export default AddAccountIcon;
