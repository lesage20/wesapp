import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';

export default function PrivacyAndSecurityScreen() {
  const router = useRouter();
  const [allowIncomingCalls, setAllowIncomingCalls] = useState(true);

  return (
    <>
      <CustomHeader 
        customTitle={
          <View className="items-center">
            <Text className="text-gray-900 font-semibold text-lg">Privacy and</Text>
            <Text className="text-gray-900 font-semibold text-lg">Security</Text>
          </View>
        }
        showBackButton={true}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-6 py-8">
          {/* Settings Items */}
          <View className="space-y-4 gap-y-2">
            {/* Blocks */}
            <TouchableOpacity className="bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center justify-between">
              <Text className="text-gray-900 font-medium text-lg">Blocks</Text>
              <Ionicons name="chevron-forward" size={20} color="#14B8A6" />
            </TouchableOpacity>

            {/* Allow incoming calls */}
            <View className="bg-white rounded-2xl px-4 py-2 border border-gray-200 flex-row items-center justify-between">
              <Text className="text-gray-900 font-medium text-md">Allow incoming calls</Text>
              <Switch
                value={allowIncomingCalls}
                onValueChange={setAllowIncomingCalls}
                trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                thumbColor={allowIncomingCalls ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {/* Ephemeral Messages */}
            <TouchableOpacity className="bg-white rounded-2xl p-4 border border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 font-medium text-lg">Ephemeral Messages</Text>
              </View>
              <Text className="text-gray-600 text-base">24 hours after..</Text>
            </TouchableOpacity>

            {/* Description text */}
            <Text className="text-gray-500 text-sm leading-5 px-2 mt-4">
              Set a default timer for ephemeral messages for all new conversations you start.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}