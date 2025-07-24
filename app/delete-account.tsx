import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/store';
import CustomHeader from '~/components/CustomHeader';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <>
      <CustomHeader 
        title="Delete Account"
        showBackButton={true}
      />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6 py-8">
          {/* Warning Icon and Title */}
          <View className="flex-row items-start mb-8">
            <View className="w-12 h-12 items-center justify-center mr-4 mt-1">
              <Ionicons name="trash-outline" size={32} color="#6B7280" />
            </View>
            <Text className="text-gray-900 text-lg font-medium flex-1">
              Deleting your 456-QSNS-CIV account will:
            </Text>
          </View>

          {/* Consequences List */}
          <View className="space-y-6 mb-12">
            <Text className="text-gray-700 text-base leading-6">
              - Delete the identifier ( <Text className="font-semibold">456-QSNS-CIV</Text> ), his information, his contacts and his profile picture.
            </Text>
            
            <Text className="text-gray-700 text-base leading-6">
              - Delete message and call history.
            </Text>
            
            <Text className="text-gray-700 text-base leading-6">
              - Make you leave all the groups.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4">
            {/* Cancel Button */}
            <TouchableOpacity 
              className="bg-teal-600 rounded-full py-4 px-8"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold text-lg text-center">
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity 
              className="py-4 px-8"
              onPress={handleDeleteAccount}
            >
              <Text className="text-teal-600 font-semibold text-lg text-center">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}