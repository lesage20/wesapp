import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { AccountIcon, NotificationIcon, SecurityIcon, QrCodeIcon } from '~/assets/svgs/settings';
import InviteIcon from '~/assets/svgs/settings/add-account';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';
import { getTailwindColor } from '~/utils/colors';

interface SettingsItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const settingsItems: SettingsItem[] = [
    {
      id: 'account',
      title: 'Change Account',
      icon: AccountIcon,
      onPress: () => router.push('/change-account'),
    },
    {
      id: 'privacy',
      title: 'Privacy and Security',
      icon: SecurityIcon,
      onPress: () => router.push('/privacy-and-security'),
    },
    {
      id: 'notifications',
      title: 'Notifications and Sounds',
      icon: NotificationIcon,
      onPress: () => router.push('/notifications'),
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
      <CustomHeader 
        title="Settings"
        showMenuButton={true}
        showBackButton={false}
      />
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <View className=" mx-4  rounded-2xl px-6 pb-4 pt-2shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* User Avatar */}
                <TouchableOpacity 
                  className="mr-4"
                  onPress={() => {
                    console.log('Navigating to profile from settings');
                    router.push('/profile');
                  }}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Avatar
                    imageUrl={user?.profileImage}
                    text={(user?.username && user.username.length > 0) ? user.username : 'Sneezy'}
                    size={64}
                    backgroundColor="teal-700"
                  />
                </TouchableOpacity>
                
                {/* User Info */}
                <TouchableOpacity 
                  className="flex-1"
                  onPress={() => {
                    console.log('Navigating to profile from username');
                    router.push('/profile');
                  }}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Text className="text-xl font-bold text-gray-900">
                    {(user?.username && user.username.length > 0) ? user.username : 'Sneezy'}
                  </Text>
                  <Text className="text-gray-600 mt-1">Développeur</Text>
                </TouchableOpacity>
              </View>

              {/* QR Code Icon */}
              <TouchableOpacity 
                className="w-10 h-10 items-center justify-center"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
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
                className=" rounded-lg px-6 py-3 border border-gray-200 border-1 shadow-sm flex-row items-center justify-between"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
                  color={getTailwindColor('teal-700')} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Section */}
          <View className="px-4 mt-8 mb-8">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex-row items-center justify-center"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="log-out-outline" size={24} color={getTailwindColor('red-500')} />
              <Text className="text-red-500 font-semibold text-lg ml-3">
                Déconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}