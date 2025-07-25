import Svg, { ClipPath, Defs, G, Path, Rect, SvgProps } from "react-native-svg";

const QrCodeIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <G clipPath="url(#clip0_951_5871)">
      <Path d="M2.5 2.5H5V5H2.5V2.5Z" fill="#018181" />
      <Path
        d="M7.5 0V7.5H0V0H7.5ZM6.25 1.25H1.25V6.25H6.25V1.25ZM5 15H2.5V17.5H5V15Z"
        fill="#018181"
      />
      <Path
        d="M7.5 12.5V20H0V12.5H7.5ZM1.25 13.75V18.75H6.25V13.75H1.25ZM15 2.5H17.5V5H15V2.5Z"
        fill="#018181"
      />
      <Path
        d="M12.5 0V7.5H20V0H12.5ZM18.75 1.25V6.25H13.75V1.25H18.75ZM10 1.25V0H11.25V2.5H10V5H8.75V1.25H10ZM10 7.5V5H11.25V7.5H10ZM7.5 10V8.75H8.75V7.5H10V10H11.25V8.75H17.5V10H12.5V11.25H8.75V10H7.5ZM7.5 10V11.25H2.5V10H1.25V11.25H0V8.75H3.75V10H7.5ZM20 11.25H18.75V8.75H20V11.25ZM18.75 11.25H17.5V13.75H20V12.5H18.75V11.25ZM13.75 11.25H16.25V12.5H15V13.75H13.75V11.25ZM16.25 15V13.75H15V15H13.75V16.25H11.25V17.5H15V15H16.25ZM16.25 15H20V16.25H17.5V17.5H16.25V15ZM11.25 13.75V15H12.5V12.5H8.75V13.75H11.25Z"
        fill="#018181"
      />
      <Path
        d="M8.75 15H10V18.75H15V20H8.75V15ZM20 17.5V20H16.25V18.75H18.75V17.5H20Z"
        fill="#018181"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_951_5871">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default QrCodeIcon;
