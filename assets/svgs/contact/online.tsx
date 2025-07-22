import Svg, { Circle, SvgProps } from "react-native-svg";

const OnlineIcon = (props: SvgProps) => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
    <Circle cx={20} cy={20} r={20} fill="#018181" />
    <Circle
      cx={19.8414}
      cy={19.8385}
      r={13.3375}
      fill="white"
      fillOpacity={0.3}
    />
    <Circle
      cx={19.8383}
      cy={19.8383}
      r={17.8383}
      fill="white"
      fillOpacity={0.3}
    />
    <Circle
      cx={19.8387}
      cy={19.8387}
      r={8.28793}
      fill="white"
      fillOpacity={0.3}
    />
    <Circle
      cx={19.8333}
      cy={19.8382}
      r={3.56765}
      fill="white"
      fillOpacity={0.8}
    />
  </Svg>
);

export default OnlineIcon;
