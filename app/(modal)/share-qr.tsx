import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '~/store/store';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  isSelected?: boolean;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function ShareQRScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Generate QR data and share URL
  const qrData = JSON.stringify({
    type: 'wesapp_contact',
    userId: user?.id || 'default-id',
    username: user?.username || 'Sneezy',
    wesappCode: 'SNZ-' + (user?.id?.slice(-4) || '1234') + '-CIV'
  });

  const shareUrl = `https://aliko.be/7GxXKBCdL2k`;

  // Mock contacts
  const contacts: Contact[] = [
    { id: '1', name: 'Samuel', avatar: '👤' },
    { id: '2', name: 'Guillaume', avatar: '👤' },
    { id: '3', name: 'Herve', avatar: '👤' },
    { id: '4', name: 'Carlos', avatar: '👤' },
  ];

  // Share platforms
  const platforms: SharePlatform[] = [
    {
      id: 'messages',
      name: 'Messages',
      icon: '💬',
      color: '#007AFF',
      onPress: () => handleNativeShare()
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '📱',
      color: '#25D366',
      onPress: () => handleWhatsAppShare()
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      onPress: () => handleInstagramShare()
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      onPress: () => handleTwitterShare()
    },
    {
      id: 'messenger',
      name: 'Messenger',
      icon: '💬',
      color: '#0084FF',
      onPress: () => handleMessengerShare()
    }
  ];

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: `Connect with me on WeSapp! ${shareUrl}`,
        url: shareUrl,
        title: 'My WeSapp QR Code'
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleWhatsAppShare = () => {
    console.log('Share to WhatsApp');
    handleNativeShare();
  };

  const handleInstagramShare = () => {
    console.log('Share to Instagram');
    handleNativeShare();
  };

  const handleTwitterShare = () => {
    console.log('Share to Twitter');
    handleNativeShare();
  };

  const handleMessengerShare = () => {
    console.log('Share to Messenger');
    handleNativeShare();
  };

  const handleCopyLink = async () => {
    try {
      // Copy to clipboard functionality would go here
      Alert.alert('Copied!', 'Link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleContactSelect = (contactId: string) => {
    console.log('Selected contact:', contactId);
    // Handle contact selection for direct sharing
  };

  return (
    <>
      <CustomHeader 
        title="QR Code"
        showDismissButton={true}
      />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* QR Code Section */}
          <View className="items-center py-6 bg-gray-50">
            <View className="bg-white rounded-3xl p-6 shadow-sm">
              {/* User Info */}
              <View className="items-center mb-4">
                <View className="mb-2">
                  <Avatar
                    imageUrl={user?.profileImage}
                    text={user?.username?.charAt(0) || 'S'}
                    size={60}
                    backgroundColor="blue-500"
                  />
                </View>
                <Text className="text-gray-900 font-bold text-lg">
                  {user?.username || 'Sneezy'}
                </Text>
              </View>

              {/* QR Code */}
              <View className="items-center">
                <QRCode
                  value={qrData}
                  size={160}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </View>
          </View>

          {/* Contacts Section */}
          <View className="px-6 py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-4">
                {contacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    onPress={() => handleContactSelect(contact.id)}
                    className="items-center"
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <View className="relative">
                      <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-2">
                        <Text className="text-2xl">{contact.avatar}</Text>
                      </View>
                      <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xs">+</Text>
                      </View>
                    </View>
                    <Text className="text-gray-900 text-sm font-medium text-center">
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Share Platforms */}
          <View className="px-6 py-4">
            <View className="flex-row justify-center space-x-6">
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  onPress={platform.onPress}
                  className="items-center"
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: platform.color }}
                  >
                    <Text className="text-2xl">{platform.icon}</Text>
                  </View>
                  <Text className="text-gray-700 text-xs font-medium text-center">
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Copy Link Section */}
          <View className="px-6 py-4">
            <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center justify-between">
              <Text className="text-gray-700 text-sm flex-1 mr-4" numberOfLines={1}>
                {shareUrl}
              </Text>
              <TouchableOpacity
                onPress={handleCopyLink}
                className="bg-teal-600 px-4 py-2 rounded-lg"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text className="text-white font-semibold">Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}