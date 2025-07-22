import Svg, { Rect, Path } from 'react-native-svg';

const CopyIcon = () => (
  <Svg width="24" height="24" fill="none" stroke="#018181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export default CopyIcon;


