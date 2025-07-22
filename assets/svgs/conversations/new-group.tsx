import Svg, { Path, SvgProps } from "react-native-svg";

const NewGroupIcon = (props: SvgProps) => (
  <Svg width={21} height={20} viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      d="M10.4993 6.24992C10.4993 7.86075 9.19352 9.16659 7.58268 9.16659C5.97185 9.16659 4.66602 7.86075 4.66602 6.24992C4.66602 4.63909 5.97185 3.33325 7.58268 3.33325C9.19352 3.33325 10.4993 4.63909 10.4993 6.24992Z"
      stroke="#018181"
      strokeWidth={1.25}
    />
    <Path
      d="M11.75 9.16659C13.3608 9.16659 14.6667 7.86075 14.6667 6.24992C14.6667 4.63909 13.3608 3.33325 11.75 3.33325"
      stroke="#018181"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
    <Path
      d="M11.4518 16.6667H3.71363C2.85891 16.6667 2.16602 16.0272 2.16602 15.2382C2.16602 13.2657 3.89825 11.6667 6.03507 11.6667H9.13027C10.0013 11.6667 10.8051 11.9324 11.4518 12.3807"
      stroke="#018181"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.334 11.6667V16.6667M18.834 14.1667H13.834"
      stroke="#018181"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
  </Svg>
);

export default NewGroupIcon;
