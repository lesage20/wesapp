import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/store';
import { createProfile } from '~/api/services/verification';

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Added loading state
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams();
  const { login } = useAuthStore();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission denied', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (username.trim()) {
      setLoading(true); // Start loading
      try {
        // Save user data to auth store
        const user = {
          id: Math.random().toString(36).substr(2, 9), // Generate temporary ID
          phoneNumber: (phoneNumber as string) || '',
          username: username.trim(),
          profileImage: profileImage || undefined,
        };
        const response = await createProfile(username, profileImage || "");
        console.log('Réponse de création de profil:', JSON.stringify(response));
        // return ;
        login(response.user); // Update auth store with user data
        

        // Navigate to main app
        router.replace('/(drawer)/(tabs)');
      } catch (error) {
        console.error('Erreur lors de la création du profil:', error);
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      Alert.alert('Username required', 'Please enter a username to continue.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-center mt-8 mb-12 text-gray-900">
            Profile Details
          </Text>

          <Text className="text-gray-900 font-medium mb-8 text-center leading-6">
            Enter your username and choose your profile photo
          </Text>

          {/* Profile Image */}
          <View className="items-center mb-12">
            <TouchableOpacity
              onPress={pickImage}
              className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-32 h-32 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 bg-teal-600 rounded-lg items-center justify-center">
                  <Ionicons name="camera" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Username Input */}
          <View className="mb-12">
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4">
              <TextInput
                className="flex-1 py-4 text-gray-900 text-lg"
                placeholder=""
                value={username}
                onChangeText={setUsername}
                maxLength={30}
              />
              <Text className="text-2xl">😊</Text>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg ${username.trim() ? 'bg-teal-700' : 'bg-gray-300'}`}
            onPress={handleNext}
            disabled={!username.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className={`text-center font-semibold text-lg ${username.trim() ? 'text-white' : 'text-gray-500'}`}>
                Next
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}