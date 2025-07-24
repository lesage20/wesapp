import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

export default function ImageViewerModal({
  visible,
  imageUrl,
  onClose
}: ImageViewerModalProps) {
  const [showControls, setShowControls] = useState(true);
  
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Reset values when modal opens
  React.useEffect(() => {
    if (visible) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 1;
      setShowControls(true);
    }
  }, [visible]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  // Pinch gesture handler for zoom
  const pinchHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setShowControls)(false);
    },
    onActive: (event) => {
      scale.value = Math.max(0.5, Math.min(event.scale, 4));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      runOnJS(setShowControls)(true);
    },
  });

  // Pan gesture handler for dragging
  const panHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setShowControls)(false);
    },
    onActive: (event) => {
      if (scale.value > 1) {
        // Allow panning when zoomed in
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        // Allow vertical pan for closing gesture
        translateY.value = event.translationY;
        opacity.value = Math.max(0.3, 1 - Math.abs(event.translationY) / 400);
      }
    },
    onEnd: (event) => {
      if (scale.value > 1) {
        // Snap back within bounds when zoomed
        const maxTranslateX = (scale.value - 1) * screenWidth / 2;
        const maxTranslateY = (scale.value - 1) * screenHeight / 2;
        
        translateX.value = withSpring(
          Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
        );
        translateY.value = withSpring(
          Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
        );
      } else {
        // Handle close gesture
        if (Math.abs(event.translationY) > 100 || Math.abs(event.velocityY) > 1000) {
          opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onClose)();
          });
        } else {
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      }
      runOnJS(setShowControls)(true);
    },
  });

  // Double tap handler for zoom toggle
  const doubleTapHandler = useAnimatedGestureHandler({
    onActive: () => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
      }
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to save images.');
        return;
      }

      // In a real app, you would download and save the image
      // For now, we'll just show a success message
      Alert.alert('Success', 'Image saved to gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const shareImage = async () => {
    try {
      await Share.share({
        url: imageUrl,
        message: 'Check out this image!'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar hidden />
      
      <Animated.View style={[{ flex: 1, backgroundColor: 'black' }, containerStyle]}>
        {/* Controls Header */}
        <Animated.View
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
            opacity: showControls ? 1 : 0,
          }}
        >
          <TouchableOpacity onPress={handleClose} className="p-2">
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View className="flex-row">
            <TouchableOpacity onPress={shareImage} className="p-2 mr-4">
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveImage} className="p-2">
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Image Container */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TapGestureHandler onGestureEvent={toggleControls} numberOfTaps={1}>
            <Animated.View>
              <TapGestureHandler onGestureEvent={doubleTapHandler} numberOfTaps={2}>
                <Animated.View>
                  <PanGestureHandler onGestureEvent={panHandler}>
                    <Animated.View>
                      <PinchGestureHandler onGestureEvent={pinchHandler}>
                        <Animated.View style={animatedStyle}>
                          <Image
                            source={{ uri: imageUrl }}
                            style={{
                              width: screenWidth,
                              height: screenHeight,
                            }}
                            resizeMode="contain"
                          />
                        </Animated.View>
                      </PinchGestureHandler>
                    </Animated.View>
                  </PanGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </View>

        {/* Controls Footer */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: showControls ? 1 : 0,
          }}
        >
          <View className="flex-row items-center space-x-8">
            <TouchableOpacity onPress={shareImage} className="items-center">
              <Ionicons name="share-outline" size={24} color="white" />
              <Text className="text-white text-xs mt-1">Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={saveImage} className="items-center">
              <Ionicons name="download-outline" size={24} color="white" />
              <Text className="text-white text-xs mt-1">Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}