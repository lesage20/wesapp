import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export default function CallsScreen() {
  const [wesappCode, setWesappCode] = useState('');
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const handleAddCode = () => {
    if (wesappCode.trim()) {
      console.log('Adding WeSapp Code:', wesappCode);
      // Handle code addition logic here
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Calls',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
              className="p-2"
            >
              <Ionicons name="menu" size={24} color="#4A5568" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="relative mr-4">
              <TouchableOpacity className="p-2">
                <Ionicons name="notifications" size={24} color="#4A5568" />
              </TouchableOpacity>
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </View>
          ),
        }} 
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
              <View className="border border-gray-300 rounded-lg mb-4">
                <TextInput
                  className="px-4 py-4 text-gray-900 text-lg"
                  placeholder="Entrez le code WeSapp"
                  value={wesappCode}
                  onChangeText={setWesappCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              
              <Text className="text-center text-teal-600 text-lg font-medium">
                Add this WeSapp Code
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
