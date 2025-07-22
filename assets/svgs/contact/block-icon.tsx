// @/assets/svgs/contact/BlockIcon.tsx
import Svg, { Path, SvgProps } from 'react-native-svg';

const BlockIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M5 5L13 13M5 13L13 5"
      stroke="#FF0000"
      strokeWidth={1.08929}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

export default BlockIcon;