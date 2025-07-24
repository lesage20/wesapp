import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import verifyOTP from '~/api/services/verification';
import { useAuthStore } from '~/store/store';
import { User } from '~/types';

export default function VerificationScreen() {
  const { phoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber) {
      setError('Numéro de téléphone manquant');
      setLoadingMessage('');
      return;
    }

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Veuillez entrer un code de 6 chiffres');
      setLoadingMessage('');
      return;
    }

    try {
      setLoadingMessage('Vérification du code...');
      console.log('Tentative de vérification du code OTP:', { phone: phoneNumber, code: verificationCode });

      // Call verifyOTP
      const result = await verifyOTP(verificationCode, phoneNumber as string);
      console.log('Résultat de verifyOTP:', result);


      // Determine redirection based on result
      if (result.isNewUser || result.pendingUserId) {
        setLoadingMessage('Premier accès détecté - Redirection vers la création de profil...');
        console.log('✓ NOUVEL UTILISATEUR CONFIRMÉ - Redirection vers /add-code');
        setTimeout(() => {
          router.replace('/profile-setup');
        }, 300);
      } else {
        const { login } = useAuthStore();
        login(result.user);
        setLoadingMessage('Compte existant - Connexion réussie, redirection...');
        console.log('✓ UTILISATEUR EXISTANT CONFIRMÉ - Redirection vers /calls');
        setTimeout(() => {
          router.replace('/(drawer)/(tabs)');
        }, 300);
      }
    } catch (error: any) {
      setLoadingMessage('');
      console.error('Erreur lors de la vérification OTP:', error);

      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Code de vérification invalide.';
        } else if (error.response.status === 404) {
          errorMessage = 'Numéro de téléphone non trouvé.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View className="flex-1 justify-center items-center min-h-[40vh]">
            <Image
              source={require('~/assets/images/logo.png')}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>

          {/* Form Section */}
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <Text className="text-2xl font-bold text-center mb-2 text-gray-900">
              Enter your verification code
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Verification code sent to {phoneNumber}
            </Text>

            {error && (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            )}
            {loadingMessage && (
              <Text className="text-gray-600 text-center mb-4">{loadingMessage}</Text>
            )}

            <Text className="text-gray-900 font-medium mb-6">
              Verification code ?
            </Text>

            {/* Code Input Fields */}
            <View className="flex-row justify-between mb-12">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold text-gray-900"
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className={`py-4 rounded-lg ${isCodeComplete ? 'bg-teal-600' : 'bg-gray-300'}`}
              onPress={handleSubmit}
              disabled={!isCodeComplete}
            >
              <Text className={`text-center font-semibold text-lg ${isCodeComplete ? 'text-white' : 'text-gray-500'}`}>
                Vérifier le code
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}