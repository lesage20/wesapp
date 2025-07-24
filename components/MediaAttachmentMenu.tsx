import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { MessageContact, MessageDocument, MessageLocation } from './MessageBubble';
import ContactSelectorModal from './ContactSelectorModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type AttachmentType = 'camera' | 'gallery' | 'document' | 'contact' | 'location';

interface AttachmentOption {
  type: AttachmentType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

interface MediaAttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string, type: 'camera' | 'gallery') => void;
  onVideoSelected: (uri: string, thumbnail?: string, duration?: number) => void;
  onDocumentSelected: (document: MessageDocument) => void;
  onContactSelected: (contact: MessageContact) => void;
  onLocationSelected: (location: MessageLocation) => void;
}

const ATTACHMENT_OPTIONS: AttachmentOption[] = [
  {
    type: 'camera',
    label: 'Camera',
    icon: 'camera',
    color: '#FFFFFF',
    bgColor: '#EF4444'
  },
  {
    type: 'gallery',
    label: 'Gallery',
    icon: 'images',
    color: '#FFFFFF',
    bgColor: '#8B5CF6'
  },
  {
    type: 'document',
    label: 'Document',
    icon: 'document-text',
    color: '#FFFFFF',
    bgColor: '#3B82F6'
  },
  {
    type: 'contact',
    label: 'Contact',
    icon: 'person',
    color: '#FFFFFF',
    bgColor: '#10B981'
  },
  {
    type: 'location',
    label: 'Location',
    icon: 'location',
    color: '#FFFFFF',
    bgColor: '#F59E0B'
  }
];

export default function MediaAttachmentMenu({
  visible,
  onClose,
  onImageSelected,
  onVideoSelected,
  onDocumentSelected,
  onContactSelected,
  onLocationSelected
}: MediaAttachmentMenuProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [showContactSelector, setShowContactSelector] = useState(false);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Media library permission is required to select photos.');
      return false;
    }
    return true;
  };

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Contacts permission is required to share contacts.');
      return false;
    }
    return true;
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is required to share location.');
      return false;
    }
    return true;
  };

  const handleOptionPress = async (type: AttachmentType) => {
    // Ne pas fermer immédiatement pour l'option contact
    if (type !== 'contact') {
      onClose();
    }

    try {
      switch (type) {
        case 'camera':
          if (await requestCameraPermission()) {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images', 'videos'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              if (asset.type === 'video') {
                onVideoSelected(asset.uri, undefined, asset.duration);
              } else {
                onImageSelected(asset.uri, 'camera');
              }
            }
          }
          break;

        case 'gallery':
          if (await requestMediaLibraryPermission()) {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images', 'videos'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              if (asset.type === 'video') {
                onVideoSelected(asset.uri, undefined, asset.duration);
              } else {
                onImageSelected(asset.uri, 'gallery');
              }
            }
          }
          break;

        case 'document':
          const docResult = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: false
          });

          if (!docResult.canceled && docResult.assets[0]) {
            const doc = docResult.assets[0];
            onDocumentSelected({
              name: doc.name,
              size: doc.size || 0,
              mimeType: doc.mimeType || 'application/octet-stream',
              uri: doc.uri
            });
          }
          break;

        case 'contact':
          setShowContactSelector(true);
          // setTimeout(() => onClose(), 100); // Fermer après un court délai
          break;

        case 'location':
          if (await requestLocationPermission()) {
            try {
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });

              // Get address from coordinates (you might want to use a geocoding service)
              const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });

              const locationName = address[0] 
                ? `${address[0].street || ''} ${address[0].city || ''}`
                : 'Current Location';

              onLocationSelected({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                name: locationName.trim() || 'Current Location'
              });
            } catch (error) {
              Alert.alert('Error', 'Unable to get current location.');
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling attachment option:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: fadeAnim,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 100 }}>
            <Animated.View
              style={{
                margin: 16,
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                transform: [{ scale: scaleAnim }],
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                {ATTACHMENT_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={option.type}
                    onPress={() => handleOptionPress(option.type)}
                    style={{
                      alignItems: 'center',
                      marginBottom: 20,
                      width: '30%',
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: option.bgColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name={option.icon} size={28} color={option.color} />
                    </View>
                    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Contact Selector Modal */}
      <ContactSelectorModal
        visible={showContactSelector}
        onClose={() => {
          setShowContactSelector(false);
          onClose();
        }}
        onContactSelected={(contact) => {
          onContactSelected(contact);
          setShowContactSelector(false);
          onClose();
        }}
      />
    </Modal>
  );
}