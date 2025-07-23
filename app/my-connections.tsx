import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';

interface Connection {
  id: string;
  name: string;
  wesappCode: string;
  avatarText?: string;
  avatarBg?: string;
  avatarImage?: string;
  isSpecial?: boolean;
  isVerified?: boolean;
  hasHeart?: boolean;
}

export default function MyConnectionsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const connections: Connection[] = [
    {
      id: 'akissi',
      name: 'Akissi ❤️',
      wesappCode: 'YKB-7505-CIV',
      avatarText: '🖼️',
      avatarBg: 'gray-400',
      hasHeart: true,
    },
    {
      id: 'kamate',
      name: 'Kamaté drissa',
      wesappCode: '259-OIXQ-CIV',
      avatarText: '🖼️',
      avatarBg: 'gray-400',
    },
    {
      id: 'kouassi',
      name: 'Kouassi Affouet ❤️',
      wesappCode: '766-IWWK-CIV',
      avatarText: 'KA',
      avatarBg: 'red-500',
      hasHeart: true,
    },
    {
      id: 'narcisse',
      name: 'Narcisse professionnels',
      wesappCode: '526-LQ-025-CIV',
      avatarText: 'OEUFS',
      avatarBg: 'orange-400',
      isSpecial: true,
      isVerified: true,
    },
  ];

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchText.toLowerCase()) ||
    connection.wesappCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleConnectionPress = (connection: Connection) => {
    router.push({
      pathname: '/(modal)/connection-detail',
      params: { 
        connectionId: connection.id,
        name: connection.name,
        wesappCode: connection.wesappCode,
        avatarText: connection.avatarText,
        avatarBg: connection.avatarBg,
        isSpecial: connection.isSpecial ? 'true' : 'false',
        isVerified: connection.isVerified ? 'true' : 'false',
        hasHeart: connection.hasHeart ? 'true' : 'false',
      }
    });
  };

  const getConnectionsByLetter = () => {
    const grouped: { [key: string]: Connection[] } = {};
    
    filteredConnections.forEach(connection => {
      const firstLetter = connection.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(connection);
    });

    return Object.keys(grouped).sort().map(letter => ({
      letter,
      connections: grouped[letter]
    }));
  };

  return (
    <>
      <CustomHeader 
        title="My Connections"
        showBackButton={true}
        showMenuButton={false}
      />
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Search Bar */}
          <View className="px-6 py-4">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          {/* Connections List */}
          <ScrollView className="flex-1">
            {getConnectionsByLetter().map(({ letter, connections }) => (
              <View key={letter}>
                {/* Letter Separator */}
                <View className="px-6 py-2">
                  <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center">
                    <Text className="text-teal-600 font-bold text-lg">{letter}</Text>
                  </View>
                </View>

                {/* Connections for this letter */}
                {connections.map((connection) => (
                  <TouchableOpacity
                    key={connection.id}
                    onPress={() => handleConnectionPress(connection)}
                    className="flex-row items-center px-6 py-4 border-b border-gray-100"
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    {/* Avatar */}
                    <View className="mr-4">
                      {connection.isSpecial ? (
                        <View className="w-16 h-16 rounded-2xl bg-orange-400 items-center justify-center">
                          <View className="w-14 h-14 rounded-xl bg-yellow-400 items-center justify-center">
                            <Text className="text-black font-bold text-xs">OEUFS</Text>
                            <Text className="text-black text-xs">DE QUALITÉ</Text>
                            <Text className="text-red-500 font-bold text-xs">2.500</Text>
                          </View>
                        </View>
                      ) : (
                        <Avatar
                          text={connection.avatarText}
                          size={64}
                          backgroundColor={connection.avatarBg}
                        />
                      )}
                    </View>

                    {/* Connection Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-900 font-semibold text-lg mr-2">
                          {connection.name}
                        </Text>
                        {connection.isVerified && (
                          <View className="w-6 h-6 bg-teal-500 rounded-full items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="white" />
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-600 text-base">{connection.wesappCode}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {filteredConnections.length === 0 && (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-gray-500 text-lg">No connections found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}