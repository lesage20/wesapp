// import ApiClient from '../ApiClient';
import ApiClient from '../ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../constants/ApiConstant';
import { AuthResponse, ConversationWesapp, MessageResponse, MessageWesapp, VerifyOtpResponse, WeSappCode } from '../../types';
import { AxiosResponse } from 'axios';

export const requestOtp = async (phoneNumber: string, countryCode: string): Promise<void> => {
  try {
    // Formater le numéro de téléphone : ajouter le code pays et supprimer les espaces
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Requesting OTP for phone:', formattedPhone);
    await ApiClient.post(API_ENDPOINTS.REQUEST_OTP, { phone_number: formattedPhone, country_code: countryCode });
    console.log('OTP request successful');
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
};

// Fonction pour formater le numéro de téléphone
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

export const verifyOtp = async (phoneNumber: string, otp: string): Promise<AxiosResponse<VerifyOtpResponse>> => {
  try {
    // Formater le numéro de téléphone de la même manière que pour la demande
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Verifying OTP for phone:', formattedPhone, 'with code:', otp);
    
    // Sauvegarder le dernier numéro de téléphone utilisé pour faciliter les connexions futures
    await AsyncStorage.setItem('lastPhoneNumber', phoneNumber);
    
    // Envoyer la requête de vérification OTP
    const response = await ApiClient.post(API_ENDPOINTS.VERIFY_OTP, { phone_number: formattedPhone, otp });
    
    console.log('OTP verification response:', response.data);
    
    // Sauvegarder le token d'authentification si disponible
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      console.log('Token d\'authentification sauvegardé');
    }
    
    // Sauvegarder les données utilisateur si disponibles
    if (response.data.user_data) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user_data));
    }
    
    // Si d'autres données sont disponibles, les sauvegarder aussi
    if (response.data.pending_user_id) {
      await AsyncStorage.setItem('pendingUserId', response.data.pending_user_id);
    }
    
    // Convertir le booléen en chaîne de caractères pour AsyncStorage
    if (response.data.existing_user !== undefined) {
      await AsyncStorage.setItem('existingUser', response.data.existing_user.toString());
    }
    
    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};


export const createUser = async (username: string, photo: string): Promise<AxiosResponse<VerifyOtpResponse>> => {
  try {
    console.log('Creating user with username:', username);
    
    // Récupérer l'ID utilisateur en attente du stockage local
    const pendingUserId = await AsyncStorage.getItem('pendingUserId');
    if (!pendingUserId) {
      throw new Error('No pending user ID found');
    }
    
    // Créer un objet JSON pour envoyer les données
    const userData: Record<string, any> = {
      pending_user_id: pendingUserId,
      username: username,
      password: 'password', // Mot de passe par défaut ou généré
    };
    
    // Ajouter la photo de profil si elle existe
    if (photo) {
      if (photo.startsWith('data:image')) {
        // Si c'est une image en base64 avec en-tête data URL
        userData['profile_photo'] = photo;
      } else if (photo.startsWith('file://') || photo.startsWith('content://')) {
        // Pour les URI de fichier, on ne peut pas les envoyer directement en JSON
        // On pourrait les convertir en base64 ici si nécessaire
        console.warn('Les URI de fichier ne sont pas supportés en mode JSON, utilisez le format base64');
        userData['profile_photo'] = 'default_avatar';
      } else if (photo.length <= 2) {
        // Si c'est probablement un emoji (longueur courte)
        console.log('Emoji détecté:', photo);
        userData['profile_photo'] = 'default_avatar';
        userData['avatar_emoji'] = photo; // Ajouter l'emoji comme champ su00e9paru00e9
      } else {
        // Autre format texte
        userData['profile_photo'] = photo;
      }
    }
    console.log(userData);
    // Configurer les en-têtes pour l'envoi de JSON
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Envoyer la requête avec JSON
    const response = await ApiClient.post(API_ENDPOINTS.CREATE_USER, userData, config);
    console.log('User creation successful');
    
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};


export const createPremiumUser = async (username: string, photo: string, code: string): Promise<AxiosResponse<VerifyOtpResponse>> => {
  try {
    console.log('Creating user with username:', username);
    

    // Configurer les en-têtes pour l'envoi de JSON
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Envoyer la requête avec JSON
    const response = await ApiClient.post(API_ENDPOINTS.CREATE_PREMIUM_USER, {username, photo, code}, config);
    console.log('User creation successful');
    
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
// Récupère les codes WeSapp associés au numéro de téléphone
// Si aucun numéro n'est fourni, utilise le numéro stocké
export const getUserCodeWesapp = async (phoneNumber?: string) => {
  try {
    // Si aucu4n numéro n'est fourni, essayer de récupérer le numéro stocké
    if (!phoneNumber) {
      const storedPhoneNumber = await getStoredPhoneNumber();
      if (!storedPhoneNumber) {
        throw new Error('Aucun numéro de téléphone disponible');
      }
      phoneNumber = storedPhoneNumber;
    }
    
    const response = await ApiClient.get(
      `${API_ENDPOINTS.SEARCH_WESAPP_CODE_BY_PHONE}phone_number=${phoneNumber}`
    );

    return response.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};

export const getConnections = async (wesappCode?: string) => {
  try {
    if (!wesappCode) {
      // Au lieu d'utiliser currentCode qui n'est pas défini ici, on va gérer
      // ce cas dans le composant appelant
      throw new Error("Code WeSapp requis pour récupérer les connexions");
    }
    
    // Suppression du log qui cause des problèmes de performance
    // console.log("Récupération des connexions pour le code WeSapp:", wesappCode);
    
    // Appel à l'API pour récupérer les connexions
    const response = await ApiClient.get(
      `${API_ENDPOINTS.GET_CONNECTIONS}${wesappCode}`
    );

    // Format des données reçues:
    // [{
    //   id: string;
    //   connection_id: string;
    //   we_sapp_code: string;
    //   owner_we_sapp_code: string;
    //   connection_name: string;
    //   blocked: boolean;
    //   muted_until: string | null;
    //   nickname: string;
    //   tags: string[];
    //   created_at: string;
    //   updated_at: string;
    //   we_sapp_code_details: {
    //     id: string;
    //     code: string;
    //     bio: string;
    //     profile_photo: string;
    //     username: string;
    //   };
    //   owner_we_sapp_code_details: {
    //     id: string;
    //     code: string;
    //     bio: string;
    //     profile_photo: string;
    //     username: string;
    //   };
    // }]
    
    console.log("Connexions récupérées:", response.data ? response.data.length : 0);
    return response.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};


export const saveFcmToken = async (token: string): Promise<void> => {
  await ApiClient.post(API_ENDPOINTS.SAVE_TOKEN, { token });
};

// Fonctions pour gérer le stockage sécurisé du numéro de téléphone
export const storePhoneNumber = async (phoneNumber: string): Promise<void> => {
  try {
    // Stocker le numéro de téléphone dans AsyncStorage
    await AsyncStorage.setItem('securePhoneNumber', phoneNumber);
    console.log('Numéro de téléphone stocké avec succès:', phoneNumber);
  } catch (error) {
    // console.error('Erreur lors du stockage du numéro de téléphone:', error);
    throw error;
  }
};

export const getStoredPhoneNumber = async (): Promise<string | null> => {
  try {
    // Récupérer le numéro de téléphone stocké
    const phoneNumber = await AsyncStorage.getItem('securePhoneNumber');
    return phoneNumber;
  } catch (error) {
    console.error('Erreur lors de la récupération du numéro de téléphone:', error);
    return null;
  }
};

// Fonction pour effacer le token d'authentification tout en préservant le numéro de téléphone
export const clearAuthToken = async (): Promise<void> => {
  try {
    // Ne pas supprimer le numéro de téléphone sécurisé
    // car il doit persister pour les futures connexions
    
    // Effacer les données d'authentification
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('existingUser');
    await AsyncStorage.removeItem('pendingUserId');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('lastPhoneNumber');
    
    console.log('Token d\'authentification effacé, numéro de téléphone conservé');
  } catch (error) {
    console.error('Erreur lors de l\'effacement du token:', error);
    throw error;
  }
};



export const getConversationById = async (conversationId: string): Promise<ConversationWesapp> => {
  const response = await ApiClient.get(API_ENDPOINTS.GET_CONVERSATION_BY_ID + conversationId);
  return response.data;
};

export const getMessagesByConversationId = async (conversationId: string): Promise<MessageResponse> => {
  const response = await ApiClient.get(API_ENDPOINTS.GET_MESSAGES_BY_CONVERSATION_ID + conversationId);
  return response.data;
};