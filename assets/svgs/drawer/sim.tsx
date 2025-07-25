import Svg, { Path, SvgProps } from "react-native-svg";

const SimIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 48 48" {...props}>
    <Path
      fill="#018181"
      d="M36 45H12c-2.2 0-4-1.8-4-4V7c0-2.2 1.8-4 4-4h16.3c1.1 0 2.1.4 2.8 1.2l7.7 7.7c.8.8 1.2 1.8 1.2 2.8V41c0 2.2-1.8 4-4 4"
    />
    <Path
      fill="#ff9800"
      d="M32 38H16c-1.1 0-2-.9-2-2V24c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2"
    />
    <Path
      fill="#ffd54f"
      d="M29 30v3h5v2h-5v3h-2V22h2v6h5v2zm-15-1v2h5v2h-5v2h5v3h2v-9z"
    />
  </Svg>
);

export default SimIcon;
