import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Vibration,
  Dimensions,
  Linking,
  Alert,
  Platform
} from 'react-native';
import * as Sharing from 'expo-sharing';
import {
  PanGestureHandler,
  LongPressGestureHandler,
  TapGestureHandler,
  State
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from './AudioPlayer';

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface MessageLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface MessageContact {
  name: string;
  phoneNumber: string;
  avatar?: string;
}

export interface MessageDocument {
  name: string;
  size: number;
  mimeType: string;
  uri: string;
}

export interface Message {
  id: string;
  type: 'text' | 'image' | 'audio' | 'location' | 'video' | 'document' | 'contact';
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  videoUrl?: string;
  videoDuration?: number;
  videoThumbnail?: string;
  location?: MessageLocation;
  contact?: MessageContact;
  document?: MessageDocument;
  isOwn: boolean;
  timestamp: string;
  replyTo?: string;
  reactions?: MessageReaction[];
}

interface MessageBubbleProps {
  message: Message;
  replyToMessage?: Message;
  onSwipeReply: (messageId: string) => void;
  onLongPress: (messageId: string, position?: { x: number; y: number }) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onImagePress?: (imageUrl: string) => void;
  onVideoPress?: (videoUrl: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const SWIPE_START_THRESHOLD = 30; // Seuil pour commencer le swipe

export default function MessageBubble({
  message,
  replyToMessage,
  onSwipeReply,
  onLongPress,
  onReaction,
  onImagePress,
  onLocationPress,
}: MessageBubbleProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [showReactions, setShowReactions] = useState(false);
  const messageRef = useRef<View>(null);
  const [hasStartedSwipe, setHasStartedSwipe] = useState(false);

  const handlePanGesture = (event: any) => {
    const { translationX } = event.nativeEvent;

    // Messages reçus : swipe droite (translationX > 0)
    // Messages envoyés : swipe gauche (translationX < 0)
    const isValidSwipe = message.isOwn
      ? (translationX < 0 && Math.abs(translationX) <= SWIPE_THRESHOLD)
      : (translationX > 0 && translationX <= SWIPE_THRESHOLD);

    if (isValidSwipe) {
      translateX.setValue(translationX);
      setHasStartedSwipe(true);
    }
  };

  const handlePanEnd = (event: any) => {
    const { translationX } = event.nativeEvent;

    // Vérifier si le seuil est atteint selon le type de message
    const shouldTriggerReply = message.isOwn
      ? (Math.abs(translationX) >= SWIPE_THRESHOLD && translationX < 0)
      : (translationX >= SWIPE_THRESHOLD);

    if (shouldTriggerReply) {
      // Trigger reply
      Vibration.vibrate(50);
      onSwipeReply(message.id);
    }

    // Reset animation
    setHasStartedSwipe(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleLongPress = () => {
    Vibration.vibrate(75);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Récupérer la position réelle du message
    messageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      onLongPress(message.id, {
        x: pageX + width / 2,
        y: pageY + height / 2
      });
    });
  };

  const handleDoubleTap = () => {
    Vibration.vibrate(30);
    onReaction(message.id, '❤️');
  };

  const openDocument = async (document: MessageDocument) => {
    try {
      // Check if it's an image - should open in image viewer
      if (document.mimeType.startsWith('image/')) {
        onImagePress?.(document.uri);
        return;
      }

      // Check if it's a video - should open in video player
      if (document.mimeType.startsWith('video/')) {
        onVideoPress?.(document.uri);
        return;
      }

      // For other documents, use sharing to open with system app
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(document.uri, {
          mimeType: document.mimeType,
          dialogTitle: `Open ${document.name}`,
        });
      } else {
        Alert.alert('Error', 'Document sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const openLocationInMaps = (location: MessageLocation) => {
    const { lat, lng, name } = location;
    
    let url: string;
    if (Platform.OS === 'ios') {
      // Apple Maps
      url = `http://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}`;
    } else {
      // Google Maps
      url = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web Google Maps
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open maps application');
      });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <TouchableOpacity
            onPress={() => onImagePress?.(message.imageUrl!)}
            className="rounded-2xl overflow-hidden"
          >
            <Image
              source={{ uri: message.imageUrl }}
              className="w-60 h-40"
              resizeMode="cover"
            />
            {message.content && (
              <Text className={`mt-2 text-base ${message.isOwn ? 'text-white' : 'text-white'}`}>
                {message.content}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'audio':
        return (
          <AudioPlayer
            audioUrl={message.audioUrl || ''}
            duration={message.audioDuration || 30}
            isOwn={message.isOwn}
          />
        );

      case 'location':
        return (
          <TouchableOpacity
            onPress={() => {
              if (message.location) {
                openLocationInMaps(message.location);
              }
            }}
            className="rounded-2xl overflow-hidden"
          >
            <View className="w-60 h-32 bg-gray-200/80 items-center justify-center">
              <Ionicons name="location" size={32} color="#14B8A6" />
              <Text className="text-teal-600 font-semibold mt-2">
                {message.location?.name || 'Location'}
              </Text>
            </View>
          </TouchableOpacity>
        );

      case 'video':
        return (
          <TouchableOpacity
            onPress={() => onVideoPress?.(message.videoUrl!)}
            className="rounded-2xl overflow-hidden relative"
          >
            <View className="w-60 h-40 bg-gray-800 items-center justify-center">
              {message.videoThumbnail ? (
                <Image
                  source={{ uri: message.videoThumbnail }}
                  className="w-60 h-40"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-60 h-40 bg-gray-700 items-center justify-center">
                  <Ionicons name="play-circle" size={48} color="white" />
                </View>
              )}
              <View className="absolute inset-0 bg-black/20 items-center justify-center">
                <Ionicons name="play-circle" size={48} color="white" />
              </View>
              {message.videoDuration && (
                <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded">
                  <Text className="text-white text-xs">
                    {Math.floor(message.videoDuration / 60)}:
                    {String(Math.floor(message.videoDuration % 60)).padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
            {message.content && (
              <Text className={`mt-2 text-base ${message.isOwn ? 'text-white' : 'text-white'}`}>
                {message.content}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'document':
        return (
          <TouchableOpacity
            onPress={() => {
              if (message.document) {
                openDocument(message.document);
              }
            }}
            className="w-60 p-4 bg-gray-200/80 rounded-2xl flex-row items-center"
          >
            <View className="w-12 h-12 bg-blue-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="document-text" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>
                {message.document?.name || 'Document'}
              </Text>
              <Text className="text-gray-600 text-xs">
                {message.document?.size ? `${Math.round(message.document.size / 1024)} KB` : 'Document'}
              </Text>
            </View>
            <Ionicons name="download" size={20} color="#6B7280" />
          </TouchableOpacity>
        );

      case 'contact':
        return (
          <TouchableOpacity
            onPress={() => onContactPress?.(message.contact!)}
            className="w-60 p-4 bg-gray-200/80 rounded-2xl flex-row items-center"
          >
            <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-3">
              {message.contact?.avatar ? (
                <Text className="text-white font-semibold text-lg">
                  {message.contact.avatar}
                </Text>
              ) : (
                <Ionicons name="person" size={24} color="white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>
                {message.contact?.name || 'Contact'}
              </Text>
              <Text className="text-gray-600 text-xs" numberOfLines={1}>
                {message.contact?.phoneNumber || 'No phone number'}
              </Text>
            </View>
            <Ionicons name="chatbubble" size={20} color="#6B7280" />
          </TouchableOpacity>
        );

      default:
        return (
          <Text className={`text-base ${message.isOwn ? 'text-white' : 'text-white'}`}>
            {message.content}
          </Text>
        );
    }
  };

  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    const getReplyIcon = () => {
      switch (replyToMessage.type) {
        case 'image': return '📷';
        case 'audio': return '🎵';
        case 'location': return '📍';
        case 'video': return '🎥';
        case 'document': return '📄';
        case 'contact': return '👤';
        default: return null;
      }
    };

    const getReplyText = () => {
      switch (replyToMessage.type) {
        case 'image': return 'Photo';
        case 'audio': return 'Audio';
        case 'location': return 'Location';
        case 'video': return 'Video';
        case 'document': return replyToMessage.document?.name || 'Document';
        case 'contact': return replyToMessage.contact?.name || 'Contact';
        default: return replyToMessage.content.length > 30
          ? replyToMessage.content.substring(0, 30) + '...'
          : replyToMessage.content;
      }
    };

    return (
      <View className={`mb-2 p-2 rounded-lg border-l-4 ${message.isOwn ? 'bg-white/60 border-teal-600' : 'bg-white/10 border-white/50'
        }`}>
        <Text className={`text-xs font-semibold mb-1 ${message.isOwn ? 'text-teal-700' : 'text-white/80'
          }`}>
          {replyToMessage.isOwn ? 'You' : 'Contact'}
        </Text>
        <Text className={`text-sm ${message.isOwn ? 'text-gray-700' : 'text-white/70'
          }`}>
          {getReplyIcon()} {getReplyText()}
        </Text>
      </View>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || !Array.isArray(message.reactions) || message.reactions.length === 0) return null;

    return (
      <View className={`flex-row mt-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
        <View className="bg-white rounded-full px-2 py-1 shadow-sm flex-row">
          {message.reactions.map((reaction, index) => (
            <TouchableOpacity key={`${reaction.emoji}-${index}`} className="flex-row items-center mr-1">
              <Text className="text-sm">{reaction.emoji}</Text>
              <Text className="text-xs text-gray-600 ml-1">
                {reaction.users ? reaction.users.length : 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <PanGestureHandler
      onGestureEvent={handlePanGesture}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handlePanEnd(event);
        }
      }}
      activeOffsetX={[-SWIPE_START_THRESHOLD, SWIPE_START_THRESHOLD]} // Active pour swipe horizontal gauche ET droite
      failOffsetY={[-15, 15]} // Fail si mouvement vertical trop important
      shouldCancelWhenOutside={true}
      enabled={true} // Activé pour tous les messages
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
        <LongPressGestureHandler
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.ACTIVE) {
              handleLongPress();
            }
          }}
          minDurationMs={500}
        >
          <TapGestureHandler
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.ACTIVE) {
                handleDoubleTap();
              }
            }}
            numberOfTaps={2}
          >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <View
                ref={messageRef}
                className={`mb-3 ${message.isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Reply Icon for Swipe */}
                <Animated.View
                  className={`absolute top-1/2 w-8 h-8 bg-gray-400 rounded-full items-center justify-center ${message.isOwn ? 'left-4' : 'right-4'
                    }`}
                  style={{
                    opacity: translateX.interpolate({
                      inputRange: message.isOwn
                        ? [-SWIPE_THRESHOLD, 0]
                        : [0, SWIPE_THRESHOLD],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      translateX: translateX.interpolate({
                        inputRange: message.isOwn
                          ? [-SWIPE_THRESHOLD, 0]
                          : [0, SWIPE_THRESHOLD],
                        outputRange: message.isOwn ? [0, -30] : [30, 0],
                        extrapolate: 'clamp',
                      })
                    }]
                  }}
                >
                  <Ionicons name="arrow-undo" size={16} color="white" />
                </Animated.View>

                <View className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.isOwn
                    ? 'bg-teal-700/90 rounded-br-md'
                    : 'bg-gray-800/80 rounded-bl-md'
                  }`}>
                  {renderReplyPreview()}
                  {renderMessageContent()}
                  <View className='flex-row items-end justify-end'>
                    <Text className="text-white/90 text-xs mt-1 px-2">
                      {message.timestamp}
                    </Text>
                  </View>
                </View>



                {renderReactions()}
              </View>
            </Animated.View>
          </TapGestureHandler>
        </LongPressGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}