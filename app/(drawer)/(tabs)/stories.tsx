import React from 'react';
import { View, Text } from 'react-native';
import CustomHeader from '~/components/CustomHeader';

export default function StoriesScreen() {
  return (
    <>
      <CustomHeader 
        title="Stories"
        showMenuButton={true}
        showBackButton={false}
      />
      <View className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600">Stories</Text>
          <Text className="text-sm text-gray-400 mt-2">Coming soon...</Text>
        </View>
      </View>
    </>
  );
}