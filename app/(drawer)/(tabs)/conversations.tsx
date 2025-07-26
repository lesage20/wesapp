import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ImageBackground, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import QrCodeIcon from '../../../assets/svgs/conversations/header-qr-code';
import MenuIcon from '~/assets/svgs/header/menu';
import CameraIcon from '~/assets/svgs/conversations/camera-scan';
import SmartAvatar from '~/components/SmartAvatar';
import { useMessages } from '~/hooks/api/useMessages';
import { useGroups } from '~/hooks/api/useGroups';
import { useContacts } from '~/hooks/api/useContacts';
import { useAuth } from '~/hooks/api/useAuth';
import { useWebSocket } from '~/hooks/api/useWebSocket';

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageTimeRaw: string;
  isGroup: boolean;
  unreadCount?: number;
  avatar?: string;
  profileImage?: string;
  participants?: any[];
  isOnline?: boolean;
}

export default function ConversationsScreen() {
  const [searchText, setSearchText] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();
  
  const { getConversationById, conversations: hookConversations, isLoading } = useMessages();
  const { loadGroups: getUserGroups, groups: hookGroups, isLoading: groupsLoading } = useGroups();
  const { fetchWeSappUsers } = useContacts();
  const { profile: currentUser } = useAuth();
  const [usersData, setUsersData] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const { addMessageListener, removeMessageListener } = useWebSocket();

  // Charger les conversations au montage
  useEffect(() => {
    loadConversationsData();
  }, []);

  // Charger les utilisateurs une seule fois au montage
  useEffect(() => {
    const loadUsers = async () => {
      if (usersLoaded) return; // Éviter les chargements multiples
      
      try {
        setUsersLoaded(true);
        const users = await fetchWeSappUsers();
        setUsersData(users);
      } catch (error) {
        console.error('[Conversations] Erreur lors du chargement des utilisateurs:', error);
        setUsersData([]);
        setUsersLoaded(false); // Permettre un nouveau try en cas d'erreur
      }
    };

    if (currentUser && !usersLoaded) {
      loadUsers();
    }
  }, [currentUser, usersLoaded]); // Plus de fetchWeSappUsers dans les dépendances

  // Écouter les nouveaux messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.action === 'new_message' && data.message) {
        // Mettre à jour la conversation avec le nouveau message
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.message.conversation_id) {
            return {
              ...conv,
              lastMessage: data.message.content || 'Nouveau message',
              lastMessageTime: formatMessageTime(data.message.timestamp),
              unreadCount: (conv.unreadCount || 0) + (data.message.sender_id !== currentUser?.id ? 1 : 0)
            };
          }
          return conv;
        }));
      }
    };

    addMessageListener('new_message', handleNewMessage);
    
    return () => {
      removeMessageListener('new_message', handleNewMessage);
    };
  }, [currentUser, addMessageListener, removeMessageListener]);

  const loadConversationsData = async () => {
    if (!currentUser) {
      console.log('[Conversations] Aucun utilisateur connecté, pas de chargement');
      return;
    }
    
    
    try {
      // Lancer les requêtes pour charger les données dans les hooks
      await Promise.all([
        getConversationById(currentUser?.code ).catch((err) => {
          console.error('[Conversations] Erreur lors du chargement des conversations:', err);
        }),
        getUserGroups(true).catch((err) => {
          console.error('[Conversations] Erreur lors du chargement des groupes:', err);
          return [];
        })
      ]);
      
      
    } catch (error) {
      console.error('[Conversations] Erreur lors du chargement des conversations:', error);
    }
  };

  // Traiter les données quand elles sont disponibles depuis les hooks
  useEffect(() => {
    if (!currentUser) return;
    
    const processConversationsData = async () => {
      try {
        const formattedConversations: ConversationItem[] = [];
        
        // Traitement des conversations individuelles depuis le hook
        if (Array.isArray(hookConversations)) {
          hookConversations.forEach((conv: any, index) => {
            let otherUser = null;
            let unreadCount = 0;
            let lastMessage = conv.last_message || conv.messages.at(-1)?.content || 'Aucun message'
            let lastMessageTime = conv.last_message || conv.messages.at(-1)?.timestamp || conv.created_at
            unreadCount = conv.participants.find((participant: any) => participant.id === currentUser?.id)?.unread_count || 0;
            if (!conv.is_group) {
              otherUser = conv.participants.find((participant: any) => participant.id !== currentUser?.id);
              
              if (!otherUser) {
                otherUser = conv.participants.find((participant: any) => participant.id === currentUser?.id);
                otherUser.username = `${currentUser?.username} ( Vous )`  ;
              }
              const formattedConv = {
                id: conv.id,
                name: otherUser.username || otherUser.code,
                lastMessage,
                lastMessageTime: formatMessageTime(lastMessageTime),
                lastMessageTimeRaw: lastMessageTime,
                isGroup: false,
                unreadCount,
                profileImage: otherUser.profile_image || otherUser.avatar,
                isOnline: false // TODO: Intégrer le statut en ligne
              };
              formattedConversations.push(formattedConv);
            } else {

              formattedConversations.push({
                id: conv.id,
                name: conv.name || 'Groupe',
                lastMessage,
                lastMessageTime: formatMessageTime(lastMessageTime),
                lastMessageTimeRaw: lastMessageTime,
                isGroup: true,
                unreadCount,
                profileImage: conv.profile_photo,
                participants: conv.members || []
              });
            }
                        
              
            
          });

          formattedConversations.sort((a, b) => {
            const timeA = new Date(a.lastMessageTimeRaw).getTime();
            const timeB = new Date(b.lastMessageTimeRaw).getTime();
            return timeB - timeA;
          });
        }
        
        
        setConversations(formattedConversations);
        
      } catch (error) {
        console.error('[Conversations] Erreur lors du traitement des conversations:', error);
      }
    };

    // Traiter les données quand les hooks ont fini de charger ET que les utilisateurs sont disponibles
    if (!isLoading && !groupsLoading && usersLoaded) {
      processConversationsData();
    }
  }, [hookConversations, hookGroups, currentUser, usersData, isLoading, groupsLoading, usersLoaded]);

  // Formater le temps du message
  const formatMessageTime = (timestamp: string | null) => {
    if (!timestamp) return 'Maintenant';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `il y a ${diffDays} jours`;
    } else {
      return messageDate.toLocaleDateString('fr-FR');
    }
  };

  // Filtrer les conversations selon la recherche
  const filteredConversations = useMemo(() => {
    if (!searchText.trim()) return conversations;
    
    const searchLower = searchText.toLowerCase();
    const filtered = conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchLower) ||
      conv.lastMessage.toLowerCase().includes(searchLower)
    );
    return filtered;
  }, [conversations, searchText]);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleAddPress = () => {
    router.push('/(modal)/new-discussion');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Conversations',
          headerShown: false,
        }} 
      />
      <View className="flex-1 pt-10">
        {/* Header with QR Code Scan */}
        <View className="bg-teal-700 px-4 pt-5 pb-10">
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity 
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
                className="p-2 bg-gray-200 rounded-lg"
              >
                <MenuIcon width={24} height={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* QR Code Scan Section */}
            <TouchableOpacity
              onPress={() => router.push('/(modal)/scan-qr')}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <ImageBackground 
                source={require('~/assets/images/header-qr-card.png')}
                className="rounded-2xl px-6 py-4 items-center overflow-hidden"
                resizeMode="cover"
              >
                <View className="w-32 h-32 bg-white rounded-2xl items-center justify-center mb-4">
                  {/* QR Code Placeholder */}
                  <View className="w-24 h-24 ">
                    <View className="flex-1 flex-row items-center justify-center">
                    <QrCodeIcon width={200} height={90}  className="text-black"/>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <CameraIcon width={20} height={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Scan</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>

        {/* White Content Section */}
        <View className="flex-1 bg-white rounded-t-3xl ">
          {/* Header */}
          <View className="flex-row items-center text-center justify-between px-6 py-4  rounded-t-3xl bg-white" style={{  top: -18, zIndex: 1000 }}>
            <Text className="text-2xl text-center font-bold text-gray-900 flex-1">Conversations</Text>
            <TouchableOpacity 
              className="w-10 h-10 bg-teal-700 rounded-full items-center justify-center"
              onPress={handleAddPress}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-4">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-0 border border-gray-200 border-1">
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

          {/* Conversations List */}
          <ScrollView 
            className="flex-1 px-6 my-0 py-0" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >

            {isLoading ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-gray-500">Chargement des conversations...</Text>
              </View>
            ) : filteredConversations.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg mt-4 mb-2">Aucune conversation</Text>
                <Text className="text-gray-400 text-center px-8">Commencez une nouvelle conversation en appuyant sur le bouton +</Text>
              </View>
            ) : (
              filteredConversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  className="flex-row items-center py-4 border-b border-gray-100"
                  onPress={() => handleConversationPress(conversation.id)}
                >
                  <View className="mr-4 relative">
                    {conversation.isGroup ? (
                      // Avatar de groupe
                      <View className="w-12 h-12 rounded-2xl bg-teal-100 items-center justify-center relative">
                        {conversation.profileImage ? (
                          <SmartAvatar 
                            user={{ profileImage: conversation.profileImage, name: conversation.name }} 
                            size={48} 
                          />
                        ) : (
                          <Ionicons name="people" size={24} color="#0F766E" />
                        )}
                        {/* Indicateur groupe */}
                        <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-600 rounded-full items-center justify-center">
                          <Ionicons name="people" size={8} color="white" />
                        </View>
                      </View>
                    ) : (
                      // Avatar utilisateur individuel
                      <View className="relative">
                        <SmartAvatar 
                          user={{ 
                            profileImage: conversation.profileImage, 
                            name: conversation.name,
                            id: conversation.id
                          }} 
                          size={48} 
                        />
                        {/* Indicateur en ligne (TODO: implémenter vraie logique) */}
                        {conversation.isOnline && (
                          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </View>
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-gray-900 font-semibold text-lg mr-2" numberOfLines={1}>
                          {conversation.name}
                        </Text>
                        {conversation.isGroup && (
                          <Ionicons name="people" size={16} color="#6B7280" />
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm">
                          {conversation.lastMessageTime}
                        </Text>
                        {(conversation.unreadCount || 0) > 0 && (
                          <View className="ml-2 bg-teal-600 rounded-full min-w-5 h-5 items-center justify-center px-1">
                            <Text className="text-white text-xs font-bold">
                              {conversation.unreadCount! > 99 ? '99+' : conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text className="text-gray-600" numberOfLines={1}>
                      {conversation.isGroup ? '👥 ' : ''}{conversation.lastMessage}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
          </ScrollView>
        </View>
      </View>
    </>
  );
}