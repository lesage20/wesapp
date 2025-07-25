import React from 'react';
import { View, Text, Image } from 'react-native';

interface SmartAvatarProps {
  user: {
    id?: string;
    name?: string;
    username?: string;
    profileImage?: string;
    avatar?: string;
  };
  size: number;
  className?: string;
  textClassName?: string;
  backgroundColor?: string;
}

const SmartAvatar: React.FC<SmartAvatarProps> = ({ 
  user, 
  size, 
  className = '', 
  textClassName = '',
  backgroundColor
}) => {
  // Déterminer le nom à afficher
  const displayName = user.username || user.name || '';
  const firstLetter = displayName.charAt(0).toUpperCase() || '?';
  
  // Déterminer l'image à afficher
  const imageUrl = user.profileImage || user.avatar;
  
  // Générer une couleur de fond basée sur l'ID utilisateur si pas fournie
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    if (user.id) {
      // Utiliser l'ID pour générer un index consistant
      const hash = user.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return colors[Math.abs(hash) % colors.length];
    }
    
    return 'bg-gray-500';
  };

  const bgColor = getBackgroundColor();
  const fontSize = size * 0.4;

  // Si l'utilisateur a une image, l'afficher
  if (imageUrl) {
    return (
      <View className={`rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image 
          source={{ uri: imageUrl }}
          className="w-full h-full"
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Sinon, afficher la première lettre du nom
  return (
    <View 
      className={`rounded-full items-center justify-center ${bgColor} ${className}`}
      style={{ width: size, height: size }}
    >
      <Text 
        className={`text-white font-semibold ${textClassName}`}
        style={{ fontSize }}
      >
        {firstLetter}
      </Text>
    </View>
  );
};

export default SmartAvatar;