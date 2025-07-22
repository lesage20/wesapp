import Svg, { Path, SvgProps } from "react-native-svg";

const InviteIcon = (props: SvgProps) => (
  <Svg width={13} height={14} viewBox="0 0 13 14" fill="none" {...props}>
    <Path
      d="M6.77051 12.4166H3.56973C2.73265 12.4166 2.06684 12.0092 1.46903 11.4397C0.245248 10.2738 2.25453 9.34208 3.02086 8.88578C4.15879 8.20821 5.49044 7.95969 6.77051 8.14023C7.23499 8.20571 7.68733 8.32775 8.12468 8.50623"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.9375 4.02075C8.9375 5.36695 7.8462 6.45825 6.5 6.45825C5.15381 6.45825 4.0625 5.36695 4.0625 4.02075C4.0625 2.67456 5.15381 1.58325 6.5 1.58325C7.8462 1.58325 8.9375 2.67456 8.9375 4.02075Z"
      stroke="white"
    />
    <Path
      d="M10.0208 12.4167V8.625M8.125 10.5208H11.9167"
      stroke="white"
      strokeLinecap="round"
    />
  </Svg>
);

export default InviteIcon;
