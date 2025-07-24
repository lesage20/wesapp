import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  isOwn: boolean;
}

// Waveform data - heights for each bar (0-100) - 32 barres max
const WAVEFORM_DATA = [
  20, 45, 30, 60, 25, 80, 35, 50, 40, 70, 25, 55, 45, 65, 30, 75, 
  40, 50, 35, 60, 45, 85, 30, 55, 40, 70, 25, 60, 50, 45, 35, 80
];

export default function AudioPlayer({ audioUrl, duration, isOwn }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const animatedValues = useRef(
    WAVEFORM_DATA.map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      // Animate waveform bars
      const animations = animatedValues.map((value, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 300 + (index % 5) * 100,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0.3,
              duration: 300 + (index % 5) * 100,
              useNativeDriver: true,
            }),
          ])
        )
      );

      Animated.stagger(50, animations).start();

      // Simulate audio progress
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            setProgress(0);
            clearInterval(interval);
            return 0;
          }
          setProgress(newTime / duration);
          return newTime;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        animations.forEach(anim => anim.stop());
      };
    } else {
      // Reset animations when paused
      animatedValues.forEach(value => {
        Animated.timing(value, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    return (
      <View className="flex-row items-center h-8 mx-3 flex-1 overflow-hidden">
        {WAVEFORM_DATA.map((height, index) => {
          const isActive = progress > (index / WAVEFORM_DATA.length);
          const normalizedHeight = Math.max(2, (height / 100) * 24); // 2px min, 24px max
          
          return (
            <Animated.View
              key={index}
              className={`rounded-full ${
                isActive 
                  ? (isOwn ? 'bg-teal-600' : 'bg-white') 
                  : (isOwn ? 'bg-gray-300' : 'bg-white/40')
              }`}
              style={{
                width: 2, // Largeur fixe au lieu de classe Tailwind
                height: normalizedHeight,
                marginHorizontal: 1, // Marge fixe
                transform: [{
                  scaleY: isPlaying ? animatedValues[index] : new Animated.Value(1)
                }]
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-row items-center min-w-[200px]">
      {/* Play/Pause Button */}
      <TouchableOpacity 
        onPress={handlePlayPause}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          isOwn ? 'bg-teal-600' : 'bg-white/20'
        }`}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={16} 
          color={isOwn ? "white" : "white"} 
        />
      </TouchableOpacity>

      {/* Waveform */}
      {renderWaveform()}

      {/* Time Display */}
      <View className="ml-2">
        <Text className={`text-xs ${isOwn ? 'text-white/90' : 'text-white/70'}`}>
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}