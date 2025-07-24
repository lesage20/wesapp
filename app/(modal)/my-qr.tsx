import React from 'react';
import { View, Text, TouchableOpacity, Share, Alert, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '~/store/store';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { getTailwindColor } from '~/utils/colors';

export default function MyQRScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  
  // Android navigation bar height (typical values: 48dp = ~24-48px depending on density)
  const androidNavHeight = Platform.OS === 'android' ? 48 : 0;

  // Generate QR data for the user
  const qrData = JSON.stringify({
    type: 'wesapp_contact',
    userId: user?.id || 'default-id',
    username: user?.username || 'Sneezy',
    wesappCode: 'SNZ-' + (user?.id?.slice(-4) || '1234') + '-CIV'
  });

  const handleShare = async () => {
    const shareUrl = `https://aliko.be/7GxXKBCdL2k`;
    const username = user?.username || 'Sneezy';

    try {
      const result = await Share.share({
        message: `Connect with me on WeSapp! My name is ${username}. ${shareUrl}`,
        url: shareUrl,
        title: `${username}'s WeSapp QR Code`
      });

      if (result.action === Share.sharedAction) {
        console.log('QR Code shared successfully');
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code. Please try again.');
    }
  };

  const handleGoToScanQR = () => {
    router.push('/(modal)/scan-qr');
  };

  const handleGoToMyQR = () => {
    // Already on my QR page
    console.log('Already on My QR page');
  };

  return (
    <>
      <CustomHeader
        title="QR Code"
        showDismissButton={true}
      />
      <SafeAreaView className="flex-1 bg-gray-50 pt-12">
        <View className="flex-column gap-5 items-center justify-between px-6">
          {/* QR Card */}
          <View className="bg-white rounded-3xl px-8 pt-5 pb-0 shadow-xl w-full max-w-sm border border-gray-200">
            {/* User Info */}
            <View className="items-center mb-5 ">
              <View className="mb-4 " style={{ position: 'absolute', top: -55 }}>
                <Avatar
                  imageUrl={user?.profileImage}
                  text={user?.username?.charAt(0) || 'S'}
                  size={80}
                  backgroundColor="teal-700"
                />
              </View>
              <Text className="text-gray-900 font-bold text-xl mt-[2.2em]">
                {user?.username || 'Sneezy'}
              </Text>
            </View>

            {/* QR Code */}
            <View className="items-center mb-8">
              <View className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCode
                  value={qrData}
                  size={200}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </View>
          </View>

          {/* Share Button */}
          <View className="">
            <TouchableOpacity
              onPress={handleShare}
              className="mt-8 border-2 border-teal-600 rounded-full px-8 py-4 flex-row items-center"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <View className="mr-3">
                <Ionicons name="share-outline" size={24} color={getTailwindColor('teal-600')} />
              </View>
              <Text className="text-teal-600 font-semibold text-lg">Share</Text>
            </TouchableOpacity>
          </View>
          
        </View>
        {/* Bottom Navigation */}
        <View 
          className="absolute left-0 right-0 flex-row justify-center"
          style={{ 
            bottom: Platform.OS === 'android' ? (androidNavHeight + 32) : 32 
          }}
        >
          <View className="flex-row justify-center gap-4 space-x-4 bg-gray-200 rounded-full px-2 py-2">
            <TouchableOpacity
              onPress={handleGoToScanQR}
              className="bg-white px-8 py-2 rounded-full"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-teal-600 font-semibold text-lg">Scan a Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoToMyQR}
              className="bg-teal-600 px-8 py-2 rounded-full "
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-white font-semibold text-lg">My QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      
      {/* Android Navigation Bar Background - Only on Android */}
      {Platform.OS === 'android' && (
        <View 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: androidNavHeight,
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
          }}
        />
      )}
    </>
  );
}