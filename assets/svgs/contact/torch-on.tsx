import Svg, { Path, SvgProps } from "react-native-svg";

const TorchOnIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
    <Path
      fill="#018181"
      d="M8 20v-9L6.325 8.5q-.175-.25-.25-.525T6 7.4V4q0-.825.588-1.412T8 2h8q.825 0 1.413.588T18 4v3.4q0 .3-.075.575t-.25.525L16 11v9q0 .825-.587 1.413T14 22h-4q-.825 0-1.412-.587T8 20m4-4.5q-.625 0-1.062-.437T10.5 14t.438-1.062T12 12.5t1.063.438T13.5 14t-.437 1.063T12 15.5M8 5h8V4H8zm8 2H8v.4l2 3V20h4v-9.6l2-3zm-4 5"
    />
  </Svg>
);

export default TorchOnIcon;
