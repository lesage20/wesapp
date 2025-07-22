import Svg, { Path, SvgProps } from "react-native-svg";

const NewContactIcon = (props: SvgProps) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M8.33203 14.6666H4.39261C3.36236 14.6666 2.54291 14.1652 1.80714 13.4643C0.300942 12.0293 2.7739 10.8826 3.71708 10.321C5.11761 9.48704 6.75656 9.18117 8.33203 9.40337C8.9037 9.48397 9.46043 9.63418 9.9987 9.85384"
      stroke="#018181"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 4.33325C11 5.99011 9.65687 7.33325 8 7.33325C6.34315 7.33325 5 5.99011 5 4.33325C5 2.6764 6.34315 1.33325 8 1.33325C9.65687 1.33325 11 2.6764 11 4.33325Z"
      stroke="#018181"
    />
    <Path
      d="M12.3333 14.6667V10M10 12.3333H14.6667"
      stroke="#018181"
      strokeLinecap="round"
    />
  </Svg>
);

export default NewContactIcon;
