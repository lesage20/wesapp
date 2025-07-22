import Svg, { Path, SvgProps } from "react-native-svg";

const AddAccountIcon = (props: SvgProps) => (
  <Svg width={15} height={14} viewBox="0 0 15 14" fill="none" {...props}>
    <Path
      d="M7.50033 4.37492C7.50033 5.5025 6.58624 6.41659 5.45866 6.41659C4.33108 6.41659 3.41699 5.5025 3.41699 4.37492C3.41699 3.24734 4.33108 2.33325 5.45866 2.33325C6.58624 2.33325 7.50033 3.24734 7.50033 4.37492Z"
      stroke="#018181"
      strokeWidth={0.875}
    />
    <Path
      d="M8.375 6.41659C9.50258 6.41659 10.4167 5.5025 10.4167 4.37492C10.4167 3.24734 9.50258 2.33325 8.375 2.33325"
      stroke="#018181"
      strokeWidth={0.875}
      strokeLinecap="round"
    />
    <Path
      d="M8.16702 11.6667H2.75032C2.15202 11.6667 1.66699 11.219 1.66699 10.6667C1.66699 9.28605 2.87956 8.16675 4.37533 8.16675H6.54197C7.15167 8.16675 7.71435 8.35271 8.16702 8.66655"
      stroke="#018181"
      strokeWidth={0.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.583 8.16675V11.6667M13.333 9.91675H9.83301"
      stroke="#018181"
      strokeWidth={0.875}
      strokeLinecap="round"
    />
  </Svg>
);

export default AddAccountIcon;
