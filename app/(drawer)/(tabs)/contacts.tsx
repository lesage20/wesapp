import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import CustomHeader from '~/components/CustomHeader';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  imageUri?: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

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
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        });

        if (data.length > 0) {
          const formattedContacts: Contact[] = data
            .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
            .slice(0, 20) // Limite pour la démo
            .map(contact => ({
              id: contact.id || Math.random().toString(),
              name: contact.name || 'Unknown',
              phoneNumber: contact.phoneNumbers?.[0]?.number || '',
              imageUri: contact.imageAvailable ? contact.image?.uri : undefined,
            }));

          setContacts(formattedContacts);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    }
  };

  const handleContactPress = (contact: Contact) => {
    console.log('Contact pressed:', contact);
    // Ici on pourrait naviguer vers une page de détail ou démarrer un appel
  };

  const handleAddContact = (contact: Contact) => {
    console.log('Add contact to WeSapp:', contact);
    // Logique pour ajouter le contact à WeSapp
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View className="flex-row items-center py-4 px-4 border-b border-gray-100">
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} className="w-12 h-12 rounded-full" />
        ) : (
          <View className="w-12 h-12 rounded-full bg-teal-100 items-center justify-center">
            <Ionicons name="person" size={20} color="#14B8A6" />
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.phoneNumber}</Text>
        <Text className="text-xs text-gray-400">In my contacts</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleContactPress(item)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
        >
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAddContact(item)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="add" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (hasPermission === false) {
    return (
      <>
        <CustomHeader 
          title="Contacts"
          showMenuButton={true}
          showBackButton={false}
        />
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="contacts" size={64} color="#9CA3AF" />
            <Text className="text-lg text-gray-600 mt-4 text-center">
              Permission requise pour accéder aux contacts
            </Text>
            <TouchableOpacity
              onPress={loadContacts}
              className="bg-teal-600 px-6 py-3 rounded-lg mt-4"
            >
              <Text className="text-white font-semibold">Autoriser l'accès</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <CustomHeader 
        title="Contacts"
        showMenuButton={true}
        showBackButton={false}
      />
      <SafeAreaView className="flex-1 bg-white">
        {/* Search Bar */}
        <View className="px-4 py-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-0 border border-gray-200 border-1">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Search"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Section Title */}
        <View className="px-4 py-2">
          <Text className="text-gray-600 font-medium">Contacts sur WeSapp</Text>
        </View>

        {/* Contacts List */}
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">
                {hasPermission ? 'Aucun contact trouvé' : 'Chargement des contacts...'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}