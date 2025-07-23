import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/store';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';
import CameraIcon from '~/assets/svgs/camera';
import { getTailwindColor } from '~/utils/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <>
      <CustomHeader 
        title="Profile"
        showBackButton={true}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-6 ">
          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <View className="relative">
              {/* Main avatar with complex design */}
              <Avatar size={100} text={user?.username?.charAt(0)} backgroundColor="teal-700" />
              {/* Camera icon */}
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-lg items-center justify-center">
                <CameraIcon width={16} height={16} color="white" />
              </View>
            </View>
          </View>

          {/* Profile Information Card */}
          <View className="bg-white rounded-2xl border border-gray-200 mb-6">
            {/* Name Field */}
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Name</Text>
                  <Text className="text-gray-900 font-semibold text-lg">
                    {user?.username || 'Sneezy'}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="pencil-outline" size={20} color={getTailwindColor('teal-700')} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Separator */}
            <View className="h-px bg-gray-200 mx-4" />

            {/* Identifier Field */}
            <View className="p-4">
              <Text className="text-gray-600 text-sm mb-1">Identifiant</Text>
              <Text className="text-gray-900 font-semibold text-lg">456-QSNS-CIV</Text>
            </View>

            {/* Separator */}
            <View className="h-px bg-gray-200 mx-4" />

            {/* Phone Number Field */}
            <View className="p-4">
              <Text className="text-gray-600 text-sm mb-1">Phone Number</Text>
              <Text className="text-gray-900 font-semibold text-lg">+2250715583531</Text>
            </View>

            {/* Separator */}
            <View className="h-px bg-gray-200 mx-4" />

            {/* Label Field */}
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Label</Text>
                  <Text className="text-gray-900 font-semibold text-lg">Développeur</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="chevron-forward" size={20} color={getTailwindColor('teal-700')} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Info Field - Separate Card */}
          <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-8">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm mb-1">Info</Text>
                <Text className="text-gray-900 font-semibold text-lg">Le temps c est de l argent..</Text>
              </View>
              <TouchableOpacity className="p-2">
                <Ionicons name="pencil-outline" size={20} color={getTailwindColor('teal-700')} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Account Button */}
          <View className="items-center">
            <TouchableOpacity 
              className="bg-white border border-gray-300 rounded-full py-4 px-8"
              onPress={() => router.push('/delete-account')}
            >
              <Text className="text-gray-700 font-semibold text-lg text-center">
                Delete account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}