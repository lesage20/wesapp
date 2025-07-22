import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import QrCodeIcon from '../../../assets/svgs/conversations/header-qr-code';
import MenuIcon from '~/assets/svgs/header/menu';

export default function ConversationsScreen() {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Conversations',
          headerShown: false,
        }} 
      />
      <SafeAreaView className="flex-1 bg-teal-500">
        {/* Header with QR Code Scan */}
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
              className="p-2 bg-white/20 rounded-lg"
            >
              <MenuIcon width={24} height={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* QR Code Scan Section */}
          <View className="bg-black/20 rounded-2xl p-6 items-center">
            <View className="w-32 h-32 bg-white rounded-2xl items-center justify-center mb-4">
              {/* QR Code Placeholder */}
              <View className="w-24 h-24 ">
                <View className="flex-1 flex-row items-center justify-center">
                <QrCodeIcon width={200} height={90}  className="text-black"/>
                </View>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="scan" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Scan</Text>
            </View>
          </View>
        </View>

        {/* White Content Section */}
        <View className="flex-1 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-6 ">
            <Text className="text-2xl font-bold text-gray-900">Conversations</Text>
            <TouchableOpacity className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center">
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-6">
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

          {/* Loading State */}
          <View className="flex-1 items-center justify-center">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg">Loading...</Text>
              <Text className="text-gray-400 text-sm mt-2">
                Vos conversations vont apparaître ici
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}