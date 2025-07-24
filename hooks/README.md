# 🎣 Hooks API - WeSapp

Ce dossier contient tous les hooks personnalisés pour interagir avec l'API WeSapp. Chaque hook gère un domaine fonctionnel spécifique avec gestion d'état, d'erreurs et de notifications toast intégrées.

## 📁 Structure

```
hooks/
├── index.ts                 # Point d'entrée pour tous les exports
├── constants.ts             # Configuration API et constantes
├── types.ts                 # Types TypeScript pour l'API
├── useApi.ts               # Hook générique pour les appels API
└── api/                    # Hooks spécialisés par fonctionnalité
    ├── useAuth.ts          # Authentification
    ├── useMessages.ts      # Messagerie et conversations
    ├── useContacts.ts      # Contacts et connexions
    ├── useProfile.ts       # Profil utilisateur
    ├── useGroups.ts        # Gestion des groupes
    └── useSettings.ts      # Paramètres utilisateur
```

## 🚀 Utilisation

### Import

```typescript
// Import individuel
import { useAuth, useMessages } from '~/hooks';

// Import groupé
import * as hooks from '~/hooks';
```

### Exemples d'utilisation

#### 🔐 Authentification

```typescript
import { useAuth } from '~/hooks';

function LoginScreen() {
  const { requestOTP, verifyOTP, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    await requestOTP('+2250715583531');
  };
  
  return (
    <View>
      {isLoading && <ActivityIndicator />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Send OTP" onPress={handleLogin} />
    </View>
  );
}
```

#### 💬 Messagerie

```typescript
import { useMessages } from '~/hooks';

function ConversationsScreen() {
  const { 
    conversations, 
    loadConversations, 
    sendMessage, 
    isLoading 
  } = useMessages({ autoLoad: true });
  
  const handleSendMessage = async (conversationId: string, content: string) => {
    await sendMessage({
      conversation: conversationId,
      content,
      message_type: 'text'
    });
  };
  
  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => <ConversationItem conversation={item} />}
      refreshing={isLoading}
      onRefresh={loadConversations}
    />
  );
}
```

#### 👥 Contacts

```typescript
import { useContacts } from '~/hooks';

function ContactsScreen() {
  const { 
    connections, 
    searchByPhone, 
    createConnection, 
    isLoading 
  } = useContacts({ autoLoad: true });
  
  const handleAddContact = async (phoneNumber: string) => {
    const users = await searchByPhone(phoneNumber);
    if (users.length > 0) {
      await createConnection({
        we_sapp_code: users[0].code,
        owner_we_sapp_code: 'my-code',
        connection_name: users[0].username
      });
    }
  };
  
  return (
    <View>
      {/* Liste des contacts */}
    </View>
  );
}
```

## 🎛 Configuration

### URL de l'API

Modifiez l'URL de base dans `hooks/constants.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com', // ⚠️ À modifier
  TIMEOUT: 30000,
  VERSION: 'v1',
} as const;
```

### Gestion des erreurs

Tous les hooks incluent une gestion d'erreur automatique avec toast. Pour personnaliser :

```typescript
const { data, error, isLoading } = useMessages({
  onError: (error) => {
    // Gestion personnalisée des erreurs
    console.error('Erreur messagerie:', error);
  },
  showToast: false // Désactiver les toasts automatiques
});
```

## 🎨 États des hooks

Chaque hook retourne un état standardisé :

```typescript
interface UseApiState<T> {
  data: T | null;        // Données récupérées
  isLoading: boolean;    // État de chargement
  error: string | null;  // Message d'erreur
  message: string | null; // Message de succès
}
```

## 🔄 Gestion du cache et pagination

### Pagination automatique

```typescript
const { 
  conversations, 
  loadMoreConversations, 
  hasMoreConversations,
  isLoadingMore 
} = useMessages();

// Dans un FlatList
<FlatList
  data={conversations}
  onEndReached={loadMoreConversations}
  onEndReachedThreshold={0.1}
  ListFooterComponent={
    isLoadingMore ? <ActivityIndicator /> : null
  }
/>
```

### Rafraîchissement

```typescript
const { refresh } = useMessages();

// Rafraîchir toutes les données
await refresh();
```

## 🛡 Authentification automatique

Les hooks gèrent automatiquement :
- ✅ Ajout du token d'authentification dans les headers
- ✅ Refresh automatique du token expiré
- ✅ Redirection vers login si non authentifié

## 🎯 Hooks disponibles

| Hook | Description | Endpoints principaux |
|------|-------------|---------------------|
| `useAuth` | Authentification complète | OTP, vérification, profil |
| `useMessages` | Messagerie et conversations | Messages, conversations, envoi |
| `useContacts` | Gestion des contacts | Connexions, recherche, blocage |
| `useProfile` | Profil utilisateur | Profil, codes WeSapp, premium |
| `useGroups` | Gestion des groupes | Groupes, membres, administration |
| `useSettings` | Paramètres app | Notifications, confidentialité, thème |

## 🚨 Gestion d'erreurs

### Types d'erreurs gérées

- ❌ **Erreurs réseau** : Pas de connexion internet
- ❌ **Erreurs de timeout** : Requête trop lente
- ❌ **Erreurs d'authentification** : Token expiré
- ❌ **Erreurs de validation** : Données invalides
- ❌ **Erreurs serveur** : Problèmes côté API

### Retry automatique

Les hooks incluent un système de retry avec backoff exponentiel pour les erreurs temporaires.

## 📱 Optimisations UX

### Optimistic updates

Certaines actions sont optimistes (ex: réactions, messages) pour une meilleure réactivité :

```typescript
// La réaction s'affiche immédiatement
await addReaction(messageId, '👍');
```

### Loading states granulaires

```typescript
const { 
  isLoading,        // Loading général
  isLoadingMore,    // Loading pagination
  sendMessage: { isLoading: isSending } // Loading spécifique
} = useMessages();
```

## 🔧 Développement

### Ajout d'un nouveau hook

1. Créer le fichier dans `hooks/api/`
2. Suivre la structure des hooks existants
3. Ajouter les types dans `types.ts`
4. Exporter dans `index.ts`

### Tests recommandés

- ✅ Test des états de loading
- ✅ Test de la gestion d'erreurs
- ✅ Test des appels API avec mock
- ✅ Test de la pagination

## 📚 Ressources

- [Documentation API complète](../api-integration-mapping.md)
- [Spécification OpenAPI](../api-doc.yaml)
- Structure basée sur les [React Query patterns](https://react-query.tanstack.com/)

---

**Note** : Assurez-vous de configurer l'URL de l'API avant utilisation en production !