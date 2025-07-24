/**
 * Index des hooks API
 * 
 * Fichier central pour exporter tous les hooks et types de l'API.
 * Facilite les imports dans les composants.
 */

// Hook générique
export { useApi } from './useApi';

// Hooks spécialisés
export { useAuth } from './api/useAuth';
export { useMessages } from './api/useMessages';
export { useContacts } from './api/useContacts';
export { useProfile } from './api/useProfile';
export { useGroups } from './api/useGroups';
export { useSettings } from './api/useSettings';

// Constants et types
export * from './constants';
export * from './types';

// Exports par défaut pour une utilisation plus simple
export { default as useAuth } from './api/useAuth';
export { default as useMessages } from './api/useMessages';
export { default as useContacts } from './api/useContacts';
export { default as useProfile } from './api/useProfile';
export { default as useGroups } from './api/useGroups';
export { default as useSettings } from './api/useSettings';