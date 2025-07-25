import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import SmartAvatar from '~/components/SmartAvatar';
import { useContacts } from '~/hooks/api/useContacts';
import { useGroups } from '~/hooks/api/useGroups';
import { useAuth } from '~/hooks/api/useAuth';

interface Connection {
  id: string;
  name: string;
  username?: string;
  code: string;
  profileImage?: string;
}

export default function NewGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { fetchWeSappUsers, isLoading: contactsLoading } = useContacts();
  const { createGroup, isLoading: groupsLoading } = useGroups();
  const { currentUser } = useAuth();

  // Charger les connexions au montage
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const users = await fetchWeSappUsers();
      const formattedConnections: Connection[] = users
        .filter((user: any) => user.id !== currentUser?.id) // Exclure l'utilisateur actuel
        .map((user: any) => ({
          id: user.id,
          name: user.username || user.code,
          username: user.username,
          code: user.code,
          profileImage: user.profile_image || user.avatar,
        }));

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
      Alert.alert('Erreur', 'Impossible de charger les connexions');
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

  // Obtenir les connexions sélectionnées
  const selectedConnections = useMemo(() => {
    return connections.filter(conn => selectedMembers.includes(conn.id));
  }, [connections, selectedMembers]);

  // Toggle sélection d'un membre
  const toggleMemberSelection = (connectionId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(connectionId)) {
        return prev.filter(id => id !== connectionId);
      } else {
        if (prev.length >= 99) { // Max 99 + créateur = 100
          Alert.alert('Limite atteinte', 'Un groupe peut contenir maximum 100 membres');
          return prev;
        }
        return [...prev, connectionId];
      }
    });
  };

  // Supprimer un membre de la sélection
  const removeMember = (connectionId: string) => {
    setSelectedMembers(prev => prev.filter(id => id !== connectionId));
  };

  // Créer le groupe
  const handleCreateGroup = async () => {
    // Validation
    if (!groupName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le groupe');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un membre');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setIsLoading(true);

    try {
      const groupData = {
        name: groupName.trim(),
        members: selectedMembers, // IDs des membres sélectionnés
        admin: currentUser.id, // L'utilisateur actuel est l'admin
        profile_photo: null // TODO: Gérer l'upload de photo plus tard
      };

      const newGroup = await createGroup(groupData);

      if (newGroup) {
        Alert.alert(
          'Groupe créé',
          `Le groupe "${groupName}" a été créé avec succès.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Naviguer vers le chat du groupe
                router.push(`/chat/${newGroup.id}`);
              }
            }
          ]
        );
      } else {
        throw new Error('Échec de la création du groupe');
      }

    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer le groupe. Vérifiez votre connexion internet et réessayez.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || contactsLoading || groupsLoading;

  return (
    <>
      <CustomHeader 
        title="New Group"
        showBackButton={true}
        showMenuButton={false}
        rightContent={
          <TouchableOpacity 
            onPress={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedMembers.length === 0}
            className={`px-4 py-2 ${
              loading || !groupName.trim() || selectedMembers.length === 0
                ? 'opacity-50' 
                : ''
            }`}
          >
            <Text className="text-teal-600 font-medium text-lg">
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1">
          {/* Section supérieure - Détails du groupe */}
          <View className="px-6 py-4 border-b border-gray-100">
            {/* Nom du groupe avec icône photo */}
            <View className="flex-row items-center mb-4">
              <TouchableOpacity className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="#6B7280" />
              </TouchableOpacity>
              <TextInput
                className="flex-1 text-gray-900 text-lg font-medium"
                placeholder="Group Name"
                placeholderTextColor="#9CA3AF"
                value={groupName}
                onChangeText={setGroupName}
                editable={!loading}
              />
            </View>

            {/* Options du groupe */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">Ophemer Messages</Text>
              <Text className="text-gray-500">24 hours after</Text>
            </View>

            {/* Section MEMBERS avec preview */}
            <View>
              <Text className="text-gray-500 text-sm mb-3">
                MEMBERS: {selectedMembers.length}/100
              </Text>
              
              {selectedConnections.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                >
                  <View className="flex-row space-x-3 gap-3 py-1">
                    {selectedConnections.map((member) => (
                      <View key={member.id} className="items-center">
                        <View className="relative">
                          <SmartAvatar user={member} size={48} />
                          <TouchableOpacity 
                            className="absolute -top-1 -right-1 bg-gray-500 rounded-full w-5 h-5 items-center justify-center"
                            onPress={() => removeMember(member.id)}
                          >
                            <Text className="text-white text-xs font-bold">×</Text>
                          </TouchableOpacity>
                        </View>
                        <Text className="text-xs text-gray-600 mt-1 max-w-16" numberOfLines={1}>
                          {member.name.length > 8 ? member.name.substring(0, 8) + '...' : member.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>

          {/* Barre de recherche */}
          <View className="px-6 py-4">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Search connections"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Liste des connexions */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {loading ? (
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
                  {groupConnections.map((connection) => {
                    const isSelected = selectedMembers.includes(connection.id);
                    
                    return (
                      <TouchableOpacity
                        key={connection.id}
                        onPress={() => toggleMemberSelection(connection.id)}
                        className={`flex-row items-center px-6 py-3 ${
                          isSelected ? 'bg-teal-50' : 'bg-white'
                        }`}
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
                        
                        {/* Indicateur de sélection */}
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected 
                            ? 'bg-teal-600 border-teal-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}

            {/* Padding bottom pour éviter que le contenu soit caché */}
            <View className="h-4" />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}