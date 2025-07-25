import React, { useState, useRef, useEffect } from 'react';
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
import { useAuth } from '~/hooks/api/useAuth';
import { useContacts } from '~/hooks/api/useContacts';
import { useOnlineStatus } from '~/hooks/api/useOnlineStatus';


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
    isLoading: messagesLoading, 
    getConversationWithMessages, 
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
    removeMessageListener,
    markMessageAsRead,
    deleteMessage: deleteMessageWS,
    activeConversationId
  } = useWebSocket();
  
  const { currentUser } = useAuth();
  const { isLoading: contactsLoading, getWeSappUsers } = useContacts();
  const { 
    isConnected: statusConnected, 
    connect: connectStatus, 
    requestUserStatus, 
    addStatusListener 
  } = useOnlineStatus();
  
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Get contact data based on ID
  const getContactData = (contactId: string) => {
    switch (contactId) {
      case '456-qsns-civ':
        return {
          name: '456-QSNS-CIV',
          shortName: '456-QSNS-C...',
          avatar: 'A',
          avatarBg: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
        };
      case 'narcisse-pro':
        return {
          name: 'Narcisse professionnels',
          shortName: 'Narcisse...',
          avatar: 'OEUFS',
          avatarBg: 'bg-orange-400',
          isSpecialAvatar: true
        };
      case 'akissi':
        return {
          name: 'Akissi ❤️',
          shortName: 'Akissi ❤️',
          avatar: 'A',
          avatarBg: 'bg-pink-500'
        };
      case 'kamate-drissa':
        return {
          name: 'Kamaté drissa',
          shortName: 'Kamaté...',
          avatar: 'K',
          avatarBg: 'bg-green-500'
        };
      default:
        return {
          name: 'Contact',
          shortName: 'Contact',
          avatar: 'C',
          avatarBg: 'bg-gray-500'
        };
    }
  };

  const contact = getContactData(id as string);

  // Initialize with mock messages
  React.useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'text',
        content: 'Salut ! Comment ça va ?',
        isOwn: false,
        timestamp: '14:30',
        reactions: [{ emoji: '👍', users: ['user1'] }]
      },
      {
        id: '2',
        type: 'text', 
        content: 'Ça va bien merci ! Et toi ?',
        isOwn: true,
        timestamp: '14:32'
      },
      {
        id: '3',
        type: 'image',
        content: 'Regarde cette belle photo !',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        isOwn: false,
        timestamp: '14:35',
        reactions: [{ emoji: '❤️', users: ['user1', 'user2'] }, { emoji: '😍', users: ['user1'] }]
      },
      {
        id: '4',
        type: 'audio',
        content: '',
        audioUrl: 'https://example.com/audio.mp3',
        audioDuration: 45,
        isOwn: true,
        timestamp: '14:37'
      },
      {
        id: '4b',
        type: 'audio',
        content: '',
        audioUrl: 'https://example.com/audio2.mp3',
        audioDuration: 23,
        isOwn: false,
        timestamp: '14:38'
      },
      {
        id: '5',
        type: 'text',
        content: 'Super ! Tu fais quoi ce soir ?',
        isOwn: false,
        timestamp: '14:40',
        replyTo: '2'
      },
      {
        id: '6',
        type: 'location',
        content: '',
        location: { lat: 48.8566, lng: 2.3522, name: 'Tour Eiffel, Paris' },
        isOwn: true,
        timestamp: '14:42'
      },
      {
        id: '7',
        type: 'text',
        content: 'Parfait ! On se retrouve là-bas à 20h ?',
        isOwn: false,
        timestamp: '14:45',
        replyTo: '6'
      },
      {
        id: '8',
        type: 'audio',
        content: '',
        audioUrl: 'https://example.com/long-audio.mp3',
        audioDuration: 127, // 2:07
        isOwn: true,
        timestamp: '14:47'
      },
      {
        id: '9',
        type: 'text',
        content: 'Exactement ! C\'était génial 👍',
        isOwn: false,
        timestamp: '14:50',
        replyTo: '8' // Réponse à notre message audio
      }
    ];
    setMessages(mockMessages);
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'text',
        content: message,
        isOwn: true,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        replyTo: replyToMessage?.id
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setReplyToMessage(null);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSwipeReply = (messageId: string) => {
    const messageToReply = messages.find(m => m.id === messageId);
    if (messageToReply) {
      setReplyToMessage(messageToReply);
      Vibration.vibrate(50);
    }
  };

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

  const findReplyToMessage = (replyToId: string) => {
    return messages.find(m => m.id === replyToId);
  };

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

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (isLoadingMessages || !contactInfo) {
    return (
      <>
        <CustomHeader 
          showAvatar={true}
          title={contact.shortName}
          subtitle={isOnline ? 'En ligne' : 'Hors ligne'}
          avatarBg={contact.avatarBg}
          avatarText={contact.avatar}
          isSpecialAvatar={contact.isSpecialAvatar}
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
        title={contact.shortName}
        subtitle={isOnline ? 'En ligne' : 'Hors ligne'}
        avatarBg={contact.avatarBg}
        avatarText={contact.avatar}
        isSpecialAvatar={contact.isSpecialAvatar}
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
                  className={`w-12 h-12 rounded-full items-center justify-center ml-2 ${
                    message.trim() ? 'bg-teal-600' : 'bg-gray-200'
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