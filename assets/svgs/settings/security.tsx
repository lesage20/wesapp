import Svg, { Path, SvgProps } from "react-native-svg";

const SecurityIcon = (props: SvgProps) => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" {...props}>
    <Path
      d="M7 9.33341V8.16675"
      stroke="#018181"
      strokeWidth={0.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.91699 8.75008C2.91699 6.49491 4.74516 4.66675 7.00033 4.66675C9.25549 4.66675 11.0837 6.49491 11.0837 8.75008C11.0837 11.0052 9.25549 12.8334 7.00033 12.8334C4.74516 12.8334 2.91699 11.0052 2.91699 8.75008Z"
      stroke="#018181"
      strokeWidth={0.875}
    />
    <Path
      d="M9.625 5.54175V3.79175C9.625 2.342 8.44976 1.16675 7 1.16675C5.55025 1.16675 4.375 2.342 4.375 3.79175V5.54175"
      stroke="#018181"
      strokeWidth={0.875}
      strokeLinecap="round"
    />
  </Svg>
);

export default SecurityIcon;
