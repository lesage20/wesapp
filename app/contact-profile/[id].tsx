import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import MessageIcon from '~/assets/svgs/contact/message';
import VideoCallIcon from '~/assets/svgs/contact/video-call';
import VoiceCallIcon from '~/assets/svgs/contact/voice-call';
import { useContacts } from '~/hooks/api/useContacts';
import SmartAvatar from '~/components/SmartAvatar';
import { WeSappCode } from '~/hooks/types';
export default function ContactProfileScreen() {
  const { id: userCode } = useLocalSearchParams();
  const router = useRouter();
  
  // State pour les données utilisateur
  const [userProfile, setUserProfile] = useState<WeSappCode | null>(null);
  
  // Hook pour les contacts
  const { checkCode, isLoading, error } = useContacts();
  
  // Charger les données utilisateur
  useEffect(() => {
    const loadUserProfile = async (): Promise<void> => {
      if (userCode && typeof userCode === 'string') {
        try {
          const userData = await checkCode(userCode);
          setUserProfile(userData);
        } catch (err) {
          console.error('Erreur lors du chargement du profil:', err);
        }
      }
    };
    
    loadUserProfile();
  }, [userCode]);
  
  // Formater les données pour l'affichage
  const getDisplayData = () => {
    if (!userProfile) {
      return {
        name: 'Contact',
        avatar: 'C',
        avatarBg: 'bg-gray-500',
        subtitle: 'Chargement...',
        identifier: userCode || 'UNKNOWN-ID',
        verified: false
      };
    }
    
    return {
      name: userProfile.username || userProfile.code,
      avatar: userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U',
      avatarBg: 'bg-teal-500',
      subtitle: userProfile.username || 'Utilisateur WeSapp',
      identifier: userProfile.code,
      verified: userProfile.is_verified || false,
      profilePhoto: userProfile.userphoto
    };
  };
  
  const contact = getDisplayData();

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <>
        <CustomHeader 
          showBackButton={true}
          title=""
        />
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-600 text-lg">Chargement du profil...</Text>
        </View>
      </>
    );
  }
  
  if (error || (!isLoading && !userProfile)) {
    return (
      <>
        <CustomHeader 
          showBackButton={true}
          title=""
        />
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-red-600 text-lg font-semibold mb-2">Erreur</Text>
          <Text className="text-gray-600 text-center">
            Impossible de charger le profil de cet utilisateur.
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-teal-600 px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Retour</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader 
        showBackButton={true}
        title=""
        rightText="Edit"
        onRightPress={() => console.log('Edit contact')}
      />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Profile Section */}
          <View className="items-center py-8">
            {/* Avatar */}
            <View className={`w-24 h-24 rounded-3xl  items-center justify-center mb-4`}>
              <SmartAvatar user={ { profileImage: userProfile?.userphoto, username: userProfile?.username } } size={96} />
            </View>

            {/* Name with verification */}
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 font-bold text-2xl">{contact.name}</Text>
              {contact.verified && (
                <View className="w-6 h-6 bg-teal-700 rounded-full items-center justify-center ml-2">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </View>

            <Text className="text-gray-600 text-lg mb-8">{contact.subtitle}</Text>
          </View>

          {/* Identifier Section */}
          <View className="mx-6 mb-8">
            <View className="bg-gray-100 rounded-2xl p-4">
              <Text className="text-gray-600 font-medium mb-2">Identifiant</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 font-bold text-xl">{contact.identifier}</Text>
                <View className="flex-row">
                  <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                    <MessageIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                    <VideoCallIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm">
                    <VoiceCallIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 gap-y-3 space-y-4">
            <TouchableOpacity className="bg-gray-100 rounded-2xl p-4">
              <Text className="text-teal-600 font-semibold text-lg text-center">
                Delete this Identifiant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-2xl p-4">
              <Text className="text-teal-600 font-semibold text-lg text-center">
                Block this Idendtifiant
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}