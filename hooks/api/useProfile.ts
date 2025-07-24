/**
 * Hook pour la gestion du profil utilisateur
 * 
 * Gère le profil WeSapp, les codes WeSapp, les paramètres utilisateur
 * et les fonctionnalités premium.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '~/store/store';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  SUCCESS_MESSAGES,
  AUTH_CONFIG
} from '../constants';
import {
  UseProfileReturn,
  WeSappCode,
  User,
  UserSettings,
  PaginatedResponse
} from '../types';

interface UseProfileOptions {
  autoLoad?: boolean;
  loadSettings?: boolean;
}

interface UpdateProfilePayload {
  bio?: string;
  label?: string;
  profile_photo?: string;
  username?: string;
}

interface UpdateUserPayload {
  status?: string;
  language?: string;
  country_code?: string;
  device_tokens?: Record<string, any>;
}

interface CreatePremiumProfilePayload {
  features?: string[];
  subscription_type?: string;
}

export const useProfile = (options: UseProfileOptions = {}): UseProfileReturn => {
  const { autoLoad = false, loadSettings = false } = options;
  const { user, login } = useAuthStore();
  
  // États locaux
  const [profile, setProfile] = useState<WeSappCode | null>(user);
  const [userAccount, setUserAccount] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [weSappCodes, setWeSappCodes] = useState<WeSappCode[]>([]);
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  
  // Hooks API spécialisés
  const profileApi = useApi<WeSappCode>({ showToast: true });
  const updateProfileApi = useApi<WeSappCode>({ showToast: true });
  const userApi = useApi<User>({ showToast: false });
  const updateUserApi = useApi<User>({ showToast: true });
  const settingsApi = useApi<PaginatedResponse<UserSettings>>({ showToast: false });
  const updateSettingsApi = useApi<UserSettings>({ showToast: true });
  const createSettingsApi = useApi<UserSettings>({ showToast: true });
  const weSappCodesApi = useApi<PaginatedResponse<WeSappCode>>({ showToast: false });
  const createWeSappCodeApi = useApi<WeSappCode>({ showToast: true });
  const updateWeSappCodeApi = useApi<WeSappCode>({ showToast: true });
  const checkPremiumApi = useApi<any>({ showToast: false });
  const createPremiumApi = useApi<WeSappCode>({ showToast: true });
  const getPremiumApi = useApi<WeSappCode>({ showToast: false });
  const searchByPhoneApi = useApi<WeSappCode[]>({ showToast: false });
  const getByCodeApi = useApi<WeSappCode>({ showToast: false });
  const updateNotificationApi = useApi<WeSappCode>({ showToast: true });
  
  // État global de loading
  const isLoading = profileApi.isLoading || 
                   updateProfileApi.isLoading ||
                   userApi.isLoading ||
                   updateUserApi.isLoading ||
                   settingsApi.isLoading ||
                   updateSettingsApi.isLoading ||
                   createSettingsApi.isLoading ||
                   weSappCodesApi.isLoading ||
                   createWeSappCodeApi.isLoading ||
                   updateWeSappCodeApi.isLoading ||
                   checkPremiumApi.isLoading ||
                   createPremiumApi.isLoading ||
                   getPremiumApi.isLoading;
  
  // État global d'erreur
  const error = profileApi.error || 
               updateProfileApi.error ||
               userApi.error ||
               updateUserApi.error ||
               settingsApi.error ||
               updateSettingsApi.error ||
               createSettingsApi.error ||
               weSappCodesApi.error ||
               createWeSappCodeApi.error ||
               updateWeSappCodeApi.error ||
               checkPremiumApi.error ||
               createPremiumApi.error ||
               getPremiumApi.error;
  
  /**
   * Charger le profil utilisateur actuel
   */
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const url = `${API_ENDPOINTS.USERS.WE_SAPP_CODES}${user.id}/`;
    const result = await profileApi.get(url);
    
    if (result) {
      setProfile(result);
      // Mettre à jour aussi le store global
      login(result);
    }
  }, [profileApi, user?.id, login]);
  
  /**
   * Mettre à jour le profil WeSapp
   */
  const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<void> => {
    if (!profile?.id) {
      throw new Error('Profil non chargé');
    }
    
    // Validation des données
    if (payload.username && payload.username.length < 2) {
      throw new Error('Le nom d\'utilisateur doit contenir au moins 2 caractères');
    }
    
    if (payload.bio && payload.bio.length > 500) {
      throw new Error('La bio ne peut pas dépasser 500 caractères');
    }
    
    const url = `${API_ENDPOINTS.USERS.WE_SAPP_CODES}${profile.id}/`;
    const result = await updateProfileApi.patch(url, payload);
    
    if (result) {
      setProfile(result);
      // Mettre à jour aussi le store global
      login(result);
    }
  }, [updateProfileApi, profile?.id, login]);
  
  /**
   * Charger les informations du compte utilisateur
   */
  const loadUserAccount = useCallback(async (): Promise<void> => {
    if (!profile?.user?.id) {
      throw new Error('Informations utilisateur non disponibles');
    }
    
    const url = `${API_ENDPOINTS.USERS.USERS}${profile.user.id}/`;
    const result = await userApi.get(url);
    
    if (result) {
      setUserAccount(result);
    }
  }, [userApi, profile?.user?.id]);
  
  /**
   * Mettre à jour le compte utilisateur
   */
  const updateUserAccount = useCallback(async (payload: UpdateUserPayload): Promise<void> => {
    if (!userAccount?.id) {
      throw new Error('Compte utilisateur non chargé');
    }
    
    const url = `${API_ENDPOINTS.USERS.USERS}${userAccount.id}/`;
    const result = await updateUserApi.patch(url, payload);
    
    if (result) {
      setUserAccount(result);
    }
  }, [updateUserApi, userAccount?.id]);
  
  /**
   * Charger les paramètres utilisateur
   */
  const loadSettings = useCallback(async (): Promise<void> => {
    const result = await settingsApi.get(API_ENDPOINTS.USERS.SETTINGS);
    
    if (result && result.results.length > 0) {
      setSettings(result.results[0]); // Prendre le premier paramètre
    }
  }, [settingsApi]);
  
  /**
   * Mettre à jour les paramètres utilisateur
   */
  const updateSettings = useCallback(async (payload: Partial<UserSettings>): Promise<void> => {
    if (settings?.id) {
      // Mettre à jour les paramètres existants
      const url = `${API_ENDPOINTS.USERS.SETTINGS}${settings.id}/`;
      const result = await updateSettingsApi.patch(url, payload);
      
      if (result) {
        setSettings(result);
      }
    } else {
      // Créer de nouveaux paramètres
      const result = await createSettingsApi.post(API_ENDPOINTS.USERS.SETTINGS, payload);
      
      if (result) {
        setSettings(result);
      }
    }
  }, [updateSettingsApi, createSettingsApi, settings?.id]);
  
  /**
   * Charger tous les codes WeSapp de l'utilisateur
   */
  const loadWeSappCodes = useCallback(async (): Promise<void> => {
    const result = await weSappCodesApi.get(API_ENDPOINTS.USERS.WE_SAPP_CODES);
    
    if (result) {
      setWeSappCodes(result.results);
    }
  }, [weSappCodesApi]);
  
  /**
   * Créer un nouveau code WeSapp
   */
  const createWeSappCode = useCallback(async (payload: Partial<WeSappCode>): Promise<void> => {
    const result = await createWeSappCodeApi.post(API_ENDPOINTS.USERS.WE_SAPP_CODES, payload);
    
    if (result) {
      setWeSappCodes(prev => [result, ...prev]);
    }
  }, [createWeSappCodeApi]);
  
  /**
   * Mettre à jour un code WeSapp
   */
  const updateWeSappCode = useCallback(async (codeId: string, payload: Partial<WeSappCode>): Promise<void> => {
    if (!codeId) {
      throw new Error('ID du code WeSapp requis');
    }
    
    const url = `${API_ENDPOINTS.USERS.WE_SAPP_CODES}${codeId}/`;
    const result = await updateWeSappCodeApi.patch(url, payload);
    
    if (result) {
      setWeSappCodes(prev => prev.map(code => 
        code.id === codeId ? result : code
      ));
      
      // Si c'est le profil actuel, le mettre à jour aussi
      if (profile?.id === codeId) {
        setProfile(result);
        login(result);
      }
    }
  }, [updateWeSappCodeApi, profile?.id, login]);
  
  /**
   * Vérifier le statut premium
   */
  const checkPremiumStatus = useCallback(async (): Promise<void> => {
    const result = await checkPremiumApi.get(API_ENDPOINTS.USERS.CHECK_PREMIUM);
    
    if (result) {
      setPremiumStatus(result);
    }
  }, [checkPremiumApi]);
  
  /**
   * Créer un profil premium
   */
  const createPremiumProfile = useCallback(async (payload: CreatePremiumProfilePayload): Promise<void> => {
    const result = await createPremiumApi.post(API_ENDPOINTS.USERS.CREATE_PREMIUM, payload);
    
    if (result) {
      setProfile(result);
      login(result);
      setPremiumStatus(result);
    }
  }, [createPremiumApi, login]);
  
  /**
   * Récupérer les informations premium
   */
  const loadPremiumInfo = useCallback(async (): Promise<void> => {
    const result = await getPremiumApi.get(API_ENDPOINTS.USERS.GET_PREMIUM);
    
    if (result) {
      setPremiumStatus(result);
    }
  }, [getPremiumApi]);
  
  /**
   * Rechercher un utilisateur par téléphone
   */
  const searchUserByPhone = useCallback(async (phoneNumber: string): Promise<WeSappCode[]> => {
    if (!phoneNumber?.trim()) {
      throw new Error('Numéro de téléphone requis');
    }
    
    const queryParams = new URLSearchParams({
      phone: phoneNumber,
    });
    
    const url = `${API_ENDPOINTS.USERS.SEARCH_BY_PHONE}?${queryParams}`;
    const result = await searchByPhoneApi.get(url);
    
    return result || [];
  }, [searchByPhoneApi]);
  
  /**
   * Récupérer un utilisateur par code WeSapp
   */
  const getUserByCode = useCallback(async (code: string): Promise<WeSappCode | null> => {
    if (!code?.trim()) {
      throw new Error('Code WeSapp requis');
    }
    
    const queryParams = new URLSearchParams({
      code: code,
    });
    
    const url = `${API_ENDPOINTS.USERS.GET_BY_CODE}?${queryParams}`;
    return await getByCodeApi.get(url);
  }, [getByCodeApi]);
  
  /**
   * Mettre à jour les paramètres de notification
   */
  const updateNotificationSettings = useCallback(async (enabled: boolean): Promise<void> => {
    const queryParams = new URLSearchParams({
      enabled: enabled.toString(),
    });
    
    const url = `${API_ENDPOINTS.USERS.UPDATE_NOTIFICATION}?${queryParams}`;
    const result = await updateNotificationApi.get(url);
    
    if (result && profile) {
      setProfile(result);
      login(result);
    }
  }, [updateNotificationApi, profile, login]);
  
  /**
   * Fonctions utilitaires
   */
  const isProfileComplete = useCallback((): boolean => {
    return !!(profile?.username && profile?.bio && profile?.label);
  }, [profile]);
  
  const isPremiumUser = useCallback((): boolean => {
    return profile?.is_premium === true;
  }, [profile]);
  
  const getActiveWeSappCode = useCallback((): WeSappCode | null => {
    return weSappCodes.find(code => code.is_active && code.is_default) || null;
  }, [weSappCodes]);
  
  const getUnreadMessagesCount = useCallback((): number => {
    return profile?.unread_messages || 0;
  }, [profile]);
  
  /**
   * Fonctions de mise à jour rapide
   */
  const updateBio = useCallback(async (bio: string): Promise<void> => {
    return updateProfile({ bio });
  }, [updateProfile]);
  
  const updateLabel = useCallback(async (label: string): Promise<void> => {
    return updateProfile({ label });
  }, [updateProfile]);
  
  const updateUsername = useCallback(async (username: string): Promise<void> => {
    return updateProfile({ username });
  }, [updateProfile]);
  
  const updateProfilePhoto = useCallback(async (profilePhoto: string): Promise<void> => {
    return updateProfile({ profile_photo: profilePhoto });
  }, [updateProfile]);
  
  const updateLanguage = useCallback(async (language: string): Promise<void> => {
    return updateUserAccount({ language });
  }, [updateUserAccount]);
  
  const updateStatus = useCallback(async (status: string): Promise<void> => {
    return updateUserAccount({ status });
  }, [updateUserAccount]);
  
  /**
   * Rafraîchir toutes les données
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadProfile(),
      loadSettings && settings ? loadSettings() : Promise.resolve(),
      loadWeSappCodes(),
      checkPremiumStatus(),
    ]);
  }, [loadProfile, loadSettings, loadWeSappCodes, checkPremiumStatus, settings]);
  
  // Auto-load au montage si demandé
  useEffect(() => {
    if (autoLoad) {
      loadProfile();
      if (loadSettings) {
        loadSettings();
      }
    }
  }, [autoLoad, loadSettings, loadProfile]);
  
  // Synchroniser le profil avec le store global
  useEffect(() => {
    if (user && !profile) {
      setProfile(user);
    }
  }, [user, profile]);
  
  return {
    // États
    profile,
    userAccount,
    settings,
    weSappCodes,
    premiumStatus,
    isLoading,
    error,
    
    // Actions principales
    loadProfile,
    updateProfile,
    loadUserAccount,
    updateUserAccount,
    loadSettings,
    updateSettings,
    
    // Gestion des codes WeSapp
    loadWeSappCodes,
    createWeSappCode,
    updateWeSappCode,
    
    // Fonctionnalités premium
    checkPremiumStatus,
    createPremiumProfile,
    loadPremiumInfo,
    
    // Recherche et récupération
    searchUserByPhone,
    getUserByCode,
    
    // Paramètres spécialisés
    updateNotificationSettings,
    
    // Fonctions utilitaires
    isProfileComplete,
    isPremiumUser,
    getActiveWeSappCode,
    getUnreadMessagesCount,
    
    // Mises à jour rapides
    updateBio,
    updateLabel,
    updateUsername,
    updateProfilePhoto,
    updateLanguage,
    updateStatus,
    
    // Actions générales
    refresh,
  };
};

export default useProfile;