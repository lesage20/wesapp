import Svg, { Path, SvgProps } from "react-native-svg";

const MoreIcon = (props: SvgProps) => (
  <Svg width={20} height={19} viewBox="0 0 20 19" fill="none" {...props}>
    <Path
      d="M9.99984 3.1665V15.8332M16.3332 9.49984H3.6665"
      stroke="#018181"
      strokeWidth={1.1875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MoreIcon;
