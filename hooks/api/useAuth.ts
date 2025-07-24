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
  
  // Fonction utilitaire pour sauvegarder les tokens
  const saveTokens = useCallback(async (tokens: TokenResponse) => {
    try {
      await AsyncStorage.multiSet([
        [AUTH_CONFIG.TOKEN_STORAGE_KEY, tokens.access],
        [AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, tokens.refresh],
      ]);
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
  
  // Fonction utilitaire pour nettoyer le stockage
  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        AUTH_CONFIG.TOKEN_STORAGE_KEY,
        AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
        AUTH_CONFIG.USER_STORAGE_KEY,
      ]);
    } catch (error) {
      console.warn('Erreur lors du nettoyage du stockage:', error);
    }
  }, []);
  
  /**
   * Demander l'envoi d'un code OTP
   */
  const requestOTP = useCallback(async (phoneNumber: string): Promise<void> => {
    if (!phoneNumber.trim()) {
      handleError('Le numéro de téléphone est requis');
      return;
    }
    
    // Valider le format du numéro de téléphone
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      handleError('Format de numéro de téléphone invalide. Utilisez le format international (+225...)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const payload: RequestOTPPayload = {
        phone_number: phoneNumber,
      };
      
      const result = await otpApi.post(API_ENDPOINTS.AUTH.REQUEST_OTP, payload);
      
      if (result) {
        setIsLoading(false);
        // Le toast de succès est géré automatiquement par useApi
      }
    } catch (error: any) {
      handleError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [otpApi, handleError]);
  
  /**
   * Vérifier le code OTP et obtenir les tokens
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
      const payload: VerifyOTPPayload = {
        phone_number: phoneNumber,
        otp_code: otpCode,
      };
      
      const tokens = await verifyApi.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
      
      if (tokens) {
        await saveTokens(tokens);
        setIsLoading(false);
        // Navigation vers profile-setup sera gérée par le composant appelant
      }
    } catch (error: any) {
      handleError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [verifyApi, saveTokens, handleError]);
  
  /**
   * Créer le profil utilisateur
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
      const userProfile = await profileApi.post(API_ENDPOINTS.USERS.CREATE_PROFILE, profileData);
      
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