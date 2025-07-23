import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';

export default function ScanQRScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned!',
      `Data: ${data}`,
      [
        {
          text: 'Add Friend',
          onPress: () => {
            console.log('Adding friend with data:', data);
            // Handle add friend logic
            router.back();
          }
        },
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
          style: 'cancel'
        }
      ]
    );
  };

  const handleGoToMyQR = () => {
    router.push('/(modal)/my-qr');
  };

  const handleGoToScanQR = () => {
    // Already on scan page, just reset
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <>
        <CustomHeader
          title="QR Code"
          showDismissButton={true}
        />
        <SafeAreaView className="flex-1 bg-black items-center justify-center">
          <Text className="text-white text-lg">Requesting camera permission...</Text>
        </SafeAreaView>
      </>
    );
  }

  if (hasPermission === false) {
    return (
      <>
        <CustomHeader
          title="QR Code"
          showDismissButton={true}
        />
        <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
          <Text className="text-white text-lg text-center mb-4">
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity
            className="bg-teal-600 px-6 py-3 rounded-lg"
            onPress={() => {
              Camera.requestCameraPermissionsAsync().then(({ status }) => {
                setHasPermission(status === 'granted');
              });
            }}
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <CustomHeader
        title="QR Code"
        showDismissButton={true}
        rightContent={
          <TouchableOpacity className="p-2">
            <Ionicons name="flash" size={24} color="#14B8A6" />
          </TouchableOpacity>
        }
      />
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          {/* Camera View */}
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417'],
            }}
          />

          {/* Overlay */}
          <View className="flex-1 justify-center items-center">
            {/* Scanning Frame */}
            <View className="w-64 h-64 border-2 border-white rounded-3xl relative">
              {/* Corner decorations */}
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-2xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-2xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-2xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-2xl" />
            </View>
          </View>

          {/* Bottom instruction */}
          <View className="absolute bottom-32 left-0 right-0 items-center">
            <View className="bg-black/70 rounded-full px-6 py-3">
              <Text className="text-white text-lg font-medium">
                Scan QR code to add friend
              </Text>
            </View>
          </View>

          {/* Bottom Navigation */}
          <View className="absolute bottom-8 left-0 right-0 flex-row justify-center">
            <View className="flex-row justify-center gap-4 space-x-4 bg-gray-200 rounded-full px-2 py-2">
              <TouchableOpacity
                onPress={handleGoToScanQR}
                className="bg-teal-600 px-8 py-2 rounded-full"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text className="text-white font-semibold text-lg">Scan a Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoToMyQR}
                className="bg-white px-8 py-2 rounded-full "
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text className="text-teal-600 font-semibold text-lg">My QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}