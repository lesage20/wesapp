import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { Ionicons } from '@expo/vector-icons';
import CallsMaskInput, { FormatType } from '~/components/calls/calls-mask-input';
import CallsKeyboard from '~/components/calls/calls-keyboard';
import CustomHeader from '~/components/CustomHeader';

export default function CallsScreen() {
  const [wesappCode, setWesappCode] = useState('');
  const [codeFormat, setCodeFormat] = useState<FormatType | ''>('');
  const { user } = useAuthStore();

  const handleCodeChange = (masked: string, format: FormatType | '') => {
    setWesappCode(masked);
    setCodeFormat(format);
  };

  const handleKeyPress = (key: string | number) => {
    if (key === 'backspace') {
      // Supprimer le dernier caractère réel (pas les tirets du masque)
      const cleanValue = wesappCode.replace(/[^A-Z0-9]/g, '');
      const newCleanValue = cleanValue.slice(0, -1);
      
      // Laisser le MaskInput reformater
      const event = { target: { value: newCleanValue } };
      handleCodeChange(newCleanValue, '');
    } else {
      const newValue = wesappCode + key.toString();
      handleCodeChange(newValue, '');
    }
  };

  const handleAddCode = () => {
    if (wesappCode.trim()) {
      console.log('Adding WeSapp Code:', wesappCode, 'Format:', codeFormat);
      // Handle code addition logic here
    }
  };

  return (
    <>
      <CustomHeader 
        title="Calls"
        showMenuButton={true}
        showBackButton={false}
        rightContent={
          <View className="relative mr-4">
            <TouchableOpacity className="p-2">
              <Ionicons name="notifications" size={24} color="#4A5568" />
            </TouchableOpacity>
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </View>
        }
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-1 px-6">
            {/* User Avatar */}
            <View className="items-center mt-12 mb-8">
              <View className="w-16 h-16 rounded-full bg-gray-300 items-center justify-center">
                <Text className="text-2xl font-bold text-gray-700">
                  {user?.username?.charAt(0)?.toUpperCase() || 'D'}
                </Text>
              </View>
              <Text className="text-lg text-gray-700 mt-2 font-medium">
                {user?.username || 'Développeur'}
              </Text>
            </View>

            {/* Code Input Section */}
            <View className="mb-8">
              <CallsMaskInput
                value={wesappCode}
                onChange={handleCodeChange}
                className="mb-4"
              />
              
              <Text className="text-center text-teal-600 text-lg font-medium">
                Add this WeSapp Code
              </Text>
            </View>

            {/* Custom Keyboard */}
            <View className=" h-auto">
              <CallsKeyboard
                onKeyPress={handleKeyPress}
                disableLetters={false}
                disableNumbers={false}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
