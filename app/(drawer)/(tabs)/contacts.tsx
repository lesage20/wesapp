import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
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

const CONTACTS_PER_PAGE = 20;

export default function ContactsScreen() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchText) {
      // Recherche dans TOUS les contacts (pas seulement ceux affichés)
      const filtered = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.phoneNumber.includes(searchText)
      );
      setFilteredContacts(filtered);
    } else {
      // Afficher les contacts paginés quand pas de recherche
      setFilteredContacts(displayedContacts);
    }
  }, [searchText, allContacts, displayedContacts]);

  // Effect pour charger plus de contacts quand currentPage change
  useEffect(() => {
    if (allContacts.length > 0 && !searchText) {
      loadMoreContacts();
    }
  }, [currentPage]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
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
            .sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique

          setAllContacts(formattedContacts);
          setCurrentPage(0);
          setHasMoreContacts(formattedContacts.length > CONTACTS_PER_PAGE);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreContacts = () => {
    const startIndex = currentPage * CONTACTS_PER_PAGE;
    const endIndex = startIndex + CONTACTS_PER_PAGE;
    const newContacts = allContacts.slice(startIndex, endIndex);
    
    if (currentPage === 0) {
      setDisplayedContacts(newContacts);
    } else {
      setDisplayedContacts(prev => [...prev, ...newContacts]);
    }
    
    setHasMoreContacts(endIndex < allContacts.length);
  };

  const handleLoadMore = () => {
    if (hasMoreContacts && !isLoadingMore && !searchText) {
      setIsLoadingMore(true);
      // Simuler un délai réseau pour éviter le lag
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 300);
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

        {/* Section Title with count */}
        <View className="px-4 py-2 flex-row items-center justify-between">
          <Text className="text-gray-600 font-medium">
            {searchText ? `Résultats de recherche (${filteredContacts.length})` : 'Contacts sur WeSapp'}
          </Text>
          {!searchText && allContacts.length > 0 && (
            <Text className="text-gray-400 text-sm">
              {displayedContacts.length} / {allContacts.length}
            </Text>
          )}
        </View>

        {/* Contacts List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text className="text-gray-500 mt-4">Chargement des contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              isLoadingMore && !searchText ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#14B8A6" />
                  <Text className="text-gray-500 mt-2 text-sm">Chargement de plus de contacts...</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">
                  {searchText ? 'Aucun contact trouvé pour cette recherche' : 'Aucun contact trouvé'}
                </Text>
                {searchText && (
                  <Text className="text-gray-400 mt-2 text-sm text-center px-8">
                    La recherche porte sur tous vos contacts ({allContacts.length} contacts)
                  </Text>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}