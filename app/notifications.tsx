import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '~/components/CustomHeader';

export default function NotificationsScreen() {
  const router = useRouter();
  const [callNotifications, setCallNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  return (
    <>
      <CustomHeader 
        title="Notification"
        showBackButton={true}
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-6 py-8">
          {/* Notification of Incoming Calls Section */}
          <View className="mb-8">
            <Text className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wide">
              NOTIFICATION OF INCOMING CALLS
            </Text>
            
            <View className="bg-white rounded-2xl border border-gray-200">
              {/* Display notification toggle */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <Text className="text-gray-900 font-medium text-lg">Display notification</Text>
                <Switch
                  value={callNotifications}
                  onValueChange={setCallNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                  thumbColor={callNotifications ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
              
              {/* Sound settings */}
              <View className="flex-row items-center justify-between p-4">
                <Text className="text-gray-900 font-medium text-lg">Son</Text>
                <Text className="text-gray-500 font-medium text-lg">Note</Text>
              </View>
            </View>
          </View>

          {/* Message Notification Section */}
          <View>
            <Text className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wide">
              MESSAGE NOTIFICATION
            </Text>
            
            <View className="bg-white rounded-2xl border border-gray-200">
              {/* Display notification toggle */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <Text className="text-gray-900 font-medium text-lg">Display notification</Text>
                <Switch
                  value={messageNotifications}
                  onValueChange={setMessageNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                  thumbColor={messageNotifications ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
              
              {/* Sound settings */}
              <View className="flex-row items-center justify-between p-4">
                <Text className="text-gray-900 font-medium text-lg">Son</Text>
                <Text className="text-gray-500 font-medium text-lg">Note</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}