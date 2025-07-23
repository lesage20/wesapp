import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/store';
import BackIcon from '~/assets/svgs/header/back';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerStyle: { backgroundColor: 'white' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="p-2"
            >
              <BackIcon width={24} height={24} />
            </TouchableOpacity>
          ),
          headerTitle: 'Profile',
          headerTitleAlign: 'center',
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-6 py-8">
          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <View className="relative">
              {/* Main avatar with gradient */}
              <View className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center">
                <View className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 items-center justify-center">
                  <View className="w-20 h-20 bg-white rounded-xl items-center justify-center">
                    <View className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg items-center justify-center">
                      <View className="w-12 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded transform rotate-12"></View>
                    </View>
                  </View>
                </View>
              </View>
              {/* Camera icon */}
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 rounded-lg items-center justify-center">
                <Ionicons name="image-outline" size={16} color="white" />
              </View>
            </View>
          </View>

          {/* Profile Information */}
          <View className="space-y-6">
            {/* Name Field */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Name</Text>
                  <Text className="text-gray-900 font-semibold text-lg">
                    {user?.username || 'Sneezy'}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="create-outline" size={20} color="#14B8A6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Identifier Field */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <Text className="text-gray-600 text-sm mb-1">Identifiant</Text>
              <Text className="text-gray-900 font-semibold text-lg">456-QSNS-CIV</Text>
            </View>

            {/* Phone Number Field */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <Text className="text-gray-600 text-sm mb-1">Phone Number</Text>
              <Text className="text-gray-900 font-semibold text-lg">+2250715583531</Text>
            </View>

            {/* Label Field */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Label</Text>
                  <Text className="text-gray-900 font-semibold text-lg">Développeur</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="chevron-forward" size={20} color="#14B8A6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Field */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Info</Text>
                  <Text className="text-gray-900 font-semibold text-lg">Le temps c est de l argent..</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="create-outline" size={20} color="#14B8A6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delete Account Button */}
            <View className="mt-8">
              <TouchableOpacity 
                className="bg-white border border-gray-300 rounded-full py-4 px-8"
                onPress={() => router.push('/delete-account')}
              >
                <Text className="text-gray-700 font-semibold text-lg text-center">
                  Delete account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}