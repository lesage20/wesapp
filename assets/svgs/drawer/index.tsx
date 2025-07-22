import BottomChevronIcon from "./bottom-chevron";
import ConnectionIcon from "./connection";
import ConversationIcon from "./conversations";
import { FC } from "react";
import RightChevronIcon from "./right-chevron";
import SimIcon from "./sim";
import { SvgProps } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

type IconComponent = FC<SvgProps>;

// Créer un composant wrapper pour les icônes Ionicons
const createIoniconsWrapper = (name: string): IconComponent => {
  return (props: SvgProps) => <Ionicons name={name} size={24} color="#4630EB" {...props} />;
};

const iconsMap: Record<string, IconComponent> = {
  "(tabs)": ConversationIcon,
  "(connections)": ConnectionIcon,
  "active-call": createIoniconsWrapper("call"),
  "call-history": createIoniconsWrapper("time"),
};

export const icons = Object.fromEntries(
  Object.entries(iconsMap).map(([key, Icon]) => [
    key,
    (props: SvgProps) => <Icon {...props} />,
  ])
);

export { BottomChevronIcon, RightChevronIcon, SimIcon };
