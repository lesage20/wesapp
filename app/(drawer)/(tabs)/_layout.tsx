import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { icons } from '~/assets/svgs/tabbar-icon';
import { getTailwindColor } from '~/utils/colors';
import onlineService from '~/services/websocket_status.service';
import { useProfile } from '~/hooks/api/useProfile';
import { useEffect } from 'react';

export default function TabLayout() {
  const { profile: currentUser } = useProfile();
  const TabBarIcon = ({ name, focused }: { name: keyof typeof icons; focused: boolean }) => {
    const IconComponent = icons[name];
    return (
      <View className="items-center relative">
        {/* Top border for active tab */}
        {focused && (
          <View 
            className="absolute -top-3 left-1/2 w-8 h-1 bg-teal-700 "
            style={{ transform: [{ translateX: -16 }] }}
          />
        )}
        <IconComponent 
          width={24} 
          height={24} 
          color={focused ? getTailwindColor('teal-700') : '#9CA3AF'} 
        />
      </View>
    );
  };

  useEffect(() => {
    if (currentUser) {
      onlineService.connect(currentUser.id);
    }
  }, [currentUser]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: getTailwindColor('teal-700'),
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 12,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calls',
          tabBarIcon: ({ focused }) => (
            <View className="relative">
              <TabBarIcon name="calls" focused={focused} />
              <View className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Conversations',
          tabBarIcon: ({ focused }) => <TabBarIcon name="conversations" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ focused }) => <TabBarIcon name="stories" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ focused }) => <TabBarIcon name="contacts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
