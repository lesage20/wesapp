/**
 * Hook générique pour les appels API
 * 
 * Ce hook fournit une interface commune pour tous les appels API avec
 * gestion d'état, d'erreurs, de loading et de notifications toast.
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  API_CONFIG, 
  DEFAULT_HEADERS, 
  AUTH_CONFIG, 
  ERROR_MESSAGES, 
  RETRY_CONFIG,
  TOAST_CONFIG 
} from './constants';
import { UseApiState, UseApiOptions, ApiResponse, ApiError } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
}

// Utilitaire pour afficher les toasts (à remplacer par votre système de toast préféré)
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // Temporary implementation with Alert - remplacer par react-native-toast-message ou similaire
  if (type === 'error') {
    Alert.alert('Erreur', message);
  } else if (type === 'success') {
    Alert.alert('Succès', message);
  } else {
    Alert.alert('Information', message);
  }
};

// Utilitaire pour construire l'URL complète
const buildUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Utilitaire pour récupérer le token d'authentification
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Erreur lors de la récupération du token:', error);
    return null;
  }
};

// Utilitaire pour les headers avec authentification
const getHeaders = async (customHeaders: Record<string, string> = {}, requiresAuth = true): Promise<Record<string, string>> => {
  const headers = { ...DEFAULT_HEADERS, ...customHeaders };
  
  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `${AUTH_CONFIG.TOKEN_PREFIX} ${token}`;
    }
  }
  
  return headers;
};

// Utilitaire pour gérer les erreurs HTTP
const handleHttpError = (status: number, data: any): string => {
  switch (status) {
    case 400:
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 408:
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Fonction principale pour effectuer les requêtes HTTP
const makeRequest = async <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => {
  const { method, url, data, headers: customHeaders = {}, requiresAuth = true, timeout = API_CONFIG.TIMEOUT } = config;
  
  try {
    const headers = await getHeaders(customHeaders, requiresAuth);
    const fullUrl = buildUrl(url);
    
    // Configuration de la requête
    const requestConfig: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };
    
    // Ajouter le body pour les méthodes qui le supportent
    if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
      if (data instanceof FormData) {
        // Pour les uploads de fichiers, ne pas définir Content-Type (laissé au navigateur)
        delete requestConfig.headers!['Content-Type'];
        requestConfig.body = data;
      } else {
        requestConfig.body = JSON.stringify(data);
      }
    }
    
    const response = await fetch(fullUrl, requestConfig);
    
    // Traitement de la réponse
    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    if (!response.ok) {
      const errorMessage = handleHttpError(response.status, responseData);
      return {
        success: false,
        error: {
          message: errorMessage,
          code: response.status.toString(),
          details: responseData,
        },
      };
    }
    
    return {
      success: true,
      data: responseData,
    };
    
  } catch (error: any) {
    console.error('Erreur API:', error);
    
    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (error.message === 'Network request failed' || !navigator.onLine) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        details: error,
      },
    };
  }
};

// Fonction utilitaire pour retry avec backoff exponentiel
const retryRequest = async <T = any>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS
): Promise<ApiResponse<T>> => {
  let lastError: ApiResponse<T>;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await requestFn();
    
    if (result.success) {
      return result;
    }
    
    lastError = result;
    
    // Si c'est une erreur 4xx (client), ne pas retry
    if (result.error?.code && parseInt(result.error.code) >= 400 && parseInt(result.error.code) < 500) {
      break;
    }
    
    // Attendre avant le prochain essai (sauf pour le dernier)
    if (attempt < maxAttempts) {
      const delay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.DELAY_MULTIPLIER, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return lastError!;
};

/**
 * Hook générique pour les appels API
 */
export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    message: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Fonction pour mettre à jour l'état
  const updateState = useCallback((updates: Partial<UseApiState<T>>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Fonction générique pour effectuer une requête
  const request = useCallback(async <R = T>(config: RequestConfig): Promise<R | null> => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    updateState({ isLoading: true, error: null, message: null });
    
    try {
      const result = await retryRequest(() => makeRequest<R>(config));
      
      if (result.success && result.data) {
        updateState({ 
          data: result.data as T, 
          isLoading: false,
          message: result.message || null,
        });
        
        // Callback de succès
        if (options.onSuccess) {
          options.onSuccess(result.data);
        }
        
        // Toast de succès si demandé
        if (options.showToast && result.message) {
          showToast(result.message, 'success');
        }
        
        return result.data;
      } else {
        const errorMessage = result.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        updateState({ 
          isLoading: false, 
          error: errorMessage,
        });
        
        // Callback d'erreur
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        // Toast d'erreur si demandé
        if (options.showToast !== false) {
          showToast(errorMessage, 'error');
        }
        
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      updateState({ 
        isLoading: false, 
        error: errorMessage,
      });
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      if (options.showToast !== false) {
        showToast(errorMessage, 'error');
      }
      
      return null;
    }
  }, [options, updateState]);
  
  // Méthodes HTTP spécialisées
  const get = useCallback((url: string, headers?: Record<string, string>) => {
    return request({ method: 'GET', url, headers });
  }, [request]);
  
  const post = useCallback((url: string, data?: any, headers?: Record<string, string>) => {
    return request({ method: 'POST', url, data, headers });
  }, [request]);
  
  const put = useCallback((url: string, data?: any, headers?: Record<string, string>) => {
    return request({ method: 'PUT', url, data, headers });
  }, [request]);
  
  const patch = useCallback((url: string, data?: any, headers?: Record<string, string>) => {
    return request({ method: 'PATCH', url, data, headers });
  }, [request]);
  
  const del = useCallback((url: string, headers?: Record<string, string>) => {
    return request({ method: 'DELETE', url, headers });
  }, [request]);
  
  // Fonction pour reset l'état
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      message: null,
    });
  }, []);
  
  // Cleanup à la destruction du composant
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  return {
    // État
    ...state,
    
    // Méthodes HTTP
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilitaires
    reset,
    cleanup,
  };
};

export default useApi;