import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');

interface WhatsAppAudioRecorderProps {
  visible: boolean;
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export default function WhatsAppAudioRecorder({
  visible,
  onRecordingComplete,
  onCancel
}: WhatsAppAudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  
  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  // PanResponder for slide gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isLocked) {
          // Slide to cancel (left swipe)
          if (gestureState.dx < -50) {
            slideAnim.setValue(gestureState.dx);
            scaleAnim.setValue(Math.max(0.7, 1 + gestureState.dx / 200));
          }
          
          // Slide up to lock
          if (gestureState.dy < -80) {
            lockAnim.setValue(Math.abs(gestureState.dy) / 80);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!isLocked) {
          // Cancel if slid too far left
          if (gestureState.dx < -100) {
            handleCancel();
            return;
          }
          
          // Lock if slid up enough
          if (gestureState.dy < -80) {
            handleLock();
            return;
          }
          
          // Reset animations if not cancelled or locked
          Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
            Animated.spring(lockAnim, { toValue: 0, useNativeDriver: true })
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    // Generate random waveform data for animation
    if (isRecording) {
      const interval = setInterval(() => {
        const newHeight = Math.random() * 40 + 10;
        setWaveformData(prev => {
          const newData = [...prev, newHeight];
          return newData.slice(-30); // Keep only last 30 bars
        });
      }, 100);

      // Start waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          })
        ])
      ).start();

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is required to record audio.');
        onCancel();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      recordingStartTime.current = Date.now();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
      onCancel();
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        onRecordingComplete(uri, recordingDuration);
      }
      
      setRecording(null);
      setRecordingDuration(0);
      setWaveformData([]);
      setIsLocked(false);
      
      // Reset animations
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
      lockAnim.setValue(0);
      
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleCancel = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    setWaveformData([]);
    setIsLocked(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    onCancel();
  };

  const handleLock = () => {
    setIsLocked(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(lockAnim, { toValue: 1, useNativeDriver: true })
    ]).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-white">
      {/* Lock indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 100,
          right: 30,
          opacity: lockAnim,
          transform: [{ translateY: lockAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}]
        }}
        className="bg-gray-200 rounded-full p-3"
      >
        <Ionicons name="lock-closed" size={20} color="#6B7280" />
      </Animated.View>

      {/* Recording content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Cancel instruction */}
        {!isLocked && (
          <Animated.View
            style={{
              opacity: slideAnim.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            }}
            className="absolute top-1/3"
          >
            <Text className="text-red-500 font-medium">← Slide to cancel</Text>
          </Animated.View>
        )}

        {/* Lock instruction */}
        {!isLocked && (
          <View className="absolute top-1/4">
            <Text className="text-gray-500 font-medium">↑ Slide up to lock</Text>
          </View>
        )}

        {/* Timer */}
        <View className="mb-8">
          <Text className="text-2xl font-mono text-gray-700">
            {formatTime(recordingDuration)}
          </Text>
        </View>

        {/* Waveform */}
        <View className="flex-row items-end h-16 mb-12">
          {waveformData.map((height, index) => (
            <Animated.View
              key={index}
              style={{
                width: 3,
                height: height,
                backgroundColor: '#14B8A6',
                marginHorizontal: 1,
                borderRadius: 1.5,
                opacity: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1]
                })
              }}
            />
          ))}
        </View>

        {/* Recording instructions */}
        <Text className="text-gray-500 text-center mb-8">
          {isLocked 
            ? 'Recording... Tap the stop button to finish'
            : 'Hold to record, release to send'
          }
        </Text>
      </View>

      {/* Bottom controls */}
      <View className="absolute bottom-20 left-0 right-0 flex-row justify-center items-center px-8">
        {/* Cancel button (when locked) */}
        {isLocked && (
          <TouchableOpacity
            onPress={handleCancel}
            className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-8"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Mic button */}
        <Animated.View
          style={{
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ]
          }}
          {...(!isLocked ? panResponder.panHandlers : {})}
        >
          <TouchableOpacity
            onPress={isLocked ? stopRecording : undefined}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              isLocked ? 'bg-red-500' : 'bg-teal-600'
            }`}
            disabled={!isLocked}
          >
            <Ionicons 
              name={isLocked ? "stop" : "mic"} 
              size={28} 
              color="white" 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Send button (when locked) */}
        {isLocked && (
          <TouchableOpacity
            onPress={stopRecording}
            className="w-12 h-12 bg-teal-600 rounded-full items-center justify-center ml-8"
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}