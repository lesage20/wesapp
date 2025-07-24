import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';

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
  const player = useAudioPlayer(audioUrl);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animatedValues = useRef(
    WAVEFORM_DATA.map(() => new Animated.Value(0.3))
  ).current;

  // Synchroniser isPlaying avec player.playing et gérer l'état de lecture
  useEffect(() => {
    const checkPlayingState = () => {
      const currentlyPlaying = player.playing;
      if (currentlyPlaying !== isPlaying) {
        setIsPlaying(currentlyPlaying);
      }
    };

    // Vérifier l'état immédiatement
    checkPlayingState();

    // Continuer à vérifier l'état périodiquement
    const interval = setInterval(checkPlayingState, 100);

    return () => clearInterval(interval);
  }, [player, player.playing, isPlaying]);

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

      // Update progress based on actual audio player
      const progressInterval = setInterval(() => {
        if (player.currentTime !== undefined && player.duration !== undefined) {
          setCurrentTime(player.currentTime);
          setProgress(player.currentTime / player.duration);
          
          // Vérifier si l'audio est terminé
          if (player.currentTime >= player.duration) {
            setIsPlaying(false);
          }
        }
      }, 100);

      return () => {
        clearInterval(progressInterval);
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

  const handlePlayPause = async () => {    
    try {
      if (isPlaying) {
        await player.pause();
      } else {
        // Si l'audio est à la fin, le redémarrer depuis le début
        if (player.currentTime >= (player.duration || 0)) {
          await player.seekTo(0);
        }
        await player.play();
      }
    } catch (error) {
      console.error('Error in play/pause:', error);
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