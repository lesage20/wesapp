import Svg, { Path, SvgProps } from "react-native-svg";

const MoreIcon = (props: SvgProps) => (
  <Svg
    fill="#000000"
    width={22}
    height={22}
    viewBox="0 0 24 24"
    id="plus"
    data-name="Line Color"
    className="icon line-color"
    {...props}
  >
    <Path
      id="primary"
      d="M5,12H19M12,5V19"
      fill="none"
      stroke="#018181"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </Svg>
);

export default MoreIcon;
