# Exemples d'utilisation du CustomHeader

## 1. Header avec menu drawer (Pages de tabs)
```tsx
<CustomHeader 
  title="Settings"
  showMenuButton={true}
  showBackButton={false}
/>
```

## 2. Header simple avec bouton retour (Pages normales)
```tsx
<CustomHeader 
  title="Profile"
  showBackButton={true}
/>
```

## 3. Header avec bouton Edit à droite (Contact Profile)
```tsx
<CustomHeader 
  title=""
  rightText="Edit"
  onRightPress={() => console.log('Edit pressed')}
/>
```

## 4. Header de chat avec avatar et statut
```tsx
<CustomHeader 
  showAvatar={true}
  title={contact.shortName}
  subtitle="Online"
  avatarBg={contact.avatarBg}
  avatarText={contact.avatar}
  isSpecialAvatar={contact.isSpecialAvatar}
  onAvatarPress={() => router.push(`/contact-profile/${id}`)}
  rightContent={
    <View className="flex-row items-center">
      <TouchableOpacity className="p-2 mr-2">
        <VideoCallIcon width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2">
        <VoiceCallIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  }
/>
```

## 5. Header avec titre personnalisé (Privacy and Security)
```tsx
<CustomHeader 
  customTitle={
    <View className="items-center">
      <Text className="text-gray-900 font-semibold text-lg">Privacy and</Text>
      <Text className="text-gray-900 font-semibold text-lg">Security</Text>
    </View>
  }
/>
```

## 6. Header sans bouton retour
```tsx
<CustomHeader 
  title="Welcome"
  showBackButton={false}
/>
```

## 7. Header avec callback personnalisé pour le retour
```tsx
<CustomHeader 
  title="Custom Back"
  onBackPress={() => {
    // Logique personnalisée
    router.replace('/home');
  }}
/>
```