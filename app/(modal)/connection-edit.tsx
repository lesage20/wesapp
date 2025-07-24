import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomHeader from '~/components/CustomHeader';
import Avatar from '~/components/Avatar';

export default function ConnectionEditScreen() {
  const router = useRouter();
  const { 
    connectionId, 
    name, 
    wesappCode, 
    avatarText, 
    avatarBg, 
    isSpecial 
  } = useLocalSearchParams();

  const [editedName, setEditedName] = useState(name as string);

  const handleSave = () => {
    console.log('Saving changes for:', connectionId, 'New name:', editedName);
    // Handle save logic here
    router.back(); // Close edit modal
  };

  const handleCancel = () => {
    router.back(); // Close edit modal without saving
  };

  return (
    <>
      <CustomHeader 
        title="Edit Connection"
        showDismissButton={true}
        rightText="Save"
        onRightPress={handleSave}
      />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6">
          {/* Profile Section */}
          <View className="items-center py-8">
            {/* Avatar */}
            <View className="mb-6">
              {isSpecial === 'true' ? (
                <View className="w-32 h-32 rounded-3xl bg-orange-400 items-center justify-center">
                  <View className="w-28 h-28 rounded-2xl bg-yellow-400 items-center justify-center">
                    <Text className="text-black font-bold text-sm">OEUFS</Text>
                    <Text className="text-black text-xs">DE QUALITÉ</Text>
                    <Text className="text-red-500 font-bold text-xs">2.500</Text>
                  </View>
                </View>
              ) : (
                <Avatar
                  text={avatarText as string}
                  size={128}
                  backgroundColor={avatarBg as string}
                />
              )}
            </View>

            <Text className="text-gray-600 text-lg mb-4">Wesapp Code: {wesappCode}</Text>
          </View>

          {/* Edit Form */}
          <View>
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-lg mb-2">Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-lg"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter name"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-lg mb-2">Notes</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-lg"
                placeholder="Add notes about this connection..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-8 mb-8">
            <TouchableOpacity 
              className="flex-1 bg-gray-200 rounded-lg py-4 mr-2"
              onPress={handleCancel}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-gray-700 font-semibold text-lg text-center">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-teal-600 rounded-lg py-4 ml-2"
              onPress={handleSave}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text className="text-white font-semibold text-lg text-center">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}