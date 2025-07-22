import CallsIcon from "./calls";
import ContactIcon from "./contact";
import ConversationsIcon from "./conversations";
import { FC } from "react";
import SettingsIcon from "./settings";
import StoriesIcon from "./stories";
import { SvgProps } from "react-native-svg";

type IconComponent = FC<SvgProps>;

const iconsMap: Record<string, IconComponent> = {
  calls: CallsIcon,
  contacts: ContactIcon,
  conversations: ConversationsIcon,
  settings: SettingsIcon,
  stories: StoriesIcon,
};

export const icons = Object.fromEntries(
  Object.entries(iconsMap).map(([key, Icon]) => [
    key,
    (props: SvgProps) => <Icon {...props} />,
  ])
);

export { CallsIcon, ContactIcon, ConversationsIcon, SettingsIcon, StoriesIcon };
