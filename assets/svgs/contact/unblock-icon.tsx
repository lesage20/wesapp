// @/assets/svgs/contact/UnblockIcon.tsx
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

const UnblockIcon = ({ fill = '#FF0000', ...props }: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    <Rect
      x="5"
      y="8"
      width="8"
      height="6"
      rx="1"
      stroke={fill}
      strokeWidth={1.08929}
      strokeLinejoin="round"
    />
    <Path
      d="M7 8V6C7 4.89543 7.89543 4 9 4C10.1046 4 11 4.89543 11 6"
      stroke={fill}
      strokeWidth={1.08929}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <Path
      d="M9 10V12"
      stroke={fill}
      strokeWidth={1.08929}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

export default UnblockIcon;