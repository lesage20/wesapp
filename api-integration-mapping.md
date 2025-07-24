# API Integration Mapping - WeSapp

## Overview
Ce document cartographie toutes les pages de l'application WeSapp avec leurs endpoints API correspondants basés sur l'analyse de `api-doc.yaml`.

**Note importante** : L'URL de base de l'API n'est pas définie dans le fichier OpenAPI. Elle devra être configurée selon l'environnement.

---

## 📱 Pages d'Authentification

### 1. **Login Screen** (`app/(auth)/login.tsx`)
**Fonctionnalité** : Saisie du numéro de téléphone et envoi du code OTP

**Endpoints API requis** :
- `POST /api/auth/request-otp/` - Demande d'envoi du code OTP
  - Corps : `{ "phone_number": "+2250715583531" }`
  - Response : `200` (pas de body spécifié)

**État actuel** : ❌ Non implémenté (navigation mock vers verification)

---

### 2. **Verification Screen** (`app/(auth)/verification.tsx`)
**Fonctionnalité** : Vérification du code OTP à 6 chiffres

**Endpoints API requis** :
- `POST /api/auth/verify-otp/` - Vérification du code OTP
  - Corps : `{ "phone_number": "+2250715583531", "otp_code": "123456" }`
  - Response : `200` avec token d'authentification (probable)

**État actuel** : ❌ Non implémenté (navigation mock vers profile-setup)

---

### 3. **Profile Setup Screen** (`app/(auth)/profile-setup.tsx`)
**Fonctionnalité** : Configuration du profil utilisateur (nom, photo)

**Endpoints API requis** :
- `POST /api/users/create-profile/` - Création du profil utilisateur
- `POST /api/users/we-sapp-codes/` - Création du code WeSapp
  - Corps : Données utilisateur (nom, photo, etc.)

**État actuel** : ❌ Non implémenté (stockage local uniquement)

---

## 💬 Pages de Messagerie

### 1. **Conversations Screen** (`app/(drawer)/(tabs)/conversations.tsx`)
**Fonctionnalité** : Liste des conversations utilisateur

**Endpoints API requis** :
- `GET /api/conversations/` - Récupérer toutes les conversations
  - Query params : `limit`, `offset` pour pagination
  - Response : `PaginatedConversationList`
- `GET /api/conversations/check-existing/` - Vérifier conversations existantes
- `POST /api/conversations/` - Créer nouvelle conversation

**État actuel** : ❌ Non implémenté (données mock statiques)

---

### 2. **Chat Screen** (`app/chat/[id].tsx`)
**Fonctionnalité** : Interface de chat avec messages, médias, réactions

**Endpoints API requis** :
- `GET /api/messages/` - Récupérer messages d'une conversation
  - Query params : `conversation_id`, `limit`, `offset`
- `POST /api/messages/` - Envoyer nouveau message
  - Corps : `Message` avec type (`text`, `image`, `audio`, `pdf`)
- `PATCH /api/messages/{id}/` - Mettre à jour message (réactions, édition)
- `DELETE /api/messages/{id}/` - Supprimer message

**État actuel** : ❌ Non implémenté (données mock avec gestion locale)

---

## 👥 Pages de Contacts et Connexions

### 1. **Contacts Screen** (`app/(drawer)/(tabs)/contacts.tsx`)
**Fonctionnalité** : Gestion des contacts locaux et WeSapp

**Endpoints API requis** :
- `GET /api/connections/` - Récupérer connexions WeSapp
- `POST /api/connections/` - Créer nouvelle connexion
- `GET /api/connections/get-by-code/` - Récupérer connexion par code WeSapp
- `GET /api/users/we-sapp-codes/search-by-phone/` - Chercher utilisateur par téléphone

**État actuel** : ❌ Non implémenté (contacts locaux uniquement via Expo Contacts)

---

### 2. **My Connections Screen** (`app/my-connections.tsx`)
**Fonctionnalité** : Gestion des connexions WeSapp

**Endpoints API requis** :
- `GET /api/connections/` - Liste des connexions
- `PATCH /api/connections/{id}/` - Modifier connexion (nom, statut bloqué)
- `DELETE /api/connections/{id}/` - Supprimer connexion
- `PATCH /api/connections/update-by-code/` - Mettre à jour par code

**État actuel** : ❓ À vérifier (page non analysée en détail)

---

## 👤 Pages de Profil et Paramètres

### 1. **Profile Screen** (`app/profile.tsx`)
**Fonctionnalité** : Affichage et modification du profil utilisateur

**Endpoints API requis** :
- `GET /api/users/users/{id}/` - Récupérer profil utilisateur
- `PATCH /api/users/users/{id}/` - Mettre à jour profil
- `GET /api/users/we-sapp-codes/{id}/` - Récupérer code WeSapp
- `PATCH /api/users/we-sapp-codes/{id}/` - Mettre à jour code WeSapp

**État actuel** : ❌ Non implémenté (affichage des données du store local)

---

### 2. **Settings Screen** (`app/(drawer)/(tabs)/settings.tsx`)
**Fonctionnalité** : Paramètres de l'application

**Endpoints API requis** :
- `GET /api/users/settings/` - Récupérer paramètres utilisateur
- `POST /api/users/settings/` - Créer paramètres
- `PATCH /api/users/settings/{id}/` - Mettre à jour paramètres

**État actuel** : ❌ Non implémenté (navigation vers sous-pages)

---

## 🔐 Pages de Blocage et Sécurité

### 1. **Privacy and Security** (`app/privacy-and-security.tsx`)
**Fonctionnalité** : Gestion de la confidentialité

**Endpoints API requis** :
- `GET /api/blocked/` - Récupérer utilisateurs bloqués
- `POST /api/blocked/` - Bloquer un utilisateur
- `DELETE /api/blocked/{id}/` - Débloquer utilisateur
- `GET /api/blocked/is-blocked/` - Vérifier statut de blocage

**État actuel** : ❓ À vérifier

---

## 🎥 Pages de Groupes

### 1. **Groups Management** (Navigation depuis conversations)
**Fonctionnalité** : Création et gestion des groupes

**Endpoints API requis** :
- `GET /api/groups/` - Lister les groupes
- `POST /api/groups/` - Créer nouveau groupe
- `PATCH /api/groups/{id}/add-members/` - Ajouter membres
- `PATCH /api/groups/{id}/remove-member/` - Supprimer membre
- `POST /api/groups/{id}/leave-group/` - Quitter groupe
- `GET /api/groups/get-group-members/` - Récupérer membres

**État actuel** : ❌ Non implémenté

---

## 📞 Pages d'Appels

### 1. **Call Features** (Intégrées dans chat)
**Fonctionnalité** : Gestion des appels audio/vidéo

**Endpoints API requis** :
- `POST /api/start-call/` - Démarrer un appel
  - Corps : `{ "recipient_id": 456, "call_type": "video", "we_sapp_code": "123456" }`
- `POST /api/calls/token/` - Obtenir token d'appel
  - Corps : `{ "channel": "call_123_456", "recipient_id": 456, "call_type": "video" }`

**État actuel** : ❌ Non implémenté (boutons UI présents mais non fonctionnels)

---

## 🎯 Priorisation d'Implémentation

### **Phase 1 - MVP Critique** 🔴
1. **Authentification complète**
   - `/api/auth/request-otp/`
   - `/api/auth/verify-otp/`
   - `/api/users/create-profile/`

2. **Messagerie de base**
   - `/api/conversations/` (GET, POST)
   - `/api/messages/` (GET, POST)

3. **Profil utilisateur**
   - `/api/users/users/{id}/` (GET, PATCH)
   - `/api/users/we-sapp-codes/` (GET, PATCH)

### **Phase 2 - Fonctionnalités Sociales** 🟡
1. **Connexions et contacts**
   - `/api/connections/` (CRUD complet)
   - `/api/users/we-sapp-codes/search-by-phone/`

2. **Groupes**
   - `/api/groups/` (CRUD + gestion membres)

3. **Messagerie avancée**
   - Réactions, édition, suppression de messages

### **Phase 3 - Fonctionnalités Avancées** 🟢
1. **Sécurité et blocage**
   - `/api/blocked/` (CRUD complet)

2. **Appels**
   - `/api/start-call/`
   - `/api/calls/token/`

3. **Paramètres utilisateur**
   - `/api/users/settings/`

---

## 🛠 Recommandations Techniques

### 1. **Configuration API**
```typescript
// À ajouter dans les variables d'environnement
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.wesapp.com';
```

### 2. **Gestion de l'Authentification**
- Implémenter un intercepteur pour ajouter le header `Authorization: Token xxx`
- Gérer le refresh token automatique
- Redirection vers login si token expiré

### 3. **États de l'Application**
- Remplacer les données mock par des appels API réels
- Implémenter la gestion d'erreur et des états de chargement
- Ajouter la synchronisation offline/online

### 4. **Optimisations**
- Implémenter la pagination pour toutes les listes
- Ajouter le cache des données fréquemment utilisées
- Optimiser les requêtes avec des query parameters appropriés

---

**Date de création** : 2025-01-24  
**Status** : Documentation initiale - Prêt pour implémentation