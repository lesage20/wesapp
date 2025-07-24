import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';
import MessageIcon from '~/assets/svgs/contact/message';
import VideoCallIcon from '~/assets/svgs/chat/video-call';
import VoiceCallIcon from '~/assets/svgs/chat/voice-call';

export default function ConnectionDetailScreen() {
  const router = useRouter();
  const { 
    connectionId, 
    name, 
    wesappCode, 
    avatarText, 
    avatarBg, 
    isSpecial,
    isVerified,
    hasHeart 
  } = useLocalSearchParams();

  const handleEdit = () => {
    router.push({
      pathname: '/(modal)/connection-edit',
      params: { 
        connectionId, 
        name, 
        wesappCode, 
        avatarText, 
        avatarBg, 
        isSpecial 
      }
    });
  };

  const handleMessage = () => {
    console.log('Message connection:', connectionId);
    router.push(`/chat/${connectionId}`);
  };

  const handleVideoCall = () => {
    console.log('Video call connection:', connectionId);
    // Handle video call functionality
  };

  const handleVoiceCall = () => {
    console.log('Voice call connection:', connectionId);
    // Handle voice call functionality
  };

  const handleBlock = () => {
    console.log('Block connection:', connectionId);
    // Handle block functionality
  };

  const handleDelete = () => {
    console.log('Delete connection:', connectionId);
    // Handle delete functionality
  };

  return (
    <>
      <CustomHeader 
        title=""
        showBackButton={false}
        showMenuButton={false}
        showDismissButton={true}
        rightText="Edit"
        onRightPress={handleEdit}
      />
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Profile Section */}
          <View className="items-center py-8">
            {/* Avatar */}
            <View className="mb-6">
              {isSpecial === 'true' ? (
                <View className="w-32 h-32 rounded-3xl bg-orange-400 items-center justify-center">
                  <View className="w-28 h-28 rounded-2xl bg-yellow-400 items-center justify-center">
                    <Text className="text-black font-bold text-sm">OEUFS</Text>
                    <Text className="text-black text-xs">DE QUALITÉ</Text>
                    <Text className="text-red-500 font-bold text-xs">2.500</Text>
                  </View>
                </View>
              ) : (
                <Avatar
                  text={avatarText as string}
                  size={128}
                  backgroundColor={avatarBg as string}
                />
              )}
            </View>

            {/* Name with verification and heart */}
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 font-bold text-3xl mr-2">
                {name}
              </Text>
              {isVerified === 'true' && (
                <View className="w-8 h-8 bg-teal-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              )}
            </View>
          </View>

          {/* Wesapp Code Section */}
          <View className="mx-6 mb-8">
            <View className="bg-gray-100 rounded-2xl p-6">
              <Text className="text-gray-600 font-medium text-lg mb-2">Wesapp Code</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 font-bold text-2xl flex-1">{wesappCode}</Text>
                <View className="flex-row ml-4">
                  <TouchableOpacity 
                    className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3"
                    onPress={handleMessage}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <MessageIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3"
                    onPress={handleVideoCall}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <VideoCallIcon width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center"
                    onPress={handleVoiceCall}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <VoiceCallIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 gap-4 space-y-4">
            <TouchableOpacity 
              className="bg-gray-100 rounded-2xl px-6 py-3"
              onPress={handleBlock}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-teal-600 font-semibold text-xl text-center">
                Block this Wesapp code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-gray-100 rounded-2xl px-6 py-3"
              onPress={handleDelete}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-teal-600 font-semibold text-xl text-center">
                Delete this Wesapp code
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}