import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Vibration,
  Dimensions
} from 'react-native';
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

export interface Message {
  id: string;
  type: 'text' | 'image' | 'audio' | 'location';
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  location?: MessageLocation;
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
  onLocationPress?: (location: MessageLocation) => void;
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
    
    if (translationX > 0 && translationX <= SWIPE_THRESHOLD) {
      translateX.setValue(translationX);
      setHasStartedSwipe(true);
    }
  };

  const handlePanEnd = (event: any) => {
    const { translationX } = event.nativeEvent;
    
    if (translationX >= SWIPE_THRESHOLD) {
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
              <Text className={`mt-2 text-base ${message.isOwn ? 'text-gray-900' : 'text-white'}`}>
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
            onPress={() => onLocationPress?.(message.location!)}
            className="rounded-2xl overflow-hidden"
          >
            <View className="w-60 h-32 bg-gray-200 items-center justify-center">
              <Ionicons name="location" size={32} color="#14B8A6" />
              <Text className="text-teal-600 font-semibold mt-2">
                {message.location?.name || 'Location'}
              </Text>
            </View>
          </TouchableOpacity>
        );

      default:
        return (
          <Text className={`text-base ${message.isOwn ? 'text-gray-900' : 'text-white'}`}>
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
        default: return null;
      }
    };

    const getReplyText = () => {
      switch (replyToMessage.type) {
        case 'image': return 'Photo';
        case 'audio': return 'Audio';
        case 'location': return 'Location';
        default: return replyToMessage.content.length > 30 
          ? replyToMessage.content.substring(0, 30) + '...' 
          : replyToMessage.content;
      }
    };

    return (
      <View className={`mb-2 p-2 rounded-lg border-l-4 ${
        message.isOwn ? 'bg-gray-100 border-teal-600' : 'bg-white/10 border-white/50'
      }`}>
        <Text className={`text-xs font-semibold mb-1 ${
          message.isOwn ? 'text-teal-600' : 'text-white/80'
        }`}>
          {replyToMessage.isOwn ? 'You' : 'Contact'}
        </Text>
        <Text className={`text-sm ${
          message.isOwn ? 'text-gray-700' : 'text-white/70'
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
      activeOffsetX={SWIPE_START_THRESHOLD} // Active seulement pour swipe horizontal droite
      failOffsetY={[-15, 15]} // Fail si mouvement vertical trop important
      shouldCancelWhenOutside={true}
      enabled={!message.isOwn} // Désactivé pour les messages propres
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
                {!message.isOwn && (
                  <Animated.View 
                    className="absolute right-4 top-1/2 w-8 h-8 bg-gray-400 rounded-full items-center justify-center"
                    style={{
                      opacity: translateX.interpolate({
                        inputRange: [0, SWIPE_THRESHOLD],
                        outputRange: [0, 1],
                        extrapolate: 'clamp',
                      }),
                      transform: [{
                        translateX: translateX.interpolate({
                          inputRange: [0, SWIPE_THRESHOLD],
                          outputRange: [30, 0],
                          extrapolate: 'clamp',
                        })
                      }]
                    }}
                  >
                    <Ionicons name="arrow-undo" size={16} color="white" />
                  </Animated.View>
                )}

                <View className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.isOwn 
                    ? 'bg-white/90 rounded-br-md' 
                    : 'bg-gray-800/80 rounded-bl-md'
                }`}>
                  {renderReplyPreview()}
                  {renderMessageContent()}
                </View>
                
                <Text className="text-white/70 text-xs mt-1 px-2">
                  {message.timestamp}
                </Text>
                
                {renderReactions()}
              </View>
            </Animated.View>
          </TapGestureHandler>
        </LongPressGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}