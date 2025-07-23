import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '~/assets/svgs/header/back';
import MenuIcon from '~/assets/svgs/header/menu';
import Avatar from '~/components/Avatar';
import { getTailwindColor, type TailwindColorName } from '~/utils/colors';

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
  avatarBg?: TailwindColorName | string;
  isSpecialAvatar?: boolean;
  onAvatarPress?: () => void;
  
  // User info (for chat-style headers)
  subtitle?: string;
  
  // Right side content
  rightContent?: React.ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  
  // Style props
  backgroundColor?: TailwindColorName | string;
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
  avatarBg = 'gray-500',
  isSpecialAvatar = false,
  onAvatarPress,
  subtitle,
  rightContent,
  rightText,
  onRightPress,
  backgroundColor = 'gray-50',
  titleAlign = 'center',
  shadowVisible = false,
  customTitle,
}: CustomHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();

  const getResolvedColor = (color: TailwindColorName | string): string => {
    // If it's already a hex color, return as is
    if (color.startsWith('#')) return color;
    // Otherwise, resolve from Tailwind colors
    return getTailwindColor(color as TailwindColorName);
  };

  const handleBackPress = () => {
    console.log('handleBackPress', onBackPress);
    // if (onBackPress) {
    //   onBackPress();
    // } else {
      router.back();
    // }
  };

  const handleMenuPress = () => {
    console.log('handleMenuPress');
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderLeftContent = () => {
    if (showMenuButton) {
      return (
        <TouchableOpacity 
          onPress={handleMenuPress} 
          className="p-2 ml-4 bg-gray-200 rounded-lg"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <MenuIcon width={24} height={24} />
        </TouchableOpacity>
      );
    }
    
    if (showBackButton) {
      return (
        <TouchableOpacity 
          onPress={handleBackPress} 
          className="p-2 bg-gray-200 rounded-lg"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View className="mr-3">
            <Avatar
              imageUrl={avatarImage}
              text={avatarText}
              size={40}
              backgroundColor={avatarBg}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-lg">{title}</Text>
            {subtitle && (
              <Text className="text-bg-teal-700 text-sm">{subtitle}</Text>
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
        <TouchableOpacity 
          className="p-2" 
          onPress={onRightPress}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
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
        headerStyle: { backgroundColor: getResolvedColor(backgroundColor), borderBottomWidth: 1 , borderBottomColor: getTailwindColor('gray-200') },
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