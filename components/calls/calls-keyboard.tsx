import { Button, ButtonText } from "@/components/ui/button";

import { DeleteIcon } from "@/assets/svgs/calls";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";

interface CallsKeyboardProps {
  onKeyPress?: (key: string | number) => void;
  disableLetters?: boolean;
  disableNumbers?: boolean;
}

const CallsKeyboard = ({
  onKeyPress,
  disableLetters,
  disableNumbers,
}: CallsKeyboardProps) => {
  const handleKeyPress = (key: string | number) => {
    if (onKeyPress) {
      onKeyPress(key);
    }
  };

  const isDisabled = (key: string | number) => {
    if (key === "delete") return false;
    if (disableLetters && typeof key === "string") return true;
    if (disableNumbers && typeof key === "number") return true;
    return false;
  };

  return (
    <VStack space="sm">
      {[
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
        ["Z", "X", "C", "V", "B", "N", "backspace"],
      ].map((row, rowIndex) => (
        <HStack key={rowIndex} className="flex-nowrap justify-between w-full">
          {row.map((key) => (
            <Button
              key={key}
              variant="solid"
              action="default"
              onPress={() => handleKeyPress(key)}
              disabled={isDisabled(key)}
              className={`bg-white rounded-md h-12 p-0 ${
                key === "backspace" ? "w-[38%]" : "w-[9.5%]"
              } ${isDisabled(key) ? "opacity-50" : ""}`}
            >
              <ButtonText className="font-inter-medium text-black text-2xl">
                {key === "backspace" ? <DeleteIcon /> : key}
              </ButtonText>
            </Button>
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export default CallsKeyboard;
