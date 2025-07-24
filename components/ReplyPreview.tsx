import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from './MessageBubble';

interface ReplyPreviewProps {
  replyToMessage: Message | null;
  onClose: () => void;
  visible: boolean;
}

export default function ReplyPreview({ 
  replyToMessage, 
  onClose, 
  visible 
}: ReplyPreviewProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && replyToMessage) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, replyToMessage]);

  if (!visible || !replyToMessage) return null;

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
      case 'audio': return `Audio • ${replyToMessage.audioDuration ? Math.floor(replyToMessage.audioDuration / 60) + ':' + (replyToMessage.audioDuration % 60).toString().padStart(2, '0') : '0:30'}`;
      case 'location': return replyToMessage.location?.name || 'Location';
      default: return replyToMessage.content.length > 50 
        ? replyToMessage.content.substring(0, 50) + '...' 
        : replyToMessage.content;
    }
  };

  const renderReplyThumbnail = () => {
    switch (replyToMessage.type) {
      case 'image':
        return (
          <View className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 mr-3">
            {replyToMessage.imageUrl ? (
              <Image 
                source={{ uri: replyToMessage.imageUrl }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="image" size={20} color="#9CA3AF" />
              </View>
            )}
          </View>
        );
      
      case 'audio':
        return (
          <View className="w-12 h-12 rounded-lg bg-teal-100 items-center justify-center mr-3">
            <Ionicons name="musical-notes" size={20} color="#14B8A6" />
          </View>
        );
      
      case 'location':
        return (
          <View className="w-12 h-12 rounded-lg bg-blue-100 items-center justify-center mr-3">
            <Ionicons name="location" size={20} color="#3B82F6" />
          </View>
        );
      
      default:
        return (
          <View className="w-1 h-12 bg-teal-600 rounded-full mr-3" />
        );
    }
  };

  return (
    <Animated.View 
      className="bg-white border-t border-gray-200 px-4 py-3"
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      <View className="flex-row items-center">
        <Ionicons name="arrow-undo" size={16} color="#14B8A6" className="mr-2" />
        <Text className="text-teal-600 font-semibold text-sm mr-2">
          Replying to
        </Text>
        <Text className="text-gray-600 text-sm font-medium">
          {replyToMessage.isOwn ? 'You' : 'Contact'}
        </Text>
        
        <TouchableOpacity 
          onPress={onClose}
          className="ml-auto p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center mt-2">
        {renderReplyThumbnail()}
        
        <View className="flex-1">
          <Text className="text-gray-900 text-base" numberOfLines={2}>
            {getReplyIcon()} {getReplyText()}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}