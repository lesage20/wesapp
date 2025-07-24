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
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';

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
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [permissions, setPermissions] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const waveformAnim = useRef(new Animated.Value(0)).current;
  
  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

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
    if (visible && audioRecorder.isRecording) {
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
  }, [visible, audioRecorder.isRecording]);

  const startRecording = async () => {
    try {
      // Check and request microphone permission
      if (!permissions) {
        const permissionResponse = await AudioModule.requestRecordingPermissionsAsync();
        if (!permissionResponse.granted) {
          Alert.alert(
            'Permission Required',
            'Microphone access is required to record audio messages. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel', onPress: onCancel },
              { text: 'Settings', onPress: () => {
                // On iOS, this might open settings. On Android, user needs to manually go to settings
                onCancel();
              }}
            ]
          );
          return;
        }
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      
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
    if (!audioRecorder.isRecording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await audioRecorder.stop();
      
      if (audioRecorder.uri) {
        onRecordingComplete(audioRecorder.uri, recordingDuration);
      }
      
      setRecordingDuration(0);
      setWaveformData([]);
      
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleCancel = () => {
    if (audioRecorder.isRecording) {
      audioRecorder.stop();
    }
    
    setRecordingDuration(0);
    setWaveformData([]);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-white">
      {/* Recording content */}
      <View className="flex-1 justify-center items-center px-8">

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
          Recording... Use the buttons below to stop or cancel
        </Text>
      </View>

      {/* Bottom controls */}
      <View className="absolute bottom-20 left-0 right-0 flex-row justify-center items-center gap-8 px-8 space-x-8">
        {/* Cancel button */}
        <TouchableOpacity
          onPress={handleCancel}
          className="w-16 h-16 bg-red-500 rounded-full items-center justify-center"
        >
          <Ionicons name="stop" size={28} color="white" />
        </TouchableOpacity>

        {/* Recording indicator */}
        <View className="w-16 h-16 bg-gray-600 rounded-full items-center justify-center">
          <Ionicons name="mic" size={28} color="white" />
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={stopRecording}
          className="w-16 h-16 bg-teal-600 rounded-full items-center justify-center"
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}