// import React from 'react';
// import Svg, { Path } from 'react-native-svg';

// const BadgeIcon = ({ size = 24, color = "#018181" }) => (
//   <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
//     {/* Badge étoilé */}
//     <Path
//       d="M12 0L13.8 4.8L18.6 3.6L17.4 8.4L22 10L17.4 11.6L18.6 16.4L13.8 15.2L12 20L10.2 15.2L5.4 16.4L6.6 11.6L2 10L6.6 8.4L5.4 3.6L10.2 4.8L12 0Z"
//       fill={color}
//     />
//     {/* Coche blanche centrée */}
//     <Path
//       d="M9.25 12.5L11 14.25L15.25 10L14.25 9L11 12.25L10.25 11.5L9.25 12.5Z"
//       fill="white"
//     />
//   </Svg>
// );

// export default BadgeIcon;

import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BadgeIcon = ({ size = 64, color = "#1DA1F2", checkColor = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Badge étoilé */}
    <Path
      d="M32 0C33.6 4.8 38.6 8 44 8C44.9 8 45.8 7.9 46.6 7.7C47.4 13.1 51.6 17.3 57 18.1C56.8 18.9 56.7 19.8 56.7 20.7C56.7 26.1 60 31.1 64 32.7C60 34.3 56.7 39.3 56.7 44.7C56.7 45.6 56.8 46.5 57 47.3C51.6 48.1 47.4 52.3 46.6 57.7C45.8 57.5 44.9 57.4 44 57.4C38.6 57.4 33.6 60.6 32 64C30.4 60.6 25.4 57.4 20 57.4C19.1 57.4 18.2 57.5 17.4 57.7C16.6 52.3 12.4 48.1 7 47.3C7.2 46.5 7.3 45.6 7.3 44.7C7.3 39.3 4 34.3 0 32.7C4 31.1 7.3 26.1 7.3 20.7C7.3 19.8 7.2 18.9 7 18.1C12.4 17.3 16.6 13.1 17.4 7.7C18.2 7.9 19.1 8 20 8C25.4 8 30.4 4.8 32 0Z"
      fill={color}
    />
    {/* Coche centrée et plus petite */}
    <Path
      d="M27 34L23 30C22.2 29.2 21 29.2 20.2 30C19.4 30.8 19.4 32 20.2 32.8L26.2 38.8C27 39.6 28.2 39.6 29 38.8L43.8 24C44.6 23.2 44.6 22 43.8 21.2C43 20.4 41.8 20.4 41 21.2L27 34Z"
      fill={checkColor}
    />
  </Svg>
);

export default BadgeIcon;

