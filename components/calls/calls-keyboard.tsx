import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    if (key === "backspace") return false;
    if (disableLetters && typeof key === "string") return true;
    if (disableNumbers && typeof key === "number") return true;
    return false;
  };

  return (
    <View className="w-full ">
      {[
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
        ["Z", "X", "C", "V", "B", "N", "backspace"],
      ].map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-3">
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleKeyPress(key)}
              disabled={isDisabled(key)}
              className={`bg-white rounded-lg items-center justify-center shadow-sm ${
                key === "backspace" 
                  ? "flex-[2.8] h-12" 
                  : "flex-1 h-12 mx-0.5"
              } ${isDisabled(key) ? "opacity-50" : ""}`}
              style={{
                minHeight: 48,
                elevation: 2,
              }}
            >
              {key === "backspace" ? (
                <Ionicons name="backspace-outline" size={22} color="#000" />
              ) : (
                <Text className="text-black text-lg font-semibold">
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

export default CallsKeyboard;
