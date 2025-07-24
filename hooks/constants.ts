/**
 * Constants pour l'API WeSapp
 * 
 * Ce fichier contient toutes les constantes utilisées dans l'application,
 * notamment l'URL de base de l'API et les configurations.
 */

// Configuration API
export const API_CONFIG = {
  // URL de base de l'API (à configurer selon l'environnement)
  // Pour le développement, remplacez par votre URL d'API locale
  BASE_URL: 'https://wesapp.waretrack.online/api/', // ⚠️ À remplacer par votre URL d'API
  
  // Timeout des requêtes en millisecondes
  TIMEOUT: 30000,
  
  // Version de l'API
  VERSION: 'v1',
} as const;

// En-têtes HTTP par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Configuration de l'authentification
export const AUTH_CONFIG = {
  // Préfixe du token d'authentification
  TOKEN_PREFIX: 'Token',
  
  // Clé pour stocker le token dans le stockage local (harmonisée avec l'API existante)
  TOKEN_STORAGE_KEY: 'authToken',
  
  // Clé pour stocker le refresh token
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  
  // Clé pour stocker les données utilisateur
  USER_STORAGE_KEY: 'userData',
  
  // Clé pour stocker l'utilisateur existant
  EXISTING_USER_KEY: 'existingUser',
  
  // Clé pour stocker l'ID utilisateur en attente
  PENDING_USER_ID_KEY: 'pendingUserId',
  
  // Clé pour stocker le dernier numéro de téléphone
  LAST_PHONE_NUMBER_KEY: 'lastPhoneNumber',
  
  // Clé pour stocker le numéro de téléphone sécurisé
  SECURE_PHONE_NUMBER_KEY: 'securePhoneNumber',
} as const;

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    REQUEST_OTP: 'auth/request-otp/',
    VERIFY_OTP: 'auth/verify-otp/',
    REFRESH_TOKEN: 'token/refresh/',
  },
  
  // Utilisateurs
  USERS: {
    CREATE_PROFILE: 'users/create-profile/',
    SAVE_TOKEN: 'users/save-token/',
    USERS: 'users/users/',
    SETTINGS: 'users/settings/',
    WE_SAPP_CODES: 'users/we-sapp-codes/',
    CHECK_PREMIUM: 'users/we-sapp-codes/check-premium/',
    CREATE_PREMIUM: 'users/we-sapp-codes/create-premium-profile/',
    GET_BY_CODE: 'users/we-sapp-codes/get-by-code/',
    GET_PREMIUM: 'users/we-sapp-codes/get-premium/',
    SEARCH_BY_PHONE: 'users/we-sapp-codes/search-by-phone/',
    UPDATE_NOTIFICATION: 'users/we-sapp-codes/update-notification/',
    // Nouveaux endpoints de l'API existante
    UPDATE_CODE: 'users/we-sapp-codes/',
    CHECK_PREMIUM_CODE: 'users/we-sapp-codes/check-premium/',
  },
  
  // Conversations
  CONVERSATIONS: {
    BASE: 'conversations/',
    CHECK_EXISTING: 'conversations/check-existing/',
    GET_ONE: 'conversations/get-one-conversation/',
    GET_OTHER_USER: 'conversations/get-other-conversations-user/',
    // Nouveaux endpoints de l'API existante
    GET_CONVERSATION_WITH_MESSAGES: 'conversations/get-one-conversation/',
    GET_CONVERSATION_BY_ID: 'conversations/',
  },
  
  // Messages
  MESSAGES: {
    BASE: 'messages/',
    // Nouveaux endpoints de l'API existante
    GET_MESSAGES_BY_CONVERSATION_ID: 'messages/',
    SET_REPLY_TO_MESSAGE: 'messages/set-reply-to-message/',
    SET_REACTION: 'messages/set-reaction/',
  },
  
  // Connexions
  CONNECTIONS: {
    BASE: 'connections/',
    GET_BY_CODE: 'connections/get-by-code/',
    UPDATE_BY_CODE: 'connections/update-by-code/',
    // Nouveaux endpoints de l'API existante
    CREATE_CONNECTION: 'connections/',
    DELETE_CONNECTION: 'connections/',
  },
  
  // Groupes
  GROUPS: {
    BASE: 'groups/',
    ADD_MEMBERS: (id: string) => `groups/${id}/add-members/`,
    LEAVE_GROUP: (id: string) => `groups/${id}/leave-group/`,
    REMOVE_MEMBER: (id: string) => `groups/${id}/remove-member/`,
    GET_MEMBERS: 'groups/get-group-members/',
    // Nouveaux endpoints de l'API existante
    CREATE_GROUP: 'groups/',
    UPDATE_GROUP: 'groups/',
    DELETE_GROUP: 'groups/',
    GET_GROUPS: 'groups/get-group-members/',
  },
  
  // Utilisateurs bloqués
  BLOCKED: {
    BASE: 'blocked/',
    BLOCKED_BY: (codeId: string) => `blocked/blocked-by/${codeId}/`,
    BLOCKED_USERS: (codeId: string) => `blocked/blocked-users/${codeId}/`,
    IS_BLOCKED: 'blocked/is-blocked/',
    UNBLOCK: 'blocked/unblock/',
    // Nouveaux endpoints de l'API existante
    BLOCK_USER: 'blocked/',
    GET_BLOCKED_CONTACTS: 'blocked/blocked-users/',
  },
  
  // Appels
  CALLS: {
    START_CALL: 'start-call/',
    TOKEN: 'calls/token/',
  },
  
  // API divers
  API: {
    TURN_CREDENTIALS: 'api/turn-credentials/',
  },
} as const;

// Endpoints qui ne nécessitent pas d'authentification
export const NO_AUTH_ENDPOINTS = [
  'auth/request-otp/',
  'auth/verify-otp/',
  'users/create-profile/',
  'auth/login/'
] as const;

// Configuration de pagination
export const PAGINATION_CONFIG = {
  // Nombre d'éléments par page par défaut
  DEFAULT_LIMIT: 20,
  
  // Limite maximale d'éléments par page
  MAX_LIMIT: 100,
  
  // Offset par défaut
  DEFAULT_OFFSET: 0,
} as const;

// Types de messages supportés
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  PDF: 'pdf',
  VIDEO: 'video',
  DOCUMENT: 'document',
  CONTACT: 'contact',
  LOCATION: 'location',
} as const;

// Configuration des toasts
export const TOAST_CONFIG = {
  // Durée d'affichage par défaut en millisecondes
  DEFAULT_DURATION: 3000,
  
  // Position par défaut
  DEFAULT_POSITION: 'bottom',
  
  // Types de toast
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
} as const;

// Configuration du cache
export const CACHE_CONFIG = {
  // Durée de vie du cache en millisecondes
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Taille maximale du cache
  MAX_SIZE: 100,
  
  // Clés de cache
  KEYS: {
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages',
    CONTACTS: 'contacts',
    USER_PROFILE: 'user_profile',
  },
} as const;

// Configuration des retry
export const RETRY_CONFIG = {
  // Nombre maximum de tentatives
  MAX_ATTEMPTS: 3,
  
  // Délai initial entre les tentatives en millisecondes
  INITIAL_DELAY: 1000,
  
  // Multiplicateur pour le délai (backoff exponentiel)
  DELAY_MULTIPLIER: 2,
} as const;

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connection internet.',
  TIMEOUT_ERROR: 'La requête a pris trop de temps. Veuillez réessayer.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès refusé.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
  VALIDATION_ERROR: 'Données invalides.',
} as const;

// Messages de succès par défaut
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message envoyé',
  PROFILE_UPDATED: 'Profil mis à jour',
  CONNECTION_ADDED: 'Contact ajouté',
  GROUP_CREATED: 'Groupe créé',
  USER_BLOCKED: 'Utilisateur bloqué',
  USER_UNBLOCKED: 'Utilisateur débloqué',
} as const;