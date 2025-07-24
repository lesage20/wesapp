/**
 * Hook pour l'authentification
 * 
 * Gère l'authentification complète : OTP, vérification, création de profil,
 * gestion des tokens et déconnexion.
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '~/store/store';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  AUTH_CONFIG,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES 
} from '../constants';
import {
  UseAuthReturn,
  RequestOTPPayload,
  VerifyOTPPayload,
  TokenResponse,
  CreateProfilePayload,
  WeSappCode,
  User
} from '../types';

// Fonction pour formater le numéro de téléphone (inspirée de l'API existante)
const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les espaces et caractères non numériques sauf le +
  let formatted = phone.replace(/[^0-9+]/g, '');
  
  // Si le numéro ne commence pas par +, ajouter le code pays pour la Côte d'Ivoire
  if (!formatted.startsWith('+')) {
    // Si le numéro commence par 0, conserver le 0 après le code pays
    if (formatted.startsWith('0')) {
      formatted = '+225' + formatted; // Garder le 0 initial
    } else {
      // Si le numéro ne commence pas par 0, ajouter un 0 après le code pays
      formatted = '+2250' + formatted;
    }
  }
  
  return formatted;
};

export const useAuth = (): UseAuthReturn => {
  const { user, login, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks API spécialisés pour chaque endpoint
  const otpApi = useApi<any>({ showToast: true });
  const verifyApi = useApi<TokenResponse>({ showToast: true });
  const profileApi = useApi<WeSappCode>({ showToast: true });
  const refreshApi = useApi<TokenResponse>({ showToast: false });
  
  // État d'authentification dérivé
  const isAuthenticated = !!user;
  
  // Fonction utilitaire pour gérer les erreurs
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);
  
  // Fonction utilitaire pour sauvegarder les tokens (harmonisée avec l'API existante)
  const saveTokens = useCallback(async (response: any) => {
    try {
      // Sauvegarder le token d'authentification principal
      if (response.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, response.token);
        console.log('Token d\'authentification sauvegardé');
      }
      
      // Sauvegarder les données utilisateur si disponibles
      if (response.user_data) {
        await AsyncStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(response.user_data));
      }
      
      // Sauvegarder l'ID utilisateur en attente si disponible
      if (response.pending_user_id) {
        await AsyncStorage.setItem(AUTH_CONFIG.PENDING_USER_ID_KEY, response.pending_user_id);
      }
      
      // Sauvegarder le statut utilisateur existant
      if (response.existing_user !== undefined) {
        await AsyncStorage.setItem(AUTH_CONFIG.EXISTING_USER_KEY, response.existing_user.toString());
      }
      
      // Support pour les tokens JWT standards
      if (response.access) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, response.access);
      }
      if (response.refresh) {
        await AsyncStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, response.refresh);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tokens:', error);
      throw new Error('Impossible de sauvegarder les tokens d\'authentification');
    }
  }, []);
  
  // Fonction utilitaire pour sauvegarder les données utilisateur
  const saveUserData = useCallback(async (userData: WeSappCode) => {
    try {
      await AsyncStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
      throw new Error('Impossible de sauvegarder les données utilisateur');
    }
  }, []);
  
  // Fonction utilitaire pour nettoyer le stockage (harmonisée avec l'API existante)
  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        AUTH_CONFIG.TOKEN_STORAGE_KEY,
        AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
        AUTH_CONFIG.USER_STORAGE_KEY,
        AUTH_CONFIG.EXISTING_USER_KEY,
        AUTH_CONFIG.PENDING_USER_ID_KEY,
        AUTH_CONFIG.LAST_PHONE_NUMBER_KEY,
        'token' // Support pour l'ancienne clé
      ]);
    } catch (error) {
      console.warn('Erreur lors du nettoyage du stockage:', error);
    }
  }, []);
  
  /**
   * Demander l'envoi d'un code OTP (harmonisée avec l'API existante)
   */
  const requestOTP = useCallback(async (phoneNumber: string, countryCode: string = '+225'): Promise<void> => {
    if (!phoneNumber.trim()) {
      handleError('Le numéro de téléphone est requis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Formater le numéro de téléphone selon l'API existante
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('Requesting OTP for phone:', formattedPhone);
      
      // Sauvegarder le dernier numéro de téléphone utilisé
      await AsyncStorage.setItem(AUTH_CONFIG.LAST_PHONE_NUMBER_KEY, phoneNumber);
      await AsyncStorage.setItem(AUTH_CONFIG.SECURE_PHONE_NUMBER_KEY, phoneNumber);
      
      const payload: RequestOTPPayload = {
        phone_number: formattedPhone,
        country_code: countryCode,
      };
      
      const result = await otpApi.post(API_ENDPOINTS.AUTH.REQUEST_OTP, payload);
      
      if (result) {
        console.log('OTP request successful');
        setIsLoading(false);
        // Le toast de succès est géré automatiquement par useApi
      }
    } catch (error: any) {
      console.error('Error requesting OTP:', error);
      handleError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [otpApi, handleError]);
  
  /**
   * Vérifier le code OTP et obtenir les tokens (harmonisée avec l'API existante)
   */
  const verifyOTP = useCallback(async (phoneNumber: string, otpCode: string): Promise<void> => {
    if (!phoneNumber.trim() || !otpCode.trim()) {
      handleError('Le numéro de téléphone et le code OTP sont requis');
      return;
    }
    
    if (otpCode.length !== 6) {
      handleError('Le code OTP doit contenir 6 chiffres');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Formater le numéro de téléphone de la même manière que pour la demande
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('Verifying OTP for phone:', formattedPhone, 'with code:', otpCode);
      
      const payload: VerifyOTPPayload = {
        phone_number: formattedPhone,
        otp: otpCode,
      };
      
      const response = await verifyApi.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
      
      if (response) {
        console.log('OTP verification response:', response);
        await saveTokens(response);
        setIsLoading(false);
        // Navigation vers profile-setup sera gérée par le composant appelant
      }
    } catch (error: any) {
      handleError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [verifyApi, saveTokens, handleError]);
  
  /**
   * Créer le profil utilisateur (harmonisée avec l'API existante)
   */
  const createProfile = useCallback(async (profileData: CreateProfilePayload): Promise<void> => {
    if (!profileData.username?.trim()) {
      handleError('Le nom d\'utilisateur est requis');
      return;
    }
    
    if (profileData.username.length < 2) {
      handleError('Le nom d\'utilisateur doit contenir au moins 2 caractères');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer l'ID utilisateur en attente du stockage local
      const pendingUserId = await AsyncStorage.getItem(AUTH_CONFIG.PENDING_USER_ID_KEY);
      if (!pendingUserId) {
        throw new Error('No pending user ID found. Please verify OTP first.');
      }
      
      // Créer l'objet de données utilisateur selon l'API existante
      const userData: Record<string, any> = {
        pending_user_id: pendingUserId,
        username: profileData.username,
        password: 'password', // Mot de passe par défaut
      };
      
      // Ajouter la photo de profil si elle existe
      if (profileData.profile_photo) {
        if (profileData.profile_photo.startsWith('data:image')) {
          // Image en base64 avec en-tête data URL
          userData['profile_photo'] = profileData.profile_photo;
        } else if (profileData.profile_photo.length <= 2) {
          // Probablement un emoji
          console.log('Emoji détecté:', profileData.profile_photo);
          userData['profile_photo'] = 'default_avatar';
          userData['avatar_emoji'] = profileData.profile_photo;
        } else {
          // Autre format texte
          userData['profile_photo'] = profileData.profile_photo;
        }
      }
      
      // Ajouter les autres champs
      if (profileData.bio !== undefined) {
        userData['bio'] = profileData.bio;
      }
      if (profileData.label !== undefined) {
        userData['label'] = profileData.label;
      }
      
      console.log('Creating user with data:', userData);
      
      const userProfile = await profileApi.post(API_ENDPOINTS.USERS.CREATE_PROFILE, userData);
      
      if (userProfile) {
        await saveUserData(userProfile);
        login(userProfile);
        setIsLoading(false);
        // Toast de succès géré automatiquement
      }
    } catch (error: any) {
      handleError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [profileApi, saveUserData, login, handleError]);
  
  /**
   * Rafraîchir le token d'authentification
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
      
      if (!refreshTokenValue) {
        throw new Error('Aucun refresh token disponible');
      }
      
      const tokens = await refreshApi.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refresh: refreshTokenValue,
      });
      
      if (tokens) {
        await saveTokens(tokens);
      } else {
        // Refresh token invalide, forcer la déconnexion
        await logout();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
    } catch (error: any) {
      console.error('Erreur lors du refresh du token:', error);
      await logout();
      throw error;
    }
  }, [refreshApi, saveTokens]);
  
  /**
   * Déconnexion complète
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Nettoyer le stockage local
      await clearStorage();
      
      // Nettoyer le store global
      storeLogout();
      
      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      storeLogout();
      setIsLoading(false);
    }
  }, [clearStorage, storeLogout]);
  
  /**
   * Restaurer la session au démarrage de l'app
   */
  const restoreSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        AUTH_CONFIG.TOKEN_STORAGE_KEY,
        AUTH_CONFIG.USER_STORAGE_KEY,
      ]);
      
      const authToken = token[1];
      const userDataString = userData[1];
      
      if (authToken && userDataString) {
        const parsedUserData: WeSappCode = JSON.parse(userDataString);
        login(parsedUserData);
      }
    } catch (error) {
      console.error('Erreur lors de la restauration de session:', error);
      // En cas d'erreur, nettoyer le stockage corrompu
      await clearStorage();
    } finally {
      setIsLoading(false);
    }
  }, [login, clearStorage]);
  
  // Restaurer la session au montage du hook
  useEffect(() => {
    if (!isAuthenticated) {
      restoreSession();
    }
  }, []);
  
  // Gérer les erreurs des hooks API individuels
  useEffect(() => {
    const apiError = otpApi.error || verifyApi.error || profileApi.error || refreshApi.error;
    if (apiError) {
      setError(apiError);
      setIsLoading(false);
    }
  }, [otpApi.error, verifyApi.error, profileApi.error, refreshApi.error]);
  
  // Gérer l'état de loading des hooks API individuels
  useEffect(() => {
    const isApiLoading = otpApi.isLoading || verifyApi.isLoading || profileApi.isLoading || refreshApi.isLoading;
    if (isApiLoading !== isLoading) {
      setIsLoading(isApiLoading);
    }
  }, [otpApi.isLoading, verifyApi.isLoading, profileApi.isLoading, refreshApi.isLoading, isLoading]);
  
  return {
    // États
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    requestOTP,
    verifyOTP,
    createProfile,
    logout,
    refreshToken,
  };
};

export default useAuth;