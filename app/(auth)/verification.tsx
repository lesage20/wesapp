import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '~/hooks';

export default function VerificationScreen() {
  const { phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();
  
  // Hook d'authentification
  const { verifyOTP, isLoading, error } = useAuth();

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

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6 && phoneNumber) {
      try {
        await verifyOTP(phoneNumber as string, verificationCode);
        // Navigation vers profile-setup en cas de succès
        router.push({
          pathname: '/(auth)/profile-setup',
          params: { phoneNumber }
        });
      } catch (err) {
        // L'erreur est déjà gérée par le hook (toast)
        console.error('Erreur lors de la vérification OTP:', err);
        // Réinitialiser le code en cas d'erreur
        setCode(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <View className="flex-1 bg-black">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View className="flex-1 justify-center items-center min-h-[40vh]">
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

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <Text className="text-red-600 text-center text-sm">{error}</Text>
          </View>
        )}

          {/* Verify Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg ${(isCodeComplete && !isLoading) ? 'bg-teal-600' : 'bg-gray-300'}`}
            onPress={handleVerifyCode}
            disabled={!isCodeComplete || isLoading}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold text-lg ml-2">
                  Verification...
                </Text>
              </View>
            ) : (
              <Text className={`text-center font-semibold text-lg ${isCodeComplete ? 'text-white' : 'text-gray-500'}`}>
                Vérifier le code
              </Text>
            )}
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}