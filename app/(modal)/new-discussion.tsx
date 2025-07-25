import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import SmartAvatar from '~/components/SmartAvatar';
import { useContacts } from '~/hooks/api/useContacts';
import { useMessages } from '~/hooks/api/useMessages';

interface Connection {
  id: string;
  name: string;
  username?: string;
  code: string;
  profileImage?: string;
  lastMessageTime?: string;
  isFrequent?: boolean;
}

export default function NewDiscussionScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [frequentContacts, setFrequentContacts] = useState<Connection[]>([]);
  
  const { fetchWeSappUsers, isLoading: contactsLoading } = useContacts();
  const { getConversations, isLoading: conversationsLoading } = useMessages();

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les connexions
      const users = await fetchWeSappUsers();
      const formattedConnections: Connection[] = users.map((user: any) => ({
        id: user.id,
        name: user.username || user.code,
        username: user.username,
        code: user.code,
        profileImage: user.profile_image || user.avatar,
      }));

      setConnections(formattedConnections);

      // Charger les conversations récentes pour déterminer les contacts fréquents
      try {
        const conversations = await getConversations();
        const recentConversations = conversations
          .filter((conv: any) => conv.last_message_time)
          .sort((a: any, b: any) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
          .slice(0, 5); // Top 5 conversations récentes

        const frequentIds = recentConversations.map((conv: any) => conv.other_user_id || conv.participant_id);
        const frequent = formattedConnections.filter(conn => frequentIds.includes(conn.id));
        
        setFrequentContacts(frequent);
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        // En cas d'erreur, prendre les 3 premiers contacts comme fréquents
        setFrequentContacts(formattedConnections.slice(0, 3));
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    }
  };

  // Filtrer les connexions selon la recherche
  const filteredConnections = useMemo(() => {
    if (!searchText.trim()) return connections;
    
    const searchLower = searchText.toLowerCase();
    return connections.filter(conn => 
      conn.name.toLowerCase().includes(searchLower) ||
      conn.code.toLowerCase().includes(searchLower) ||
      (conn.username && conn.username.toLowerCase().includes(searchLower))
    );
  }, [connections, searchText]);

  // Grouper les connexions par première lettre
  const groupedConnections = useMemo(() => {
    const groups: { [key: string]: Connection[] } = {};
    
    filteredConnections.forEach(conn => {
      const firstLetter = conn.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(conn);
    });

    return Object.keys(groups)
      .sort()
      .map(letter => ({
        letter,
        connections: groups[letter]
      }));
  }, [filteredConnections]);

  // Générer l'index alphabétique
  const alphabetIndex = useMemo(() => {
    return groupedConnections.map(group => group.letter);
  }, [groupedConnections]);

  const handleConnectionPress = (connection: Connection) => {
    // Naviguer vers le chat avec cette connexion
    router.push(`/chat/${connection.id}`);
  };

  const scrollToLetter = (letter: string) => {
    // TODO: Implémenter le scroll vers la section de la lettre
    console.log('Scroll to letter:', letter);
  };

  const isLoading = contactsLoading || conversationsLoading;

  return (
    <>
      <CustomHeader 
        title="Discussion"
        showBackButton={true}
        showMenuButton={false}
      />
      
      <View className="flex-1 bg-white">
        {/* Barre de recherche */}
        <View className="px-6 py-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Boutons New Group et New Contact */}
        <View className="px-6 mb-4 gap-3 space-y-3">
          <TouchableOpacity 
            className="flex-row items-center bg-gray-50 rounded-full px-4 py-4 border border-gray-200"
            onPress={() => router.push('/(modal)/new-group')}
          >
            <Ionicons name="people-outline" size={24} color="#0F766E" />
            <Text className="ml-3 text-gray-900 font-medium">New group</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-gray-50 rounded-full px-4 py-4 border border-gray-200"
            onPress={() => router.push('/(modal)/new-contact')}
          >
            <Ionicons name="person-add-outline" size={24} color="#0F766E" />
            <Text className="ml-3 text-gray-900 font-medium">New Contact</Text>
            <View className="ml-auto">
              <Ionicons name="qr-code-outline" size={20} color="#0F766E" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row">
          {/* Liste des connexions */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Section Frequent Contact */}
            {!searchText && frequentContacts.length > 0 && (
              <View className="mb-6">
                <View className="px-6 py-2">
                  <Text className="text-gray-600 font-medium">Frequent Contact</Text>
                </View>
                {frequentContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    onPress={() => handleConnectionPress(contact)}
                    className="flex-row items-center px-6 py-3"
                  >
                    <SmartAvatar user={contact} size={48} className="mr-4" />
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium text-lg">
                        {contact.name}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {contact.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Section My Connections */}
            <View>
              <View className="px-6 py-2">
                <Text className="text-gray-600 font-medium">My Connections</Text>
              </View>

              {isLoading ? (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-gray-500">Loading connections...</Text>
                </View>
              ) : groupedConnections.length === 0 ? (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-gray-500">No connections found</Text>
                </View>
              ) : (
                groupedConnections.map(({ letter, connections: groupConnections }) => (
                  <View key={letter}>
                    {/* Séparateur de lettre */}
                    <View className="px-6 py-2">
                      <Text className="text-teal-600 font-bold text-lg">{letter}</Text>
                    </View>

                    {/* Connexions pour cette lettre */}
                    {groupConnections.map((connection) => (
                      <TouchableOpacity
                        key={connection.id}
                        onPress={() => handleConnectionPress(connection)}
                        className="flex-row items-center px-6 py-3"
                      >
                        <SmartAvatar user={connection} size={48} className="mr-4" />
                        <View className="flex-1">
                          <Text className="text-gray-900 font-medium text-lg">
                            {connection.name}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {connection.code}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Index alphabétique */}
          {alphabetIndex.length > 0 && (
            <View className="w-8 py-4 items-center">
              {alphabetIndex.map((letter) => (
                <TouchableOpacity
                  key={letter}
                  onPress={() => scrollToLetter(letter)}
                  className="py-1"
                >
                  <Text className="text-teal-600 text-xs font-medium">
                    {letter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </>
  );
}