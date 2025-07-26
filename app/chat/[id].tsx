import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ImageBackground, Alert, Clipboard, Vibration, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomHeader from '~/components/CustomHeader';
import MessageBubble, { Message, MessageReaction, MessageLocation, MessageContact, MessageDocument } from '~/components/MessageBubble';
import ReactionPicker from '~/components/ReactionPicker';
import ReplyPreview from '~/components/ReplyPreview';
import MessageActions from '~/components/MessageActions';
import MediaAttachmentMenu from '~/components/MediaAttachmentMenu';
import WhatsAppAudioRecorder from '~/components/WhatsAppAudioRecorder';
import ImageViewerModal from '~/components/ImageViewerModal';
import VideoPlayer from '~/components/VideoPlayer';
import VideoCallIcon from '~/assets/svgs/chat/video-call';
import VoiceCallIcon from '~/assets/svgs/chat/voice-call';
import SendIcon from '~/assets/svgs/chat/send';
import MicIcon from '~/assets/svgs/chat/mic';

// Import des hooks API
import { useMessages } from '~/hooks/api/useMessages';
import { useWebSocket, WebSocketMessage } from '~/hooks/api/useWebSocket';
import { useProfile } from '~/hooks/api/useProfile';
import { useContacts } from '~/hooks/api/useContacts';
import { useOnlineStatus } from '~/hooks/api/useOnlineStatus';
import { SendMessagePayload, WebSocketAction } from '~/hooks/types';
import onlineService from '~/services/websocket_status.service';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [messageActionsPosition, setMessageActionsPosition] = useState({ x: 0, y: 0 });
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Hooks API
  const {
    isLoading,
    getConversationWithMessages,
    fetchConversationById,
    sendMessage: sendMessageAPI,
    createGroupConversation,
    setReaction: setMessageReaction,
    setReplyToMessage: setReplyToMessageAPI
  } = useMessages();

  const {
    isConnected: wsConnected,
    connectionStatus,
    subscribeToConversation,
    unsubscribeFromConversation,
    addMessageListener,
    sendMessage: sendMessageWS,
    removeMessageListener,
    markMessageAsRead,
    deleteMessage: deleteMessageWS,
    activeConversationId,
    handleMessage
  } = useWebSocket();

  const { profile: currentUser } = useProfile();
  const { isLoading: contactsLoading, getWeSappUsers } = useContacts();
  const {
    isConnected: statusConnected,
    connect: connectStatus,
    requestUserStatus,
    addStatusListener
  } = useOnlineStatus();

  const [contactInfo, setContactInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);


  // Charger les données de conversation réelles
  const loadConversationData = useCallback(async () => {
    if (!id || !currentUser) {
      console.log('[Chat] ID de conversation ou utilisateur manquant');
      return;
    }

    try {

      // Charger la conversation avec ses messages
      const conversationData = await getConversationWithMessages(id as string);

      if (conversationData) {
        // Charger les informations de l'autre utilisateur
        const otherUserData = await fetchConversationById(id as string, currentUser.id);

        if (otherUserData?.connection) {
          const data = otherUserData.connection;
          setContactInfo({
            name: data.username,
            shortName: data.username || data.code,
            avatar: data.username ? data.username.charAt(0).toUpperCase() : 'U',
            avatarBg: 'teal-500',
            profileImage: data.userphoto || data.avatar,
            code: data.code,
            ...data
          });
        }

        // Traiter les messages s'ils existent
        if (conversationData.messages && Array.isArray(conversationData.messages)) {
          const formattedMessages: Message[] = conversationData.messages.map((msg: any) => {
            // Détecter le type de message basé sur le contenu et les champs
            let messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' = 'text';

            if (msg.media_url) {
              if (msg.media_url.includes('image') || msg.media_url.match(/\.(jpg|jpeg|png|gif)$/i)) {
                messageType = 'image';
              } else if (msg.media_url.includes('audio') || msg.media_url.match(/\.(mp3|wav|m4a)$/i)) {
                messageType = 'audio';
              } else if (msg.media_url.includes('video') || msg.media_url.match(/\.(mp4|mov|avi)$/i)) {
                messageType = 'video';
              } else {
                messageType = 'document';
              }
            } else if (msg.location_id) {
              messageType = 'location';
            }

            const formattedMessage: Message = {
              id: msg.id.toString(),
              type: messageType,
              content: msg.content || '',
              isOwn: msg.sender?.id === currentUser.id,
              timestamp: new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              reactions: msg.reactions ? Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => ({
                emoji,
                users: Array.isArray(users) ? users : []
              })) : []
            };

            // Ajouter les propriétés spécifiques selon le type
            if (messageType === 'image' && msg.media_url) {
              formattedMessage.imageUrl = msg.media_url;
            } else if (messageType === 'audio' && msg.media_url) {
              formattedMessage.audioUrl = msg.media_url;
              formattedMessage.audioDuration = msg.duration || 0;
            } else if (messageType === 'video' && msg.media_url) {
              formattedMessage.videoUrl = msg.media_url;
              formattedMessage.videoDuration = msg.duration || 0;
            } else if (messageType === 'document' && msg.media_url) {
              formattedMessage.document = {
                name: msg.content || 'Document',
                url: msg.media_url,
                size: msg.file_size || 0,
                type: msg.media_type || 'unknown'
              };
            }

            // Gérer les réponses
            if (msg.reply) {
              formattedMessage.replyTo = msg.reply.toString();
            }

            return formattedMessage;
          });

          // Trier les messages par timestamp
          // formattedMessages.sort((a, b) => {
          //   const timeA = new Date('1970-01-01 ' + a.timestamp).getTime();
          //   const timeB = new Date('1970-01-01 ' + b.timestamp).getTime();
          //   return timeA - timeB;
          // });

          setMessages(formattedMessages);
          console.log('[Chat] Messages formatés:', formattedMessages.length);
        }
      }
    } catch (error) {
      console.error('[Chat] Erreur lors du chargement de la conversation:', error);
    }
  }, [id, currentUser, getConversationWithMessages, fetchConversationById]);

  useEffect(() => {
    console.log('[Chat] id', id);
    loadConversationData();
    // websocketService.connect(id as string);

  }, []);

  // Fonction pour gérer les nouveaux messages WebSocket
  const handleNewMessage = useCallback((data: any) => {
    console.log('[Chat] Nouveau message WebSocket:', data);

    if (data.action === 'new_message' && data.message && data.message.conversation === id) {
      const newMessage = data.message;

      // Formatter le message reçu
      const formattedMessage: Message = {
        id: newMessage.id.toString(),
        type: 'text', // Adapter selon le type
        content: newMessage.content || '',
        isOwn: newMessage.sender?.id === currentUser.id,
        timestamp: new Date(newMessage.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        reactions: []
      };

      // Ajouter le message s'il n'existe pas déjà
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === formattedMessage.id);
        if (!exists) {
          return [...prev, formattedMessage];
        }
        return prev;
      });

      // Scroll automatique si c'est un nouveau message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [id, currentUser]);

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (!id || !currentUser) return;

    // S'abonner aux messages de cette conversation
    subscribeToConversation(id as string).then((success) => {
      console.log('subscribeToConversation', success);
    });
    addMessageListener('new_message', handleNewMessage);
    addMessageListener('send_message', (data) => {
      console.log('send_message', data);
    });

    onlineService.addMessageListener('online_status', (data) => {
      console.log('online_status', data);
      console.log('contactInfo', contactInfo);
      if (data.user_code === contactInfo?.usercode) {
        setIsOnline(data.is_online);
      }
    });

    return () => {
      // unsubscribeFromConversation(id as string);
      // removeMessageListener('new_message', handleNewMessage);
    };
  }, [id, currentUser, contactInfo, handleMessage]);

  useEffect(() => {
    if (!id || !currentUser) return;
    onlineService.connect(currentUser.id);
    onlineService.requestUserStatus(contactInfo?.usercode || '');
  }, [id, contactInfo]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || !currentUser) return;

    const messageContent = message.trim();
    const replyToId = replyToMessage?.id;

    // Optimistic update - ajouter le message immédiatement à l'interface
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      type: 'text',
      content: messageContent,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToId
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setMessage('');
    setReplyToMessage(null);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Envoyer le message via l'API
      const messagePayload: SendMessagePayload = {
        conversation: id as string,
        content: messageContent,
        sender_id: currentUser.id,
        sender_code: currentUser.code || '',
        sender_username: currentUser.username || '',
        sender_profile_photo: currentUser.profile_photo || '',
        file: '',
        type: 'text',
        reply_to_id: replyToId,
      };


      // websocketService.sendMessage('send_message'  , messagePayload);
      sendMessageWS('send_message', messagePayload);

      // Le message sera mis à jour via WebSocket ou on peut le remplacer ici
      // Pour le moment, on garde l'optimistic update

    } catch (error) {
      console.error('[Chat] Erreur lors de l\'envoi du message:', error);

      // En cas d'erreur, retirer le message optimistic
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));

      // Remettre le message dans l'input
      setMessage(messageContent);
      if (replyToId) {
        const originalReplyMessage = messages.find(m => m.id === replyToId);
        if (originalReplyMessage) {
          setReplyToMessage(originalReplyMessage);
        }
      }

      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  }, [message, currentUser, id, replyToMessage, messages, sendMessageAPI]);

  const handleSwipeReply = useCallback((messageId: string) => {
    const messageToReply = messages.find(m => m.id === messageId);
    if (messageToReply) {
      setReplyToMessage(messageToReply);
      Vibration.vibrate(50);
    }
  }, [messages]);

  const handleLongPress = (messageId: string, position?: { x: number; y: number }) => {
    setSelectedMessageId(messageId);
    setMessageActionsPosition(position || { x: 200, y: 400 });
    setShowMessageActions(true);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
        const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);

        if (existingReactionIndex >= 0) {
          const existingReaction = reactions[existingReactionIndex];
          const users = Array.isArray(existingReaction.users) ? [...existingReaction.users] : [];

          // Toggle reaction
          if (users.includes('currentUser')) {
            const newUsers = users.filter(u => u !== 'currentUser');
            if (newUsers.length === 0) {
              reactions.splice(existingReactionIndex, 1);
            } else {
              reactions[existingReactionIndex] = { ...existingReaction, users: newUsers };
            }
          } else {
            reactions[existingReactionIndex] = { ...existingReaction, users: [...users, 'currentUser'] };
          }
        } else {
          reactions.push({ emoji, users: ['currentUser'] });
        }

        return { ...msg, reactions };
      }
      return msg;
    }));

    Vibration.vibrate(30);
  };

  const handleCopyMessage = () => {
    const selectedMessage = messages.find(m => m.id === selectedMessageId);
    if (selectedMessage && selectedMessage.type === 'text') {
      Clipboard.setString(selectedMessage.content);
      Alert.alert('Copied', 'Message copied to clipboard');
    }
  };

  const handleDeleteMessage = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMessages(prev => prev.filter(m => m.id !== selectedMessageId));
          }
        }
      ]
    );
  };

  const handleForwardMessage = () => {
    Alert.alert('Forward', 'Forward functionality coming soon!');
  };

  const handleReactToMessage = (messageId: string, position: { x: number; y: number }) => {
    setSelectedMessageId(messageId);
    setReactionPickerPosition(position);
    setShowReactionPicker(true);
  };

  const findReplyToMessage = useCallback((replyToId: string) => {
    return messages.find(m => m.id === replyToId);
  }, [messages]);

  // Media handlers

  const handleImageSelected = (uri: string, type: 'camera' | 'gallery') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'image',
      content: type === 'camera' ? 'Photo from camera' : 'Photo from gallery',
      imageUrl: uri,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const handleVideoSelected = (uri: string, thumbnail?: string, duration?: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'video',
      content: 'Video',
      videoUrl: uri,
      videoDuration: duration,
      videoThumbnail: thumbnail,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const handleDocumentSelected = (document: MessageDocument) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'document',
      content: document.name,
      document,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const handleContactSelected = (contact: MessageContact) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'contact',
      content: contact.name,
      contact,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const handleLocationSelected = (location: MessageLocation) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'location',
      content: '',
      location,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const handleAudioRecordingComplete = (uri: string, duration: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'audio',
      content: '',
      audioUrl: uri,
      audioDuration: duration,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyToMessage(null);
    setShowAudioRecorder(false);
    scrollToBottom();
  };

  const handleMicPress = () => {
    if (message.trim()) {
      handleSend();
    } else {
      setShowAudioRecorder(true);
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  if (isLoading) {
    return (
      <>
        <CustomHeader
          showAvatar={true}
          title={contactInfo?.shortName || 'Chat'}
          subtitle={isOnline ? 'En ligne' : 'Hors ligne'}
          avatarBg={contactInfo?.avatarBg || 'bg-gray-500'}
          avatarText={contactInfo?.avatar || 'C'}
          isSpecialAvatar={false}
          onAvatarPress={() => router.push(`/contact-profile/${id}`)}
          rightContent={
            <View className="flex-row items-center">
              <TouchableOpacity className="p-2 mr-2">
                <VideoCallIcon width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <VoiceCallIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          }
        />
        <View className="flex-1">
          <ImageBackground
            source={require('~/assets/images/chat-bg.png')}
            className="flex-1 items-center justify-center"
            resizeMode="cover"
          >
            <Text className="text-white/70">Chargement des messages...</Text>
          </ImageBackground>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader
        showAvatar={true}
        title={contactInfo?.shortName}
        subtitle={isOnline ? 'En ligne' : 'Hors ligne'}
        avatarBg={contactInfo?.avatarBg}
        avatarText={contactInfo?.avatar}
        avatarImage={contactInfo?.profileImage}
        onAvatarPress={() => router.push(`/contact-profile/${id}`)}
        rightContent={
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 mr-2">
              <VideoCallIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <VoiceCallIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="flex-1">
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
              source={require('~/assets/images/chat-bg.png')}
              className="flex-1"
              resizeMode="cover"
            >
              {/* Messages Container */}
              <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 20 }}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    replyToMessage={msg.replyTo ? findReplyToMessage(msg.replyTo) : undefined}
                    onSwipeReply={handleSwipeReply}
                    onLongPress={handleLongPress}
                    onReaction={handleReaction}
                    onImagePress={(imageUrl) => {
                      setCurrentImageUrl(imageUrl);
                      setShowImageViewer(true);
                    }}
                    onVideoPress={(videoUrl) => {
                      setCurrentVideoUrl(videoUrl);
                      setShowVideoPlayer(true);
                    }}
                    // onLocationPress={(location) => {
                    //   Alert.alert('Location', `Opening ${location.name}...`);
                    // }}
                    // onContactPress={(contact) => {
                    //   Alert.alert('Contact', `Contact: ${contact.name} - ${contact.phoneNumber}`);
                    // }}
                    onDocumentPress={(document) => {
                      Alert.alert('Document', `Opening ${document.name}...`);
                    }}
                  />
                ))}
              </ScrollView>

              {/* Reply Preview */}
              <ReplyPreview
                replyToMessage={replyToMessage}
                onClose={() => setReplyToMessage(null)}
                visible={!!replyToMessage}
              />

              {/* Input Section */}
              {!showAudioRecorder && (
                <View className="bg-white px-4 py-3 flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setShowMediaMenu(true)}
                    className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3"
                  >
                    <Ionicons name="add" size={24} color="#6B7280" />
                  </TouchableOpacity>

                  <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-1">
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder={replyToMessage ? 'Reply...' : 'Type a message...'}
                      value={message}
                      onChangeText={setMessage}
                      multiline
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleMicPress}
                    className={`w-12 h-12 rounded-full items-center justify-center ml-2 ${message.trim() ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                  >
                    {message.trim() ? (
                      <SendIcon width={20} height={20} />
                    ) : (
                      <MicIcon width={20} height={20} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ImageBackground>

            {/* Overlays */}
            <ReactionPicker
              visible={showReactionPicker}
              position={reactionPickerPosition}
              onReaction={(emoji) => {
                if (selectedMessageId) {
                  handleReaction(selectedMessageId, emoji);
                }
                setShowReactionPicker(false);
              }}
              onClose={() => setShowReactionPicker(false)}
            />

            <MessageActions
              visible={showMessageActions}
              position={messageActionsPosition}
              onClose={() => setShowMessageActions(false)}
              onReply={() => {
                const messageToReply = messages.find(m => m.id === selectedMessageId);
                if (messageToReply) {
                  setReplyToMessage(messageToReply);
                }
              }}
              onCopy={handleCopyMessage}
              onDelete={handleDeleteMessage}
              onForward={handleForwardMessage}
              onReact={() => {
                setShowMessageActions(false);
                setTimeout(() => {
                  handleReactToMessage(selectedMessageId!, messageActionsPosition);
                }, 100);
              }}
              isOwnMessage={messages.find(m => m.id === selectedMessageId)?.isOwn || false}
            />

            {/* Media Attachment Menu */}
            <MediaAttachmentMenu
              visible={showMediaMenu}
              onClose={() => setShowMediaMenu(false)}
              onImageSelected={handleImageSelected}
              onVideoSelected={handleVideoSelected}
              onDocumentSelected={handleDocumentSelected}
              onContactSelected={handleContactSelected}
              onLocationSelected={handleLocationSelected}
            />

            {/* WhatsApp Audio Recorder */}
            <WhatsAppAudioRecorder
              visible={showAudioRecorder}
              onRecordingComplete={handleAudioRecordingComplete}
              onCancel={() => setShowAudioRecorder(false)}
            />

          </GestureHandlerRootView>
        </View>

        {/* Image Viewer Modal */}
        <ImageViewerModal
          visible={showImageViewer}
          imageUrl={currentImageUrl}
          onClose={() => setShowImageViewer(false)}
        />

        {/* Video Player Modal */}
        <VideoPlayer
          visible={showVideoPlayer}
          videoUrl={currentVideoUrl}
          onClose={() => setShowVideoPlayer(false)}
        />
      </KeyboardAvoidingView>
    </>
  );
}