import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import VideoCallIcon from '~/assets/svgs/chat/video-call';
import VoiceCallIcon from '~/assets/svgs/chat/voice-call';
import SendIcon from '~/assets/svgs/chat/send';
import MicIcon from '~/assets/svgs/chat/mic';

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');

  // Get contact data based on ID
  const getContactData = (contactId: string) => {
    switch (contactId) {
      case '456-qsns-civ':
        return {
          name: '456-QSNS-CIV',
          shortName: '456-QSNS-C...',
          avatar: 'A',
          avatarBg: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
        };
      case 'narcisse-pro':
        return {
          name: 'Narcisse professionnels',
          shortName: 'Narcisse...',
          avatar: 'OEUFS',
          avatarBg: 'bg-orange-400',
          isSpecialAvatar: true
        };
      case 'akissi':
        return {
          name: 'Akissi ❤️',
          shortName: 'Akissi ❤️',
          avatar: 'A',
          avatarBg: 'bg-pink-500'
        };
      case 'kamate-drissa':
        return {
          name: 'Kamaté drissa',
          shortName: 'Kamaté...',
          avatar: 'K',
          avatarBg: 'bg-green-500'
        };
      default:
        return {
          name: 'Contact',
          shortName: 'Contact',
          avatar: 'C',
          avatarBg: 'bg-gray-500'
        };
    }
  };

  const contact = getContactData(id as string);

  // Mock messages
  const messages: Message[] = [
    {
      id: '1',
      text: 'Salut ! Comment ça va ?',
      isOwn: false,
      timestamp: '14:30'
    },
    {
      id: '2',
      text: 'Ça va bien merci ! Et toi ?',
      isOwn: true,
      timestamp: '14:32'
    },
    {
      id: '3',
      text: 'Super ! Tu fais quoi ce soir ?',
      isOwn: false,
      timestamp: '14:35'
    },
    {
      id: '4',
      text: 'Je pensais aller au cinéma, tu veux venir ?',
      isOwn: true,
      timestamp: '14:37'
    },
    {
      id: '5',
      text: 'Excellente idée ! Quel film ?',
      isOwn: false,
      timestamp: '14:40'
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <>
      <CustomHeader 
        showAvatar={true}
        title={contact.shortName}
        subtitle="Online"
        avatarBg={contact.avatarBg}
        avatarText={contact.avatar}
        isSpecialAvatar={contact.isSpecialAvatar}
        onAvatarPress={() => router.push(`/contact-profile/${id}`)}
        rightContent={
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 mr-2">
              <VideoCallIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <VoiceCallIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        }
      />
      <SafeAreaView className="flex-1">
        <ImageBackground 
          source={require('~/assets/images/chat-bg.png')} 
          className="flex-1"
          resizeMode="cover"
        >
          {/* Messages Container */}
          <ScrollView className="flex-1 px-4 py-4">
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                className={`mb-3 ${msg.isOwn ? 'items-end' : 'items-start'}`}
              >
                <View 
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.isOwn 
                      ? 'bg-white/90 rounded-br-md' 
                      : 'bg-gray-800/80 rounded-bl-md'
                  }`}
                >
                  <Text 
                    className={`text-base ${
                      msg.isOwn ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text className="text-white/70 text-xs mt-1 px-2">
                  {msg.timestamp}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Section */}
          <View className="bg-white px-4 py-3 flex-row items-center">
            <TouchableOpacity className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
              <Ionicons name="add" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <TextInput
                className="flex-1 text-gray-900"
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                multiline
              />
            </View>

            <TouchableOpacity className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center ml-3">
              <Ionicons name="location" size={20} color="#14B8A6" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSend}
              className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center ml-2"
            >
              <MicIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}