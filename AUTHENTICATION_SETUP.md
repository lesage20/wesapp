# 🔐 Configuration de l'Authentification - WeSapp

## ✅ Intégration Terminée

L'authentification a été intégrée avec succès dans les pages suivantes :
- ✅ **Login** (`app/(auth)/login.tsx`) - Envoi d'OTP
- ✅ **Verification** (`app/(auth)/verification.tsx`) - Vérification OTP  
- ✅ **Profile Setup** (`app/(auth)/profile-setup.tsx`) - Création de profil

## 🛠 Configuration Requise

### 1. **URL de l'API Backend**
Modifiez l'URL dans `hooks/constants.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://votre-api-url.com', // ⚠️ À remplacer
  TIMEOUT: 30000,
  VERSION: 'v1',
} as const;
```

### 2. **Dépendances Installées**
- ✅ `@react-native-async-storage/async-storage` - Stockage des tokens
- ✅ `react-native-toast-message` - Notifications toast

## 🔄 Flow d'Authentification

### **Étape 1 : Login (OTP Request)**
```typescript
// Dans login.tsx
const { requestOTP, isLoading, error } = useAuth();

await requestOTP("+2250715583531");
// → POST /api/auth/request-otp/
```

### **Étape 2 : Verification (OTP Verify)**
```typescript
// Dans verification.tsx  
const { verifyOTP, isLoading, error } = useAuth();

await verifyOTP(phoneNumber, "123456");
// → POST /api/auth/verify-otp/
// → Stockage automatique des tokens JWT
```

### **Étape 3 : Profile Setup**
```typescript
// Dans profile-setup.tsx
const { createProfile, isLoading, error } = useAuth();

await createProfile({
  username: "MonUsername",
  profile_photo: "base64_or_url",
  bio: "",
  label: "Utilisateur"
});
// → POST /api/users/create-profile/
// → Mise à jour du store global Zustand
```

## 📱 États UX Intégrés

### **Loading States**
```jsx
{isLoading && (
  <View className="flex-row items-center justify-center">
    <ActivityIndicator size="small" color="white" />
    <Text className="ml-2">Loading...</Text>
  </View>
)}
```

### **Error Handling**
```jsx
{error && (
  <View className="bg-red-50 border border-red-200 rounded-lg p-3">
    <Text className="text-red-600 text-center">{error}</Text>
  </View>
)}
```

### **Toast Notifications**
- ✅ Messages de succès automatiques
- ✅ Messages d'erreur avec détails
- ✅ Position : top, durée : 3-4s

## 🧪 Test de l'Intégration

### **Prérequis Backend**
Votre API doit implémenter ces endpoints :

```http
POST /api/auth/request-otp/
Content-Type: application/json
{
  "phone_number": "+2250715583531"
}

POST /api/auth/verify-otp/  
{
  "phone_number": "+2250715583531",
  "otp_code": "123456"
}
→ Response: { "access": "jwt_token", "refresh": "refresh_token" }

POST /api/users/create-profile/
Authorization: Token jwt_token
{
  "username": "test",
  "profile_photo": "url",
  "bio": "",
  "label": "Utilisateur"
}
```

### **Test Manuel**
1. **Démarrer l'app** : `npm start`
2. **Naviguer vers Login**
3. **Saisir numéro** : +225XXXXXXXX
4. **Appuyer "Send code"** → Vérifier les logs/toasts
5. **Saisir OTP** : 123456
6. **Appuyer "Vérifier"** → Vérifier navigation
7. **Saisir username** → Finaliser profil

### **Débogage**
```typescript
// Voir les logs dans useAuth.ts
console.log('Request OTP:', phoneNumber);
console.log('Verify OTP:', otpCode);
console.log('Create Profile:', profileData);
```

## 🔧 Customisation

### **Messages d'Erreur**
Modifiez dans `hooks/constants.ts` :
```typescript
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Vérifiez votre connexion',
  TIMEOUT_ERROR: 'Timeout dépassé',
  // ...
} as const;
```

### **Configuration Toast**
```typescript
// Dans useApi.ts
Toast.show({
  type: 'success',
  text1: 'Succès',
  text2: message,
  position: 'top',
  visibilityTime: 3000,
});
```

## 🚀 Prochaines Étapes

1. **Configurer l'URL backend réelle**
2. **Tester avec l'API de production** 
3. **Intégrer d'autres hooks** (messages, contacts, etc.)
4. **Ajouter la validation côté client**
5. **Implémenter le refresh automatique des tokens**

## ⚠️ Points d'Attention

- **URL API** : Doit être configurée avant les tests
- **CORS** : S'assurer que l'API accepte les requêtes mobile
- **Tokens** : Vérifier le format attendu (Token vs Bearer)
- **Validation** : Formats de téléphone et codes OTP
- **Sécurité** : Ne jamais exposer les tokens dans les logs

---

**Status** : ✅ **Prêt pour les tests avec une API fonctionnelle**