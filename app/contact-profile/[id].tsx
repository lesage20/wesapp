import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import MessageIcon from '~/assets/svgs/contact/message';
import VideoCallIcon from '~/assets/svgs/contact/video-call';
import VoiceCallIcon from '~/assets/svgs/contact/voice-call';

export default function ContactProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock contact data based on ID
  const getContactData = (contactId: string) => {
    switch (contactId) {
      case 'narcisse-pro':
        return {
          name: 'Narcisse professionnels',
          avatar: 'OEUFS',
          avatarBg: 'bg-orange-400',
          subtitle: 'Mon nouveau profil 3',
          identifier: '526-LQ-025-CIV',
          verified: true
        };
      case '456-qsns-civ':
        return {
          name: '456-QSNS-CIV',
          avatar: 'A',
          avatarBg: 'bg-blue-500',
          subtitle: 'Mon nouveau profil 1',
          identifier: '456-QSNS-CIV',
          verified: false
        };
      case 'akissi':
        return {
          name: 'Akissi ❤️',
          avatar: 'A',
          avatarBg: 'bg-pink-500',
          subtitle: 'Mon nouveau profil 2',
          identifier: 'AKI-SSI-001-CIV',
          verified: false
        };
      default:
        return {
          name: 'Contact',
          avatar: 'C',
          avatarBg: 'bg-gray-500',
          subtitle: 'Mon nouveau profil',
          identifier: 'UNKNOWN-ID',
          verified: false
        };
    }
  };

  const contact = getContactData(id as string);

  return (
    <>
      <CustomHeader 
        showBackButton={true}
        title=""
        rightText="Edit"
        onRightPress={() => console.log('Edit contact')}
      />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Profile Section */}
          <View className="items-center py-8">
            {/* Avatar */}
            <View className={`w-24 h-24 rounded-3xl ${contact.avatarBg} items-center justify-center mb-4`}>
              {contact.name === 'Narcisse professionnels' ? (
                <View className="w-20 h-20 rounded-2xl bg-yellow-400 items-center justify-center">
                  <Text className="text-black font-bold text-sm">OEUFS</Text>
                  <Text className="text-black text-xs">DE QUALITÉ</Text>
                  <Text className="text-red-500 font-bold text-xs">2.500</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-2xl">{contact.avatar}</Text>
              )}
            </View>

            {/* Name with verification */}
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 font-bold text-2xl">{contact.name}</Text>
              {contact.verified && (
                <View className="w-6 h-6 bg-teal-500 rounded-full items-center justify-center ml-2">
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
      </SafeAreaView>
    </>
  );
}