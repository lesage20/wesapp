import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback,
  Vibration
} from 'react-native';

interface ReactionPickerProps {
  visible: boolean;
  onReaction: (emoji: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

const POPULAR_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function ReactionPicker({ 
  visible, 
  onReaction, 
  onClose, 
  position = { x: 0, y: 0 } 
}: ReactionPickerProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const emojiAnims = useRef(
    POPULAR_EMOJIS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Animate container appearing
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate each emoji with staggered timing
      const emojiAnimations = emojiAnims.map((anim, index) =>
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 6,
          }),
        ])
      );

      Animated.parallel(emojiAnimations).start();
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        ...emojiAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [visible]);

  const handleEmojiPress = (emoji: string) => {
    Vibration.vibrate(30);
    
    // Create burst animation
    const selectedIndex = POPULAR_EMOJIS.indexOf(emoji);
    if (selectedIndex >= 0) {
      Animated.sequence([
        Animated.timing(emojiAnims[selectedIndex], {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(emojiAnims[selectedIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onReaction(emoji);
    onClose();
  };

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute inset-0 z-50">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Animated.View 
            className="absolute bg-white rounded-3xl shadow-2xl px-4 py-3"
            style={{
              left: Math.max(20, Math.min(position.x - 150, Dimensions.get('window').width - 320)),
              top: Math.max(100, position.y - 70),
              transform: [
                { scale: scaleAnim },
                { 
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }
              ],
              opacity: fadeAnim,
            }}
          >
            <View className="flex-row items-center">
              {POPULAR_EMOJIS.map((emoji, index) => (
                <Animated.View
                  key={emoji}
                  style={{
                    transform: [
                      { scale: emojiAnims[index] },
                      {
                        translateY: emojiAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        })
                      }
                    ],
                    opacity: emojiAnims[index],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleEmojiPress(emoji)}
                    className="w-12 h-12 items-center justify-center mx-1 rounded-full"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            
            {/* Arrow pointing to message */}
            <View 
              className="absolute -bottom-2 bg-white w-4 h-4 transform rotate-45"
              style={{
                left: Math.min(140, Math.max(20, 150)),
              }}
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}