import * as React from "react";

import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  SvgProps,
} from "react-native-svg";

const HeaderQrCardIcon = (props: SvgProps) => (
  <Svg width={176} height={88} viewBox="0 0 176 88" fill="none" {...props}>
    <G clipPath="url(#clip0_951_3873)">
      <Rect
        width={176}
        height={88}
        rx={10.6977}
        fill="url(#paint0_linear_951_3873)"
      />
      <G opacity={0.5}>
        <Path
          opacity={0.1}
          d="M162.357 -21.6366L248.143 29.425V115.761L162.357 64.2368V-21.6366Z"
          fill="white"
        />
        <Path
          opacity={0.3}
          d="M162.357 -21.3539L248.143 -72.8779L333.929 -21.3539V-20.9685L248.143 30.5555L162.357 -20.9685V-21.3539Z"
          fill="white"
        />
        <Path
          opacity={0.1}
          d="M-79.5645 27.3413L6.22128 78.4029V164.739L-79.5645 113.215V27.3413Z"
          fill="white"
        />
        <Path
          opacity={0.2}
          d="M91.7061 27.3931L5.92274 78.4011V164.646L91.7061 113.176V27.3931Z"
          fill="white"
        />
        <Path
          opacity={0.3}
          d="M-79.5645 27.6244L6.22128 -23.8997L92.007 27.6244V28.0097L6.22128 79.5337L-79.5645 28.0097V27.6244Z"
          fill="white"
        />
        <Path
          opacity={0.1}
          d="M126.439 -0.159912L162.208 21.1305V57.1286L126.439 35.6454V-0.159912Z"
          fill="white"
        />
        <Path
          opacity={0.2}
          d="M197.852 -0.138184L162.084 21.1299V57.0903L197.852 35.6296V-0.138184Z"
          fill="white"
        />
        <Path
          opacity={0.3}
          d="M126.439 -0.0420723L162.208 -21.5253L197.977 -0.0420723V0.118608L162.208 21.6018L126.439 0.118608V-0.0420723Z"
          fill="white"
        />
      </G>
    </G>
    <Defs>
      <LinearGradient
        id="paint0_linear_951_3873"
        x1={0}
        y1={0}
        x2={103.4}
        y2={103.4}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#0C6262" />
        <Stop offset={1} stopColor="#063838" />
      </LinearGradient>
      <ClipPath id="clip0_951_3873">
        <Rect width={176} height={88} rx={10.6977} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default HeaderQrCardIcon;
