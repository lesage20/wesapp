import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTailwindColor, type TailwindColorName } from '~/utils/colors';

interface AvatarProps {
  // Image props
  imageUrl?: string;
  
  // Text props
  text?: string;
  
  // Icon props
  iconName?: keyof typeof Ionicons.glyphMap;
  
  // Size props
  size?: number;
  
  // Style props
  backgroundColor?: TailwindColorName | string;
  textColor?: TailwindColorName | string;
  iconColor?: TailwindColorName | string;
  
  // Custom styles
  className?: string;
}

export default function Avatar({
  imageUrl,
  text,
  iconName,
  size = 40,
  backgroundColor = 'bg-teal-700',
  textColor = 'white',
  iconColor = 'white',
  className = '',
}: AvatarProps) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const getResolvedColor = (color: TailwindColorName | string): string => {
    // If it's already a hex color, return as is
    if (color.startsWith('#')) return color;
    // Otherwise, resolve from Tailwind colors
    return getTailwindColor(color as TailwindColorName);
  };

  const renderContent = () => {
    // Priority: Image > Text > Icon
    if (imageUrl) {
      return (
        <Image 
          source={{ uri: imageUrl }} 
          style={avatarStyle}
          resizeMode="cover"
        />
      );
    }
    
    if (text) {
      return (
        <View 
          className={`items-center justify-center ${className}`}
          style={[avatarStyle, { backgroundColor: getResolvedColor(backgroundColor) }]}
        >
          <Text 
            className="font-bold"
            style={{ 
              color: getResolvedColor(textColor),
              fontSize: size * 0.4, // 40% of avatar size
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
    
    if (iconName) {
      return (
        <View 
          className={`items-center justify-center ${className}`}
          style={[avatarStyle, { backgroundColor: getResolvedColor(backgroundColor) }]}
        >
          <Ionicons 
            name={iconName} 
            size={size * 0.5} // 50% of avatar size
            color={getResolvedColor(iconColor)} 
          />
        </View>
      );
    }
    
    // Default fallback
    return (
      <View 
        className={`items-center justify-center ${className}`}
        style={[avatarStyle, { backgroundColor: getTailwindColor('gray-400') }]}
      >
        <Ionicons 
          name="person" 
          size={size * 0.5} 
          color="white" 
        />
      </View>
    );
  };

  return renderContent();
}