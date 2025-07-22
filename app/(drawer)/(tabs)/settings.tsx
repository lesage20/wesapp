import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '~/store/store';
import { AccountIcon, NotificationIcon, SecurityIcon, QrCodeIcon } from '~/assets/svgs/settings';
import InviteIcon from '~/assets/svgs/settings/add-account';
import MenuIcon from '~/assets/svgs/header/menu';

interface SettingsItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const settingsItems: SettingsItem[] = [
    {
      id: 'account',
      title: 'Change Account',
      icon: AccountIcon,
      onPress: () => console.log('Change Account'),
    },
    {
      id: 'privacy',
      title: 'Privacy and Security',
      icon: SecurityIcon,
      onPress: () => console.log('Privacy and Security'),
    },
    {
      id: 'notifications',
      title: 'Notifications and Sounds',
      icon: NotificationIcon,
      onPress: () => console.log('Notifications and Sounds'),
    },
    {
      id: 'invite',
      title: 'Invite a Contact',
      icon: InviteIcon,
      onPress: () => console.log('Invite a Contact'),
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
              className="p-2"
            >
              <MenuIcon width={24} height={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <View className=" mx-4 mt-4 rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* User Avatar */}
                <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center mr-4">
                  {user?.profileImage ? (
                    <Image 
                      source={{ uri: user.profileImage }} 
                      className="w-16 h-16 rounded-2xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-white font-bold text-xl">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
                
                {/* User Info */}
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    {user?.username || 'Sneezy'}
                  </Text>
                  <Text className="text-gray-600 mt-1">Développeur</Text>
                </View>
              </View>

              {/* QR Code Icon */}
              <TouchableOpacity className="w-10 h-10 items-center justify-center">
                <QrCodeIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Items */}
          <View className="px-4 mt-6 flex-column  gap-3">
            {settingsItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className="bg-white rounded-lg px-6 py-3 border border-gray-200 border-1 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 items-center justify-center mr-4">
                    <item.icon width={24} height={24} />
                  </View>
                  <Text className="text-gray-900 font-medium text-lg">
                    {item.title}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#14B8A6" 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Section */}
          <View className="px-4 mt-8 mb-8">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text className="text-red-500 font-semibold text-lg ml-3">
                Déconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}