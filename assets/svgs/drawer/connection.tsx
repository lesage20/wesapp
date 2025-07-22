import Svg, { Path, SvgProps } from "react-native-svg";

const ConnectionIcon = (props: SvgProps) => (
  <Svg width={19} height={19} viewBox="0 0 19 19" fill="none" {...props}>
    <Path
      d="M10.2918 5.54167C10.2918 7.29057 8.87403 8.70833 7.12516 8.70833C5.37626 8.70833 3.9585 7.29057 3.9585 5.54167C3.9585 3.79276 5.37626 2.375 7.12516 2.375C8.87403 2.375 10.2918 3.79276 10.2918 5.54167Z"
      stroke="#010204"
      strokeWidth={1.1875}
    />
    <Path
      d="M11.875 8.70833C13.6239 8.70833 15.0417 7.29057 15.0417 5.54167C15.0417 3.79276 13.6239 2.375 11.875 2.375"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.7085 11.0833H5.54183C3.35571 11.0833 1.5835 12.8555 1.5835 15.0416C1.5835 15.9161 2.29238 16.6249 3.16683 16.6249H11.0835C11.958 16.6249 12.6668 15.9161 12.6668 15.0416C12.6668 12.8555 10.8946 11.0833 8.7085 11.0833Z"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinejoin="round"
    />
    <Path
      d="M13.458 11.0833C15.6441 11.0833 17.4163 12.8555 17.4163 15.0416C17.4163 15.9161 16.7075 16.6249 15.833 16.6249H14.6455"
      stroke="#010204"
      strokeWidth={1.1875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ConnectionIcon;
