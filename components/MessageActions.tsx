import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated,
  TouchableWithoutFeedback,
  Vibration,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageAction {
  id: string;
  title: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

interface MessageActionsProps {
  visible: boolean;
  position?: { x: number; y: number };
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onForward: () => void;
  onReact: () => void;
  isOwnMessage: boolean;
}

export default function MessageActions({
  visible,
  position = { x: 0, y: 0 },
  onClose,
  onReply,
  onCopy,
  onDelete,
  onForward,
  onReact,
  isOwnMessage,
}: MessageActionsProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;

  const actions: MessageAction[] = [
    {
      id: 'react',
      title: 'React',
      icon: 'heart-outline',
      onPress: () => {
        onReact();
        onClose();
      }
    },
    {
      id: 'reply',
      title: 'Reply',
      icon: 'arrow-undo-outline',
      onPress: () => {
        onReply();
        onClose();
      }
    },
    {
      id: 'copy',
      title: 'Copy',
      icon: 'copy-outline',
      onPress: () => {
        onCopy();
        onClose();
      }
    },
    {
      id: 'forward',
      title: 'Forward',
      icon: 'arrow-redo-outline',
      onPress: () => {
        onForward();
        onClose();
      }
    },
    ...(isOwnMessage ? [{
      id: 'delete',
      title: 'Delete',
      icon: 'trash-outline',
      color: '#EF4444',
      onPress: () => {
        onDelete();
        onClose();
      }
    }] : [])
  ];

  useEffect(() => {
    if (visible) {
      Vibration.vibrate(50);
      
      // Animate container
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

      // Animate items with stagger
      const itemAnimations = itemAnims.slice(0, actions.length).map((anim, index) =>
        Animated.sequence([
          Animated.delay(index * 30),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 6,
          }),
        ])
      );

      Animated.parallel(itemAnimations).start();
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
        ...itemAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [visible]);

  const handleActionPress = (action: MessageAction) => {
    Vibration.vibrate(30);
    action.onPress();
  };

  if (!visible) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const menuWidth = 200;
  const menuHeight = actions.length * 60 + 20;
  
  // Calculate position to keep menu on screen
  const left = Math.max(20, Math.min(position.x - menuWidth / 2, screenWidth - menuWidth - 20));
  const top = Math.max(100, Math.min(position.y - menuHeight / 2, screenHeight - menuHeight - 100));

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute inset-0 z-50">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Animated.View 
            className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              left,
              top,
              width: menuWidth,
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
            {actions.map((action, index) => (
              <Animated.View
                key={action.id}
                style={{
                  transform: [
                    { scale: itemAnims[index] },
                    {
                      translateX: itemAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }
                  ],
                  opacity: itemAnims[index],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleActionPress(action)}
                  className="flex-row items-center px-6 py-4 border-b border-gray-100"
                  style={{
                    borderBottomWidth: index === actions.length - 1 ? 0 : 1,
                  }}
                >
                  <Ionicons 
                    name={action.icon as any} 
                    size={20} 
                    color={action.color || '#6B7280'} 
                  />
                  <Text 
                    className="ml-4 text-base font-medium"
                    style={{ color: action.color || '#374151' }}
                  >
                    {action.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}