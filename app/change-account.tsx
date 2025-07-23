import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';

interface Account {
  id: string;
  name: string;
  type: string;
  avatar?: string;
  avatarText?: string;
  avatarBg?: string;
  isActive?: boolean;
  isVerified?: boolean;
  notificationCount?: number;
  isSpecial?: boolean;
}

export default function ChangeAccountScreen() {
  const router = useRouter();

  const accounts: Account[] = [
    {
      id: 'sneezy',
      name: 'Sneezy',
      type: 'Développeur',
      avatarText: 'S',
      avatarBg: 'blue-500',
      isActive: true,
      isVerified: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      type: 'Personnel',
      avatarText: '🖼️',
      avatarBg: 'gray-400',
      isActive: false,
      isVerified: true,
      notificationCount: 0,
    },
    {
      id: 'narcisse6',
      name: 'Narcisse6',
      type: 'Personal',
      avatarText: 'OEUFS',
      avatarBg: 'orange-400',
      isActive: false,
      isVerified: true,
      notificationCount: 0,
      isSpecial: true,
    },
    {
      id: 'azerty',
      name: 'Azerty',
      type: 'Personnel',
      avatarText: '🖼️',
      avatarBg: 'gray-400',
      isActive: false,
      isVerified: true,
      notificationCount: 0,
    },
  ];

  const handleAccountSelect = (accountId: string) => {
    console.log('Switching to account:', accountId);
    // Handle account switch logic here
  };

  const handleAddAccount = () => {
    console.log('Add new account');
    // Handle add account logic here
  };

  return (
    <>
      <CustomHeader 
        title="Change Account"
        showBackButton={true}
        showMenuButton={false}
      />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Accounts List */}
          <View className="px-4 py-4">
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => handleAccountSelect(account.id)}
                className="flex-row items-center py-4 border-b border-gray-100"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                {/* Avatar */}
                <View className="mr-4 relative">
                  {account.isSpecial ? (
                    <View className="w-16 h-16 rounded-2xl bg-orange-400 items-center justify-center">
                      <View className="w-14 h-14 rounded-xl bg-yellow-400 items-center justify-center">
                        <Text className="text-black font-bold text-xs">OEUFS</Text>
                        <Text className="text-black text-xs">DE QUALITÉ</Text>
                        <Text className="text-red-500 font-bold text-xs">2.500</Text>
                      </View>
                    </View>
                  ) : (
                    <Avatar
                      text={account.avatarText}
                      size={64}
                      backgroundColor={account.avatarBg}
                    />
                  )}
                </View>

                {/* Account Info */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-900 font-semibold text-xl mr-2">
                      {account.name}
                    </Text>
                    {account.isVerified && (
                      <View className="w-6 h-6 bg-teal-500 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-600 text-base">{account.type}</Text>
                </View>

                {/* Right Side */}
                <View className="items-center">
                  {account.isActive ? (
                    <Ionicons name="checkmark" size={24} color="#14B8A6" />
                  ) : account.notificationCount !== undefined && account.notificationCount >= 0 ? (
                    <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {account.notificationCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add Account */}
            <TouchableOpacity
              onPress={handleAddAccount}
              className="flex-row items-center py-4 mt-4"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mr-4">
                <Ionicons name="person-add" size={24} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-semibold text-xl">
                Add an account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}