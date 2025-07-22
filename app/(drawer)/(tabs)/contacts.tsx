import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function ContactsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Contacts', headerShown: true }} />
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600">Contacts</Text>
          <Text className="text-sm text-gray-400 mt-2">Coming soon...</Text>
        </View>
      </SafeAreaView>
    </>
  );
}