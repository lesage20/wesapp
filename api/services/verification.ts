import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser, verifyOtp } from './authService';
// import { useAuthStore } from '~/store/store';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  profilePhoto: string;
  countryCode: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

interface VerifyOTPResponse {
  success: boolean;
  isNewUser: boolean;
  user?: User;
  pendingUserId?: string;
  token?: string;
}

interface CreateProfileResponse {
    success: boolean;
    user?: User;
    token?: string;
}

export const createProfile = async (username: string, photo: string): Promise<CreateProfileResponse> => {
    // const { login } = useAuthStore();
  
    try {
      // Appeler l'API de création de profil
      const response = await createUser(username, photo);
      console.log('Réponse de création de profil:', JSON.stringify(response.data));
  
      if (!response.data || !response.data.user) {
        throw new Error('Aucune donnée utilisateur renvoyée par l\'API');
      }
  
      const userData: User = {
        id: response.data.user.id || '',
        username: response.data.user.username || username,
        phoneNumber: response.data.user.phone_number || '',
        profilePhoto: response.data.user.profile_photo || photo,
        countryCode: response.data.user.country_code || '',
        isOnline: response.data.user.is_online || true,
        lastSeen: response.data.user.last_seen || new Date().toISOString(),
        createdAt: response.data.user.created_at || new Date().toISOString(),
        updatedAt: response.data.user.updated_at || new Date().toISOString(),
      };
  
      // Sauvegarder les données utilisateur dans AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('Données utilisateur sauvegardées:', userData);
  
      // Sauvegarder le token s'il est présent
      if (response.data.token) {
        // login(userData);
        await AsyncStorage.setItem('authToken', response.data.token);
        console.log('Token d\'authentification sauvegardé');
      } else {
        console.warn('Aucun token d\'authentification dans la réponse');
      }
  
      // Charger les codes WeSapp si le numéro de téléphone est disponible
      if (userData.phoneNumber) {
        try {
          // await useWesappCodeStore.getState().loadUserCodes(userData.phoneNumber);
          console.log('Codes WeSapp chargés avec succès');
        } catch (error) {
          console.error('Erreur lors du chargement des codes WeSapp:', error);
        }
      }
  
      return {
        success: true,
        user: userData,
        token: response.data.token,
      };
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw new Error('Erreur lors de la création du profil');
    }
  };

const verifyOTP = async (code: string, phone: string): Promise<VerifyOTPResponse> => {
  console.log('Vérification OTP pour le numéro:', phone, 'avec le code:', code);
  // const { login } = useAuthStore();

  try {
    // Vérifier que le numéro de téléphone est fourni
    if (!phone) {
      throw new Error('Numéro de téléphone manquant');
    }

    // Appeler l'API de vérification OTP
    const response = await verifyOtp(phone, code);
    console.log('Réponse de vérification OTP:', JSON.stringify(response.data));

    // Sauvegarder le token si présent
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      console.log('Token d\'authentification sauvegardé');
    } else {
      console.warn('Aucun token d\'authentification dans la réponse');
    }

    // Vérifier si l'utilisateur existe
    const userExists = response.data.existing_user === true;
    console.log('Utilisateur existant?', userExists ? 'OUI' : 'NON');

    // Vérifier si des données utilisateur sont disponibles
    const userDataFromResponse = response.data.user_data;
    const userFromResponse = response.data.user;
    const hasUserData = !!userDataFromResponse || !!userFromResponse;
    console.log('Données utilisateur présentes?', hasUserData ? 'OUI' : 'NON');

    let result: VerifyOTPResponse = {
      success: true,
      isNewUser: !userExists,
    };

    if (userExists && hasUserData) {
      // Utilisateur existant : formater les données utilisateur
      let validUserData: User;

      if (userFromResponse) {
        validUserData = {
          id: userFromResponse.id || userFromResponse.user_id || '',
          username: userFromResponse.username || '',
          phoneNumber: userFromResponse.phone_number || phone,
          profilePhoto: userFromResponse.profile_photo || '',
          countryCode: userFromResponse.country_code || '',
          isOnline: userFromResponse.is_online || true,
          lastSeen: userFromResponse.last_seen || new Date().toISOString(),
          createdAt: userFromResponse.created_at || new Date().toISOString(),
          updatedAt: userFromResponse.updated_at || new Date().toISOString(),
        };
      } else if (userDataFromResponse) {
        validUserData = {
          id: userDataFromResponse.id || '',
          username: userDataFromResponse.username || '',
          phoneNumber: userDataFromResponse.phoneNumber || phone,
          profilePhoto: userDataFromResponse.profilePhoto || '',
          countryCode: userDataFromResponse.countryCode || '',
          isOnline: userDataFromResponse.isOnline || true,
          lastSeen: userDataFromResponse.lastSeen || new Date().toISOString(),
          createdAt: userDataFromResponse.createdAt || new Date().toISOString(),
          updatedAt: userDataFromResponse.updatedAt || new Date().toISOString(),
        };
      } else {
        validUserData = {
          id: '',
          username: '',
          phoneNumber: phone,
          profilePhoto: '',
          countryCode: '',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Sauvegarder les données utilisateur
      await AsyncStorage.setItem('userData', JSON.stringify(validUserData));
      console.log('Données utilisateur sauvegardées:', validUserData);

      // Ajouter les données utilisateur au résultat
      result.user = validUserData;
      result.token = response.data.token;
      // login(validUserData);

      // Charger les codes WeSapp si nécessaire
      try {
        // await useWesappCodeStore.getState().loadUserCodes(validUserData.phoneNumber);
        console.log('Codes WeSapp chargés avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des codes WeSapp:', error);
      }
    } else {
      // Nouvel utilisateur : sauvegarder l'ID en attente si disponible
      if (response.data.pending_user_id) {
        await AsyncStorage.setItem('pendingUserId', response.data.pending_user_id);
        console.log('ID utilisateur en attente sauvegardé:', response.data.pending_user_id);
        result.pendingUserId = response.data.pending_user_id;
      }
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de la vérification OTP:', error);
    throw new Error('Code OTP invalide ou expiré');
  }
};

export default verifyOTP;

