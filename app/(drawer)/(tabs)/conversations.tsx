import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import QrCodeIcon from '../../../assets/svgs/conversations/header-qr-code';
import MenuIcon from '~/assets/svgs/header/menu';
import CameraIcon from '~/assets/svgs/conversations/camera-scan';

export default function ConversationsScreen() {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  const router = useRouter();

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Conversations',
          headerShown: false,
        }} 
      />
      <View className="flex-1">
        {/* Header with QR Code Scan */}
        <View className="bg-teal-500 px-4 py-2">
          <View className="mt-7 pb-3">
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity 
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
                className="p-2 bg-white/20 rounded-lg"
              >
                <MenuIcon width={24} height={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* QR Code Scan Section */}
            <ImageBackground 
              source={require('~/assets/images/header-qr-card.png')}
              className="rounded-2xl px-6 py-4 items-center overflow-hidden"
              resizeMode="cover"
            >
              <View className="w-32 h-32 bg-white rounded-2xl items-center justify-center mb-4">
                {/* QR Code Placeholder */}
                <View className="w-24 h-24 ">
                  <View className="flex-1 flex-row items-center justify-center">
                  <QrCodeIcon width={200} height={90}  className="text-black"/>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                <CameraIcon width={20} height={20} color="white" />
                <Text className="text-white font-semibold ml-2">Scan</Text>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* White Content Section */}
        <View className="flex-1 bg-white rounded-t-3xl ">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 ">
            <Text className="text-2xl font-bold text-gray-900">Conversations</Text>
            <TouchableOpacity className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center">
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-4">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-0 border border-gray-200 border-1">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Search"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          {/* Conversations List */}
          <ScrollView 
            className="flex-1 px-6 my-0 py-0" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Conversation Item 1 */}
            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('456-qsns-civ')}
            >
              <View className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">A</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-lg">456-QSNS-CIV</Text>
                  <Text className="text-gray-500 text-sm">il y a 11 jours</Text>
                </View>
                <Text className="text-gray-600">Azerty</Text>
              </View>
            </TouchableOpacity>

            {/* Conversation Item 2 */}
            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('narcisse-pro')}
            >
              <View className="w-12 h-12 rounded-2xl bg-orange-400 items-center justify-center mr-4">
                <View className="w-10 h-10 rounded-xl overflow-hidden">
                  <View className="w-full h-full bg-yellow-400 items-center justify-center">
                    <Text className="text-xs font-bold">OEUFS</Text>
                  </View>
                </View>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 font-semibold text-lg">Narcisse professionnels</Text>
                    <View className="w-5 h-5 bg-teal-500 rounded-full items-center justify-center ml-2">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  </View>
                  <Text className="text-gray-500 text-sm">il y a 14 jours</Text>
                </View>
                <Text className="text-gray-600">Des oeufs de qualité</Text>
              </View>
            </TouchableOpacity>

            {/* Conversation Item 3 */}
            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('akissi')}
            >
              <View className="w-12 h-12 rounded-2xl bg-pink-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">A</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-lg">Akissi ❤️</Text>
                  <Text className="text-gray-500 text-sm">il y a 16 jours</Text>
                </View>
                <Text className="text-gray-600">Coucou</Text>
              </View>
            </TouchableOpacity>

            {/* Conversation Item 4 */}
            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('kamate-drissa')}
            >
              <View className="w-12 h-12 rounded-2xl bg-green-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">K</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-lg">Kamaté drissa</Text>
                  <Text className="text-gray-500 text-sm">il y a 21 jours</Text>
                </View>
                <Text className="text-gray-600">Salut</Text>
              </View>
            </TouchableOpacity>

            {/* Additional conversations to demonstrate scrolling */}
            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('sarah')}
            >
              <View className="w-12 h-12 rounded-2xl bg-purple-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">S</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-lg">Sarah Martin</Text>
                  <Text className="text-gray-500 text-sm">il y a 2 jours</Text>
                </View>
                <Text className="text-gray-600">À bientôt!</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => handleConversationPress('tech-team')}
            >
              <View className="w-12 h-12 rounded-2xl bg-indigo-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">T</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-lg">Tech Team</Text>
                  <Text className="text-gray-500 text-sm">il y a 1 semaine</Text>
                </View>
                <Text className="text-gray-600">Réunion demain à 14h</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </>
  );
}