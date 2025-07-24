import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { useRouter } from 'expo-router';
import { useAuth } from '~/hooks';

export default function LoginScreen() {
  const [countryCode, setCountryCode] = useState('CI');
  const [country, setCountry] = useState({ callingCode: ['225'], cca2: 'CI' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const router = useRouter();
  
  // Hook d'authentification
  const { requestOTP, isLoading, error } = useAuth();

  const handleSendCode = async () => {
    if (phoneNumber.trim()) {
      const fullPhoneNumber = `+${country.callingCode[0]}${phoneNumber}`;
      
      try {
        await requestOTP(fullPhoneNumber);
        // Navigation vers la vérification en cas de succès
        router.push({
          pathname: '/(auth)/verification',
          params: { phoneNumber: fullPhoneNumber }
        });
      } catch (err) {
        // L'erreur est déjà gérée par le hook (toast)
        console.error('Erreur lors de l\'envoi OTP:', err);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={'padding'}
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
          Create an account
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Sign up your account to continue
        </Text>

        <Text className="text-gray-900 font-medium mb-4">
          What is your phone number ?
        </Text>

        {/* Phone Input */}
        <View className="flex-row items-center border border-gray-300 rounded-lg mb-8">
          <TouchableOpacity 
            className="flex-row items-center px-4 py-4 border-r border-gray-300"
            onPress={() => setShowCountryPicker(true)}
          >
            <CountryPicker
              countryCode={countryCode}
              withFilter
              withFlag
              onSelect={(selectedCountry) => {
                setCountry(selectedCountry);
                setCountryCode(selectedCountry.cca2);
              }}
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
            />
            <Text className="ml-2 text-gray-900">
              +{country.callingCode[0]}
            </Text>
          </TouchableOpacity>
          
          <TextInput
            className="flex-1 px-4 py-4 text-gray-900"
            placeholder=""
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Terms */}
        <Text className="text-gray-500 text-center mb-6">
          By continuing, you agree to WeSapp{' '}
          <Text className="font-semibold text-gray-700">Privacy Policy</Text>
          {' '}and{' '}
          <Text className="font-semibold text-gray-700">General Terms</Text>
          {' '}of use
        </Text>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Send Code Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg ${isLoading || !phoneNumber.trim() ? 'bg-gray-400' : 'bg-teal-600'}`}
            onPress={handleSendCode}
            disabled={isLoading || !phoneNumber.trim()}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold text-lg ml-2">
                  Sending...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Send code
              </Text>
            )}
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}