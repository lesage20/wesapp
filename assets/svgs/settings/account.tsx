import * as React from "react";

import Svg, { Path, SvgProps } from "react-native-svg";

const AccountIcon = (props: SvgProps) => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" {...props}>
    <Path
      d="M12.1992 7.76636C12.1992 9.6045 10.7115 11.0912 8.87207 11.0912L9.34735 10.1413"
      stroke="#018181"
      strokeWidth={0.831787}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.10938 5.54978C1.10938 3.71157 2.59709 2.22485 4.43652 2.22485L3.96122 3.17483"
      stroke="#018181"
      strokeWidth={0.831787}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.08105 3.06296H12.0735M7.46737 6.09634H10.8134C11.5791 6.09634 12.1997 5.47607 12.1997 4.71095V2.49329C12.1997 1.72816 11.5791 1.10791 10.8134 1.10791H7.46737C6.70173 1.10791 6.08105 1.72816 6.08105 2.49329V4.71095C6.08105 5.47607 6.70173 6.09634 7.46737 6.09634Z"
      stroke="#018181"
      strokeWidth={0.831787}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.10938 9.16695H7.10185M2.49569 12.2003H5.84174C6.60738 12.2003 7.22806 11.5801 7.22806 10.8149V8.59728C7.22806 7.83215 6.60738 7.21191 5.84174 7.21191H2.49569C1.73005 7.21191 1.10938 7.83215 1.10938 8.59728V10.8149C1.10938 11.5801 1.73005 12.2003 2.49569 12.2003Z"
      stroke="#018181"
      strokeWidth={0.831787}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AccountIcon;
