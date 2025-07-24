import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '~/store/store';
import { useAuth } from '~/hooks';

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams();
  const { login } = useAuthStore();
  
  // Hook d'authentification
  const { createProfile, isLoading, error } = useAuth();

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
      try {
        const profileData = {
          username: username.trim(),
          profile_photo: profileImage || undefined,
          bio: '', // Bio par défaut vide
          label: 'Utilisateur', // Label par défaut
        };
        
        await createProfile(profileData);
        
        // Navigation vers l'app principale en cas de succès
        router.replace('/(drawer)/(tabs)');
      } catch (err) {
        // L'erreur est déjà gérée par le hook (toast)
        console.error('Erreur lors de la création du profil:', err);
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

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <Text className="text-red-600 text-center text-sm">{error}</Text>
        </View>
      )}

      {/* Next Button */}
      <TouchableOpacity
        className={`py-4 rounded-lg ${username.trim() && !isLoading ? 'bg-teal-700' : 'bg-gray-300'}`}
        onPress={handleNext}
        disabled={!username.trim() || isLoading}
      >
        {isLoading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">
              Creating...
            </Text>
          </View>
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