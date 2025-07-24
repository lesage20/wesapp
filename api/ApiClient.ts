import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './ApiConstant';
import { router } from 'expo-router';
import { clearAuthToken } from './services/authService';

const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
ApiClient.interceptors.request.use(async (config) => {
  // Liste des endpoints qui ne nécessitent pas d'authentification
  const noAuthEndpoints = [
    'auth/request-otp/',
    'auth/verify-otp/',
    'users/create-profile/',
    'auth/login/'
  ];
  
  // Vérifier si l'URL de la requête est dans la liste des endpoints sans authentification
  const isAuthEndpoint = noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  // Ajouter le token seulement si ce n'est pas un endpoint d'authentification
  if (!isAuthEndpoint) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs de réponse
// ApiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.log('API Error Details:', error);
//     if (error.response) {
//       // La requête a été faite et le serveur a répondu avec un code d'état
//       console.log('Status:', error.response.status);
//       console.log('Data:', error.response.data);
//     } else if (error.request) {
//       // La requête a été faite mais aucune réponse n'a été reçue
//       console.log('No response received - Network issue or server down');
//     } else {
//       // Une erreur s'est produite lors de la configuration de la requête
//       console.log('Error message:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// Remplacer l'intercepteur existant par celui-ci :
ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error Details:', error);
    
    // Gestion spécifique pour l'erreur 401 (Non autorisé)
    if (error.response && error.response.status === 401) {
      console.log('Session expirée ou invalide (401 Unauthorized). Déconnexion...');
      
      try {
        // Nettoyer les données d'authentification
        // await AsyncStorage.multiRemove([
        //   'authToken',
        //   'userData',
        //   'existingUser',
        //   'pendingUserId',
        //   'lastPhoneNumber',
        //   'token'
        // ]);
        await clearAuthToken();
        // Rediriger vers l'écran de connexion
        // Utilisation d'un setTimeout pour éviter les problèmes de navigation pendant une action en cours
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
        
        console.log('Utilisateur redirigé vers l\'écran de connexion');
      } catch (logoutError) {
        console.error('Erreur lors de la déconnexion:', logoutError);
      }
    } else if (error.response) {
      // Autre erreur avec réponse du serveur
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.log('No response received - Network issue or server down');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.log('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default ApiClient;