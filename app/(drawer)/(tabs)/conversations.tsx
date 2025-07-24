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
import Avatar from '~/components/Avatar';

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
        <View className="bg-teal-700 px-4 py-2">
          <SafeAreaView>
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity 
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
                className="p-2 bg-gray-200 rounded-lg"
              >
                <MenuIcon width={24} height={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* QR Code Scan Section */}
            <TouchableOpacity
              onPress={() => router.push('/(modal)/scan-qr')}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
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
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* White Content Section */}
        <View className="flex-1 bg-white rounded-t-3xl " style={{  top: -18 }}>
          {/* Header */}
          <View className="flex-row items-center text-center justify-between px-6 py-4 ">
            <Text className="text-2xl text-center font-bold text-gray-900 flex-1">Conversations</Text>
            <TouchableOpacity className="w-10 h-10 bg-teal-700 rounded-full items-center justify-center">
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
                placeholderTextColor="#9CA3AF"
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
              <View className="mr-4">
                <Avatar
                  text="A"
                  size={48}
                  backgroundColor="blue-500"
                />
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
                    <View className="w-5 h-5 bg-teal-700 rounded-full items-center justify-center ml-2">
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
              <View className="mr-4">
                <Avatar
                  text="A"
                  size={48}
                  backgroundColor="pink-500"
                />
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
              <View className="mr-4">
                <Avatar
                  text="K"
                  size={48}
                  backgroundColor="emerald-500"
                />
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
              <View className="mr-4">
                <Avatar
                  text="S"
                  size={48}
                  backgroundColor="violet-500"
                />
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
              <View className="mr-4">
                <Avatar
                  text="T"
                  size={48}
                  backgroundColor="indigo-500"
                />
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