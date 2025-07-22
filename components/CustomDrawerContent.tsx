import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '~/store/store';
import { icons } from '~/assets/svgs/drawer';
import { Ionicons } from '@expo/vector-icons';

interface DrawerMenuItem {
  name: string;
  label: string;
  icon: keyof typeof icons;
  badge?: number;
  onPress: () => void;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuthStore();

  const menuItems: DrawerMenuItem[] = [
    {
      name: '(tabs)',
      label: 'Conversations',
      icon: '(tabs)',
      badge: 3,
      onPress: () => props.navigation.navigate('(tabs)'),
    },
    {
      name: 'connections',
      label: 'My Connections',
      icon: '(connections)',
      badge: 3,
      onPress: () => {
        // Navigate to connections screen
        console.log('Navigate to connections');
      },
    },
    {
      name: 'active-call',
      label: 'active-call',
      icon: 'active-call',
      badge: 3,
      onPress: () => {
        // Navigate to active call screen
        console.log('Navigate to active call');
      },
    },
    {
      name: 'call-history',
      label: 'call-history',
      icon: 'call-history',
      badge: 3,
      onPress: () => {
        // Navigate to call history screen
        console.log('Navigate to call history');
      },
    },
  ];

  const handleBuyCode = () => {
    console.log('Buy WeSapp Code');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* User Header */}
        <View className="px-6 py-8 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center mr-3">
                <Text className="text-white font-bold text-lg">S</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {user?.username || 'Sneezy'}
                </Text>
                <Text className="text-sm text-gray-600">Développeur</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 py-4">
          {menuItems.map((item) => {
            const IconComponent = icons[item.icon];
            return (
              <TouchableOpacity
                key={item.name}
                onPress={item.onPress}
                className="flex-row items-center py-4 px-4 rounded-lg mb-2"
              >
                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <IconComponent width={24} height={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">
                    {item.label}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {item.badge && (
                    <View className="w-6 h-6 rounded-full bg-teal-500 items-center justify-center mr-2">
                      <Text className="text-white text-xs font-bold">
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Bottom Action */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleBuyCode}
          className="border-2 border-teal-600 rounded-full py-3 px-6 flex-row items-center justify-center"
        >
          <View className="w-6 h-6 bg-teal-600 rounded mr-3 items-center justify-center">
            <Text className="text-white text-xs font-bold">W</Text>
          </View>
          <Text className="text-teal-600 font-semibold">
            Acheter un autre code WeSapp
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}