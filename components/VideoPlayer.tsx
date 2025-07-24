import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView } from 'expo-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoPlayerProps {
  visible: boolean;
  videoUrl: string;
  onClose: () => void;
}

export default function VideoPlayer({
  visible,
  videoUrl,
  onClose
}: VideoPlayerProps) {
  const [showControls, setShowControls] = useState(true);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Controls Header */}
        {showControls && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: 'rgba(0,0,0,0.7)',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 10,
              zIndex: 10,
            }}
          >
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Video Player */}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setShowControls(!showControls)}
          activeOpacity={1}
        >
          <VideoView
            style={{ flex: 1 }}
            source={videoUrl}
            useNativeControls
            shouldPlay
            isLooping={false}
            onError={(error) => {
              console.error('Video error:', error);
              Alert.alert('Error', 'Unable to play video');
            }}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}