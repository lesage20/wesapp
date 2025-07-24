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
  BASE_URL: 'https://wesapp.waretrack.online/', // ⚠️ À remplacer par votre URL d'API
  
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
  
  // Clé pour stocker le token dans le stockage local
  TOKEN_STORAGE_KEY: '@wesapp_auth_token',
  
  // Clé pour stocker le refresh token
  REFRESH_TOKEN_STORAGE_KEY: '@wesapp_refresh_token',
  
  // Clé pour stocker les données utilisateur
  USER_STORAGE_KEY: '@wesapp_user_data',
} as const;

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    REQUEST_OTP: '/api/auth/request-otp/',
    VERIFY_OTP: '/api/auth/verify-otp/',
    REFRESH_TOKEN: '/api/token/refresh/',
  },
  
  // Utilisateurs
  USERS: {
    CREATE_PROFILE: '/api/users/create-profile/',
    SAVE_TOKEN: '/api/users/save-token/',
    USERS: '/api/users/users/',
    SETTINGS: '/api/users/settings/',
    WE_SAPP_CODES: '/api/users/we-sapp-codes/',
    CHECK_PREMIUM: '/api/users/we-sapp-codes/check-premium/',
    CREATE_PREMIUM: '/api/users/we-sapp-codes/create-premium-profile/',
    GET_BY_CODE: '/api/users/we-sapp-codes/get-by-code/',
    GET_PREMIUM: '/api/users/we-sapp-codes/get-premium/',
    SEARCH_BY_PHONE: '/api/users/we-sapp-codes/search-by-phone/',
    UPDATE_NOTIFICATION: '/api/users/we-sapp-codes/update-notification/',
  },
  
  // Conversations
  CONVERSATIONS: {
    BASE: '/api/conversations/',
    CHECK_EXISTING: '/api/conversations/check-existing/',
    GET_ONE: '/api/conversations/get-one-conversation/',
    GET_OTHER_USER: '/api/conversations/get-other-conversations-user/',
  },
  
  // Messages
  MESSAGES: {
    BASE: '/api/messages/',
  },
  
  // Connexions
  CONNECTIONS: {
    BASE: '/api/connections/',
    GET_BY_CODE: '/api/connections/get-by-code/',
    UPDATE_BY_CODE: '/api/connections/update-by-code/',
  },
  
  // Groupes
  GROUPS: {
    BASE: '/api/groups/',
    ADD_MEMBERS: (id: string) => `/api/groups/${id}/add-members/`,
    LEAVE_GROUP: (id: string) => `/api/groups/${id}/leave-group/`,
    REMOVE_MEMBER: (id: string) => `/api/groups/${id}/remove-member/`,
    GET_MEMBERS: '/api/groups/get-group-members/',
  },
  
  // Utilisateurs bloqués
  BLOCKED: {
    BASE: '/api/blocked/',
    BLOCKED_BY: (codeId: string) => `/api/blocked/blocked-by/${codeId}/`,
    BLOCKED_USERS: (codeId: string) => `/api/blocked/blocked-users/${codeId}/`,
    IS_BLOCKED: '/api/blocked/is-blocked/',
    UNBLOCK: '/api/blocked/unblock/',
  },
  
  // Appels
  CALLS: {
    START_CALL: '/api/start-call/',
    TOKEN: '/api/calls/token/',
  },
  
  // API divers
  API: {
    TURN_CREDENTIALS: '/api/api/turn-credentials/',
  },
} as const;

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