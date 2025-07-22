import Svg, { Path, SvgProps } from "react-native-svg";

const ContactIcon = ({ color, ...props }: SvgProps) => (
  <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
    <Path
      d="M12.7 22C8.69305 22 6.68958 22 5.44479 20.682C4.19999 19.364 4.19999 17.2426 4.19999 13C4.19999 8.75736 4.19999 6.63604 5.44479 5.31802C6.68958 4 8.69305 4 12.7 4C16.7069 4 18.7104 4 19.9552 5.31802C21.2 6.63604 21.2 8.75736 21.2 13C21.2 17.2426 21.2 19.364 19.9552 20.682C18.7104 22 16.7069 22 12.7 22Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.69999 4V2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M16.7 4V2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M14.718 9.49261C14.718 10.5972 13.8226 11.4926 12.7181 11.4926C11.6135 11.4926 10.7181 10.5972 10.7181 9.49261C10.7181 8.38808 11.6135 7.49268 12.7181 7.49268C13.8226 7.49268 14.718 8.38808 14.718 9.49261Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.76297 16.7161C9.82132 15.0868 11.502 14.4762 12.7181 14.4774C13.9341 14.4787 15.5656 15.0868 16.6239 16.7161C16.6923 16.8215 16.7112 16.9512 16.6494 17.0607C16.4019 17.4996 15.6334 18.3705 15.0784 18.4296C14.4406 18.4974 12.7723 18.5069 12.7194 18.5072C12.6664 18.5069 10.9466 18.4974 10.3085 18.4296C9.75344 18.3705 8.98495 17.4996 8.73744 17.0607C8.67569 16.9512 8.69455 16.8215 8.76297 16.7161Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ContactIcon;
