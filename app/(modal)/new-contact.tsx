import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '~/components/CustomHeader';
import { useContacts } from '~/hooks/api/useContacts';

export default function NewContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { checkCode, fetchWeSappUsers, isLoading: contactsLoading } = useContacts();

  const handleRegister = async () => {
    // Validation des champs
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone');
      return;
    }

    // Validation du format du numéro (basique)
    if (phoneNumber.length < 8) {
      Alert.alert('Erreur', 'Le numéro de téléphone semble incorrect');
      return;
    }

    setIsLoading(true);

    try {
      // Formatage du numéro de téléphone
      let formattedPhone = phoneNumber.trim();
      
      // Si le numéro ne commence pas par +, on ajoute +225 (Côte d'Ivoire)
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+225' + formattedPhone.substring(1);
        } else {
          formattedPhone = '+225' + formattedPhone;
        }
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUsers = await fetchWeSappUsers();
      const existingUser = existingUsers.find((user: any) => 
        user.phone_number === formattedPhone || 
        user.code === name.trim()
      );

      if (existingUser) {
        Alert.alert(
          'Contact trouvé',
          `${existingUser.username || existingUser.code} est déjà dans vos connexions.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Retourner à la liste des discussions
                router.push('/(drawer)/(tabs)/conversations');
              }
            }
          ]
        );
        return;
      }

      // Vérifier le code utilisateur
      const checkResult = await checkCode(name.trim());
      
      if (checkResult.success) {
        Alert.alert(
          'Contact ajouté',
          `${name} a été ajouté à vos connexions.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Retourner à la liste des discussions
                router.push('/(drawer)/(tabs)/conversations');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Contact non trouvé',
          'Aucun utilisateur WeSapp trouvé avec ces informations. Vérifiez le nom d\'utilisateur ou le code WeSapp.',
          [
            { text: 'Réessayer', style: 'cancel' },
            {
              text: 'Scanner QR',
              onPress: () => router.push('/(modal)/scan-qr')
            }
          ]
        );
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le contact. Vérifiez votre connexion internet.',
        [
          { text: 'Réessayer', style: 'cancel' },
          {
            text: 'Scanner QR',
            onPress: () => router.push('/(modal)/scan-qr')
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodePress = () => {
    router.push('/(modal)/scan-qr');
  };

  const loading = isLoading || contactsLoading;

  return (
    <>
      <CustomHeader 
        title="New Contact"
        showBackButton={true}
        showMenuButton={false}
        rightContent={
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading || !name.trim() || !phoneNumber.trim()}
            className={`px-4 py-2 ${
              loading || !name.trim() || !phoneNumber.trim() 
                ? 'opacity-50' 
                : ''
            }`}
          >
            <Text className="text-teal-600 font-medium text-lg">
              {loading ? 'Loading...' : 'Register'}
            </Text>
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 px-6 py-6">
          {/* Champ Nom/Code WeSapp */}
          <View className="mb-6">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-gray-900 text-lg"
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Text className="text-gray-500 text-sm mt-2 px-2">
              Entrez le nom d'utilisateur ou le code WeSapp
            </Text>
          </View>

          {/* Champ Numéro de téléphone */}
          <View className="mb-8">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-gray-900 text-lg"
              placeholder="+225-8554-73-223"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!loading}
            />
            <Text className="text-gray-500 text-sm mt-2 px-2">
              Numéro de téléphone (optionnel pour la vérification)
            </Text>
          </View>

          {/* Bouton Add via QR Code */}
          <TouchableOpacity 
            className="flex-row items-center justify-center bg-gray-50 rounded-lg px-4 py-4 border border-gray-200 mb-6"
            onPress={handleQRCodePress}
            disabled={loading}
          >
            <Ionicons name="qr-code-outline" size={24} color="#0F766E" />
            <Text className="ml-3 text-teal-600 font-medium text-lg">
              Add via QR Code
            </Text>
          </TouchableOpacity>

          {/* Informations supplémentaires */}
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-600 text-center mb-2">From Messages</Text>
            <Text className="text-gray-800 text-center font-mono text-lg">12345</Text>
            <Text className="text-gray-500 text-xs text-center mt-2">
              Code de vérification pour les messages
            </Text>
          </View>

          {/* Message d'aide */}
          <View className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Text className="text-blue-800 text-sm text-center">
              💡 Conseil : Utilisez le code WeSapp de votre contact ou scannez son QR code pour un ajout plus rapide
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}