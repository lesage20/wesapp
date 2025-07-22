import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { View, Text } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Small delay to let the store hydrate from AsyncStorage
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(drawer)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Show loading while determining auth state
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Text className="text-white">Loading...</Text>
    </View>
  );
}