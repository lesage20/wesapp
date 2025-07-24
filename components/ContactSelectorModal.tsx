import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { MessageContact } from './MessageBubble';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  imageUri?: string;
}

interface ContactSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onContactSelected: (contact: MessageContact) => void;
}

export default function ContactSelectorModal({
  visible,
  onClose,
  onContactSelected
}: ContactSelectorModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  useEffect(() => {
    if (searchText) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.phoneNumber.includes(searchText)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchText, contacts]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Contacts permission is required to select contacts.');
        onClose();
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
      });

      if (data.length > 0) {
        const formattedContacts: Contact[] = data
          .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => ({
            id: contact.id || Math.random().toString(),
            name: contact.name || 'Unknown',
            phoneNumber: contact.phoneNumbers?.[0]?.number || '',
            imageUri: contact.imageAvailable ? contact.image?.uri : undefined,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setContacts(formattedContacts);
        setFilteredContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Unable to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    const messageContact: MessageContact = {
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      avatar: contact.name.charAt(0).toUpperCase()
    };
    
    onContactSelected(messageContact);
    onClose();
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => handleContactSelect(item)}
      className="flex-row items-center py-4 px-4 border-b border-gray-100"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="w-12 h-12 rounded-full" />
        ) : (
          <View className="w-12 h-12 rounded-full bg-teal-100 items-center justify-center">
            <Text className="text-teal-600 font-semibold text-lg">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {item.phoneNumber}
        </Text>
      </View>

      {/* Selection indicator */}
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Select Contact
          </Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Search contacts..."
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text className="text-gray-500 mt-4">Loading contacts...</Text>
          </View>
        ) : filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          />
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              {searchText 
                ? `No contacts found for "${searchText}"`
                : 'No contacts found'
              }
            </Text>
            {!searchText && (
              <Text className="text-gray-400 mt-2 text-sm text-center">
                Make sure you have contacts saved on your device
              </Text>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}