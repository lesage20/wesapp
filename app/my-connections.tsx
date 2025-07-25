import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import SmartAvatar from '~/components/SmartAvatar';
import { useContacts } from '~/hooks/api/useContacts';
import { useOnlineStatus } from '~/hooks/api/useOnlineStatus';
import { useAuth } from '~/hooks/api/useAuth';

interface Connection {
  id: string;
  name: string;
  username?: string;
  wesappCode: string;
  profileImage?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
}

export default function MyConnectionsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({});

  const { fetchWeSappUsers, isLoading: contactsLoading } = useContacts();
  const { 
    connect: connectStatus, 
    requestUserStatus, 
    addStatusListener,
    removeStatusListener 
  } = useOnlineStatus();
  const { currentUser } = useAuth();

  // Charger les connexions au montage
  useEffect(() => {
    loadConnections();
  }, []);

  // Configurer le statut en ligne
  useEffect(() => {
    const setupOnlineStatus = async () => {
      if (!currentUser?.code) return;
      
      try {
        await connectStatus(currentUser.code);
        
        // Écouter les changements de statut
        const handleStatusUpdate = (data: any) => {
          if (data.action === 'status_update' && data.user_code) {
            setOnlineStatuses(prev => ({
              ...prev,
              [data.user_code]: data.status === 'online'
            }));
          }
        };
        
        addStatusListener('status_update', handleStatusUpdate);
        
        // Demander le statut de toutes les connexions
        connections.forEach(conn => {
          if (conn.wesappCode) {
            requestUserStatus(conn.wesappCode);
          }
        });
        
        return () => {
          removeStatusListener('status_update', handleStatusUpdate);
        };
      } catch (error) {
        console.error('Erreur lors de la configuration du statut en ligne:', error);
      }
    };
    
    if (connections.length > 0) {
      setupOnlineStatus();
    }
  }, [connections, currentUser, connectStatus, requestUserStatus, addStatusListener, removeStatusListener]);

  const loadConnections = async () => {
    setIsLoading(true);
    
    try {
      const users = await fetchWeSappUsers();
      const formattedConnections: Connection[] = users
        .filter((user: any) => user.id !== currentUser?.id) // Exclure l'utilisateur actuel
        .map((user: any) => ({
          id: user.id,
          name: user.username || user.code,
          username: user.username,
          wesappCode: user.code,
          profileImage: user.profile_image || user.avatar,
          isVerified: user.is_verified || false,
          isOnline: false, // Sera mis à jour par le WebSocket
          lastSeen: user.last_seen
        }));

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
      Alert.alert('Erreur', 'Impossible de charger les connexions');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les connexions selon la recherche
  const filteredConnections = useMemo(() => {
    if (!searchText.trim()) return connections;
    
    const searchLower = searchText.toLowerCase();
    return connections.filter(connection =>
      connection.name.toLowerCase().includes(searchLower) ||
      connection.wesappCode.toLowerCase().includes(searchLower) ||
      (connection.username && connection.username.toLowerCase().includes(searchLower))
    );
  }, [connections, searchText]);

  const handleConnectionPress = (connection: Connection) => {
    // Naviguer vers le chat avec cette connexion
    router.push(`/chat/${connection.id}`);
  };

  // Grouper les connexions par première lettre
  const getConnectionsByLetter = useMemo(() => {
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
      connections: grouped[letter].map(conn => ({
        ...conn,
        isOnline: onlineStatuses[conn.wesappCode] || false
      }))
    }));
  }, [filteredConnections, onlineStatuses]);

  return (
    <>
      <CustomHeader 
        title="My Connections"
        showBackButton={true}
        showMenuButton={false}
      />
      <View className="flex-1 bg-white">
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
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Connections List */}
          <ScrollView className="flex-1">
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-gray-500 text-lg">Chargement des connexions...</Text>
              </View>
            ) : getConnectionsByLetter.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4 mb-2">Aucune connexion</Text>
                <Text className="text-gray-400 text-center px-8">Ajoutez des contacts pour commencer à discuter</Text>
              </View>
            ) : (
              getConnectionsByLetter.map(({ letter, connections }) => (
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
                      {/* Avatar avec indicateur en ligne */}
                      <View className="mr-4 relative">
                        <SmartAvatar
                          user={{
                            name: connection.name,
                            username: connection.username,
                            profileImage: connection.profileImage
                          }}
                          size={64}
                        />
                        {/* Indicateur en ligne */}
                        {connection.isOnline && (
                          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
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
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-base">{connection.wesappCode}</Text>
                          <Text className="text-gray-400 text-sm">
                            {connection.isOnline ? 'En ligne' : 'Hors ligne'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </>
  );
}