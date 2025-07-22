import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VerificationScreen() {
  const { phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      // Navigate to profile setup with phone number
      router.push({
        pathname: '/(auth)/profile-setup',
        params: { phoneNumber }
      });
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Logo Section */}
      <View className="flex-1 justify-center items-center">
        <Image 
          source={require('~/assets/images/logo.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Form Section */}
      <View className="bg-white rounded-t-3xl px-6 py-8">
        <Text className="text-2xl font-bold text-center mb-2 text-gray-900">
          Enter your verification code
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Verification code sent to {phoneNumber}
        </Text>

        <Text className="text-gray-900 font-medium mb-6">
          Verification code ?
        </Text>

        {/* Code Input Fields */}
        <View className="flex-row justify-between mb-12">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold text-gray-900"
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className={`py-4 rounded-lg ${isCodeComplete ? 'bg-teal-600' : 'bg-gray-300'}`}
          onPress={handleVerifyCode}
          disabled={!isCodeComplete}
        >
          <Text className={`text-center font-semibold text-lg ${isCodeComplete ? 'text-white' : 'text-gray-500'}`}>
            Vérifier le code
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}