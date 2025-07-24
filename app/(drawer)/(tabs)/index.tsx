import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { Ionicons } from '@expo/vector-icons';
import CallsMaskInput, { FormatType } from '~/components/calls/calls-mask-input';
import CallsKeyboard from '~/components/calls/calls-keyboard';
import CustomHeader from '~/components/CustomHeader';
import VoiceCallIcon from '~/assets/svgs/chat/voice-call';
import VideoCallIcon from '~/assets/svgs/chat/video-call';
import TimeIcon from '~/assets/svgs/header/time';
import MessageIcon from '~/assets/svgs/contact/message';
import { ScrollView } from 'react-native-gesture-handler';
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
              <TimeIcon width={24} height={24} color="#4A5568" />
            </TouchableOpacity>
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </View>
        }
      />
      <KeyboardAvoidingView 
        className="flex-1 bg-gray-50" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 5 }}
        >
            {/* User Avatar */}
            <View className="items-center mt-10 mb-8">
              <View className=" rounded flex-row space-x-2 gap-3  items-center justify-center text-center">
                <Text className="text-lg font-bold text-gray-700 px-2 rounded-lg border border-gray-200">
                  {user?.username?.charAt(0)?.toUpperCase() || 'D'}
                </Text>
                <Text className="text-lg text-gray-700 font-medium">
                  {user?.username || 'Développeur'}
                </Text>
              </View>
            </View>

            {/* Code Input Section */}
            <View className="mb-8">
              <CallsMaskInput
                value={wesappCode}
                onChange={handleCodeChange}
                className="mb-4"
              />
              
              <Text className="text-center text-teal-600 text-2xl py-2 font-medium">
                Add this WeSapp Code
              </Text>
            </View>

            {/* Custom Keyboard */}
            <View className="h-auto bg-gray-300 p-2 rounded-lg">
              <CallsKeyboard
                onKeyPress={handleKeyPress}
                disableLetters={false}
                disableNumbers={false}
              />
              
              {/* Action Icons */}
            <View className="flex-row items-center justify-center mt-6 mb-4">
              <TouchableOpacity 
                className="w-14 h-14 bg-white border border-gray-100 rounded-full items-center justify-center mr-8"
                onPress={() => console.log('Voice call pressed')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <VoiceCallIcon width={20} height={20} color="#14B8A6" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="w-14 h-14 bg-white border border-gray-100 rounded-full items-center justify-center mr-8"
                onPress={() => console.log('Video call pressed')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <VideoCallIcon width={20} height={20} color="#14B8A6" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="w-14 h-14 bg-white border border-gray-100 rounded-full items-center justify-center"
                onPress={() => console.log('Message pressed')}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <MessageIcon width={20} height={20} color="#14B8A6" stroke="#14B8A6" />
              </TouchableOpacity>
            </View>
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
