/**
 * Hook pour les paramètres utilisateur
 * 
 * Gère les paramètres de l'application, les préférences utilisateur,
 * les notifications, la confidentialité et la personnalisation.
 */

import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  SUCCESS_MESSAGES,
} from '../constants';
import {
  UserSettings,
  PaginatedResponse
} from '../types';

interface UseSettingsOptions {
  autoLoad?: boolean;
}

interface NotificationSettings {
  message_notifications?: boolean;
  group_notifications?: boolean;
  call_notifications?: boolean;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  notification_tone?: string;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface PrivacySettings {
  profile_visibility?: 'everyone' | 'contacts' | 'nobody';
  last_seen_visibility?: 'everyone' | 'contacts' | 'nobody';
  status_visibility?: 'everyone' | 'contacts' | 'nobody';
  read_receipts_enabled?: boolean;
  typing_indicators_enabled?: boolean;
  online_status_enabled?: boolean;
  allow_unknown_contacts?: boolean;
  block_screenshots?: boolean;
}

interface AppearanceSettings {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  font_size?: 'small' | 'medium' | 'large';
  chat_background?: string;
  bubble_style?: 'modern' | 'classic';
  accent_color?: string;
}

interface SecuritySettings {
  two_factor_enabled?: boolean;
  fingerprint_lock?: boolean;
  auto_lock_enabled?: boolean;
  auto_lock_timeout?: number; // en minutes
  backup_enabled?: boolean;
  backup_frequency?: 'daily' | 'weekly' | 'monthly';
}

interface UseSettingsReturn {
  // États
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions principales
  loadSettings: () => Promise<void>;
  updateSettings: (payload: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // Paramètres spécialisés
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  updateAppearanceSettings: (settings: AppearanceSettings) => Promise<void>;
  updateSecuritySettings: (settings: SecuritySettings) => Promise<void>;
  
  // Fonctions utilitaires
  getNotificationSettings: () => NotificationSettings;
  getPrivacySettings: () => PrivacySettings;
  getAppearanceSettings: () => AppearanceSettings;
  getSecuritySettings: () => SecuritySettings;
  
  // Mises à jour rapides
  updateTheme: (theme: string) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleReadReceipts: (enabled: boolean) => Promise<void>;
  
  // Actions générales
  refresh: () => Promise<void>;
}

export const useSettings = (options: UseSettingsOptions = {}): UseSettingsReturn => {
  const { autoLoad = false } = options;
  
  // États locaux
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Hooks API spécialisés
  const settingsApi = useApi<PaginatedResponse<UserSettings>>({ showToast: false });
  const updateSettingsApi = useApi<UserSettings>({ showToast: true });
  const createSettingsApi = useApi<UserSettings>({ showToast: true });
  const getSettingsApi = useApi<UserSettings>({ showToast: false });
  
  // État global de loading
  const isLoading = settingsApi.isLoading || 
                   updateSettingsApi.isLoading ||
                   createSettingsApi.isLoading ||
                   getSettingsApi.isLoading;
  
  // État global d'erreur
  const error = settingsApi.error || 
               updateSettingsApi.error ||
               createSettingsApi.error ||
               getSettingsApi.error;
  
  /**
   * Charger les paramètres utilisateur
   */
  const loadSettings = useCallback(async (): Promise<void> => {
    const result = await settingsApi.get(API_ENDPOINTS.USERS.SETTINGS);
    
    if (result && result.results.length > 0) {
      setSettings(result.results[0]); // Prendre le premier paramètre
    } else {
      // Aucun paramètre trouvé, créer des paramètres par défaut
      await createDefaultSettings();
    }
  }, [settingsApi]);
  
  /**
   * Créer des paramètres par défaut
   */
  const createDefaultSettings = useCallback(async (): Promise<void> => {
    const defaultSettings = {
      theme: 'light',
      language: 'fr',
      notifications: {
        message_notifications: true,
        group_notifications: true,
        call_notifications: true,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours_enabled: false,
      },
      privacy: {
        profile_visibility: 'contacts',
        last_seen_visibility: 'contacts',
        status_visibility: 'contacts',
        read_receipts_enabled: true,
        typing_indicators_enabled: true,
        online_status_enabled: true,
        allow_unknown_contacts: false,
      },
    };
    
    const result = await createSettingsApi.post(API_ENDPOINTS.USERS.SETTINGS, defaultSettings);
    
    if (result) {
      setSettings(result);
    }
  }, [createSettingsApi]);
  
  /**
   * Mettre à jour les paramètres
   */
  const updateSettings = useCallback(async (payload: Partial<UserSettings>): Promise<void> => {
    if (!settings?.id) {
      // Créer de nouveaux paramètres si ils n'existent pas
      const result = await createSettingsApi.post(API_ENDPOINTS.USERS.SETTINGS, payload);
      
      if (result) {
        setSettings(result);
      }
    } else {
      // Mettre à jour les paramètres existants
      const url = `${API_ENDPOINTS.USERS.SETTINGS}${settings.id}/`;
      const result = await updateSettingsApi.patch(url, payload);
      
      if (result) {
        setSettings(result);
      }
    }
  }, [createSettingsApi, updateSettingsApi, settings?.id]);
  
  /**
   * Réinitialiser les paramètres aux valeurs par défaut
   */
  const resetSettings = useCallback(async (): Promise<void> => {
    if (!settings?.id) {
      return;
    }
    
    const defaultSettings = {
      theme: 'light',
      language: 'fr',
      notifications: {
        message_notifications: true,
        group_notifications: true,
        call_notifications: true,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours_enabled: false,
      },
      privacy: {
        profile_visibility: 'contacts',
        last_seen_visibility: 'contacts',
        status_visibility: 'contacts',
        read_receipts_enabled: true,
        typing_indicators_enabled: true,
        online_status_enabled: true,
        allow_unknown_contacts: false,
      },
    };
    
    await updateSettings(defaultSettings);
  }, [updateSettings, settings?.id]);
  
  /**
   * Mettre à jour les paramètres de notification
   */
  const updateNotificationSettings = useCallback(async (notificationSettings: NotificationSettings): Promise<void> => {
    const currentNotifications = settings?.notifications || {};
    const updatedNotifications = {
      ...currentNotifications,
      ...notificationSettings,
    };
    
    await updateSettings({
      notifications: updatedNotifications,
    });
  }, [updateSettings, settings?.notifications]);
  
  /**
   * Mettre à jour les paramètres de confidentialité
   */
  const updatePrivacySettings = useCallback(async (privacySettings: PrivacySettings): Promise<void> => {
    const currentPrivacy = settings?.privacy || {};
    const updatedPrivacy = {
      ...currentPrivacy,
      ...privacySettings,
    };
    
    await updateSettings({
      privacy: updatedPrivacy,
    });
  }, [updateSettings, settings?.privacy]);
  
  /**
   * Mettre à jour les paramètres d'apparence
   */
  const updateAppearanceSettings = useCallback(async (appearanceSettings: AppearanceSettings): Promise<void> => {
    const updates: Partial<UserSettings> = {};
    
    if (appearanceSettings.theme) {
      updates.theme = appearanceSettings.theme;
    }
    
    if (appearanceSettings.language) {
      updates.language = appearanceSettings.language;
    }
    
    // Les autres paramètres d'apparence peuvent être stockés dans un objet séparé
    const currentAppearance = (settings as any)?.appearance || {};
    const updatedAppearance = {
      ...currentAppearance,
      ...appearanceSettings,
    };
    
    (updates as any).appearance = updatedAppearance;
    
    await updateSettings(updates);
  }, [updateSettings, settings]);
  
  /**
   * Mettre à jour les paramètres de sécurité
   */
  const updateSecuritySettings = useCallback(async (securitySettings: SecuritySettings): Promise<void> => {
    const currentSecurity = (settings as any)?.security || {};
    const updatedSecurity = {
      ...currentSecurity,
      ...securitySettings,
    };
    
    await updateSettings({
      ...(settings as any),
      security: updatedSecurity,
    });
  }, [updateSettings, settings]);
  
  /**
   * Récupérer les paramètres de notification
   */
  const getNotificationSettings = useCallback((): NotificationSettings => {
    return settings?.notifications || {};
  }, [settings?.notifications]);
  
  /**
   * Récupérer les paramètres de confidentialité
   */
  const getPrivacySettings = useCallback((): PrivacySettings => {
    return settings?.privacy || {};
  }, [settings?.privacy]);
  
  /**
   * Récupérer les paramètres d'apparence
   */
  const getAppearanceSettings = useCallback((): AppearanceSettings => {
    return {
      theme: settings?.theme as any,
      language: settings?.language,
      ...(settings as any)?.appearance,
    };
  }, [settings]);
  
  /**
   * Récupérer les paramètres de sécurité
   */
  const getSecuritySettings = useCallback((): SecuritySettings => {
    return (settings as any)?.security || {};
  }, [settings]);
  
  /**
   * Mettre à jour le thème
   */
  const updateTheme = useCallback(async (theme: string): Promise<void> => {
    await updateSettings({ theme });
  }, [updateSettings]);
  
  /**
   * Mettre à jour la langue
   */
  const updateLanguage = useCallback(async (language: string): Promise<void> => {
    await updateSettings({ language });
  }, [updateSettings]);
  
  /**
   * Activer/désactiver les notifications
   */
  const toggleNotifications = useCallback(async (enabled: boolean): Promise<void> => {
    await updateNotificationSettings({
      message_notifications: enabled,
      group_notifications: enabled,
      call_notifications: enabled,
    });
  }, [updateNotificationSettings]);
  
  /**
   * Activer/désactiver les accusés de lecture
   */
  const toggleReadReceipts = useCallback(async (enabled: boolean): Promise<void> => {
    await updatePrivacySettings({
      read_receipts_enabled: enabled,
    });
  }, [updatePrivacySettings]);
  
  /**
   * Fonctions utilitaires pour les vérifications
   */
  const isNotificationsEnabled = useCallback((): boolean => {
    const notifications = getNotificationSettings();
    return notifications.message_notifications === true;
  }, [getNotificationSettings]);
  
  const isReadReceiptsEnabled = useCallback((): boolean => {
    const privacy = getPrivacySettings();
    return privacy.read_receipts_enabled === true;
  }, [getPrivacySettings]);
  
  const isDarkTheme = useCallback((): boolean => {
    return settings?.theme === 'dark';
  }, [settings?.theme]);
  
  const getLanguage = useCallback((): string => {
    return settings?.language || 'fr';
  }, [settings?.language]);
  
  /**
   * Rafraîchir les paramètres
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadSettings();
  }, [loadSettings]);
  
  // Auto-load au montage si demandé
  useEffect(() => {
    if (autoLoad) {
      loadSettings();
    }
  }, [autoLoad, loadSettings]);
  
  return {
    // États
    settings,
    isLoading,
    error,
    
    // Actions principales
    loadSettings,
    updateSettings,
    resetSettings,
    
    // Paramètres spécialisés
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppearanceSettings,
    updateSecuritySettings,
    
    // Fonctions utilitaires
    getNotificationSettings,
    getPrivacySettings,
    getAppearanceSettings,
    getSecuritySettings,
    
    // Mises à jour rapides
    updateTheme,
    updateLanguage,
    toggleNotifications,
    toggleReadReceipts,
    
    // Vérifications utiles
    isNotificationsEnabled,
    isReadReceiptsEnabled,
    isDarkTheme,
    getLanguage,
    
    // Actions générales
    refresh,
  };
};

export default useSettings;