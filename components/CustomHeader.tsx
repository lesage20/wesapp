import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '~/assets/svgs/header/back';
import MenuIcon from '~/assets/svgs/header/menu';

interface CustomHeaderProps {
  // Basic props
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onBackPress?: () => void;
  
  // Avatar props
  showAvatar?: boolean;
  avatarImage?: string;
  avatarText?: string;
  avatarBg?: string;
  isSpecialAvatar?: boolean;
  onAvatarPress?: () => void;
  
  // User info (for chat-style headers)
  subtitle?: string;
  
  // Right side content
  rightContent?: React.ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  
  // Style props
  backgroundColor?: string;
  titleAlign?: 'left' | 'center';
  shadowVisible?: boolean;
  
  // Custom content
  customTitle?: React.ReactNode;
}

export default function CustomHeader({
  title = '',
  showBackButton = true,
  showMenuButton = false,
  onBackPress,
  showAvatar = false,
  avatarImage,
  avatarText = 'A',
  avatarBg = 'bg-gray-500',
  isSpecialAvatar = false,
  onAvatarPress,
  subtitle,
  rightContent,
  rightText,
  onRightPress,
  backgroundColor = '#fbf9fa',
  titleAlign = 'center',
  shadowVisible = false,
  customTitle,
}: CustomHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderLeftContent = () => {
    if (showMenuButton) {
      return (
        <TouchableOpacity 
          onPress={handleMenuPress} 
          className="p-2 ml-4 bg-gray-200 rounded-lg"
        >
          <MenuIcon width={24} height={24} />
        </TouchableOpacity>
      );
    }
    
    if (showBackButton) {
      return (
        <TouchableOpacity 
          onPress={handleBackPress} 
          className="p-2"
        >
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  const renderTitleContent = () => {
    if (customTitle) {
      return customTitle;
    }

    if (showAvatar) {
      return (
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={onAvatarPress}
          disabled={!onAvatarPress}
        >
          <View className={`w-10 h-10 rounded-2xl ${avatarBg} items-center justify-center mr-3`}>
            {avatarImage ? (
              <Image 
                source={{ uri: avatarImage }} 
                className="w-10 h-10 rounded-2xl"
                resizeMode="cover"
              />
            ) : isSpecialAvatar ? (
              <View className="w-8 h-8 rounded-xl bg-yellow-400 items-center justify-center">
                <Text className="text-black font-bold text-xs">OEUFS</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-sm">{avatarText}</Text>
            )}
          </View>
          <View>
            <Text className="text-gray-900 font-semibold text-lg">{title}</Text>
            {subtitle && (
              <Text className="text-teal-500 text-sm">{subtitle}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    if (titleAlign === 'center') {
      return title;
    }

    return (
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-lg">{title}</Text>
      </View>
    );
  };

  const renderRightContent = () => {
    if (rightContent) {
      return rightContent;
    }

    if (rightText && onRightPress) {
      return (
        <TouchableOpacity className="p-2" onPress={onRightPress}>
          <Text className="text-teal-600 font-semibold text-lg">{rightText}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <Stack.Screen 
    
      options={{ 
        headerShown: true,
        headerStyle: { backgroundColor, borderBottomWidth: 1 , borderBottomColor: '#e2e8f0' },
        headerShadowVisible: shadowVisible,
        headerLeft: renderLeftContent,
        headerTitle: titleAlign === 'center' ? title : '',
        headerTitleAlign: titleAlign,
        headerRight: renderRightContent,
        ...(showAvatar || customTitle ? {
          headerTitle: renderTitleContent as any,
          
        } : {}),
      }} 
    />
  );
}