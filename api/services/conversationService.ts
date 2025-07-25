import { API_ENDPOINTS } from "../ApiConstant";
import { ConversationWesapp, MessageResponse, MessageWesapp } from "~/types";
import ApiClient from "~/api/ApiClient";

// Vérifie si une conversation existe déjà entre des participants
export const checkExistingConversation = async (participantIds: string[]): Promise<ConversationWesapp | null> => {
  try {
    if (!participantIds || participantIds.length === 0) {
      throw new Error("Les identifiants des participants sont requis");
    }
    
    // Trier les IDs pour s'assurer de toujours avoir le même ordre
    const sortedIds = [...participantIds].sort();

    const url = `${API_ENDPOINTS.CREATE_CONVERSATION}check-existing?participant_id=${sortedIds[0]}&participant_id_2=${sortedIds[1]}`;
    
    console.log("Vérification de l'existence d'une conversation entre", sortedIds);
    
    const response = await ApiClient.get(url);
    
    if (response.data && response.data.id) {
      console.log("Conversation existante trouvée:", response.data);
      return response.data;
    }
    
    return null;
  } catch (error) {
    // console.error("Erreur lors de la vérification de l'existence d'une conversation:", error);
    return null;
  }
};

// Crée une nouvelle conversation ou récupère celle qui existe déjà
export const getOrCreateConversation = async (participantIds: string[]): Promise<ConversationWesapp> => {
  try {
    if (!participantIds || participantIds.length === 0) {
      throw new Error("Les identifiants des participants sont requis");
    }
    
    // D'abord vérifier si une conversation existe déjà
    const existingConversation = await checkExistingConversation(participantIds);
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Si aucune conversation existante, en créer une nouvelle
    console.log("Création d'une nouvelle conversation avec les participants:", participantIds);
    
    const response = await ApiClient.post(API_ENDPOINTS.CREATE_CONVERSATION, {
      "participant_ids": participantIds
    });
    
    console.log("Nouvelle conversation créée:", response.data);
    return response.data;
  } catch (error) {
    // console.error("Erreur lors de la création/récupération de conversation:", error);
    throw error;
  }
};

// Récupère les conversations pour un code WeSapp
export const getConversationById = async (codeWeSapp: string): Promise<any> => {
  try {
    // console.log("Récupération des conversations pour le code WeSapp:", codeWeSapp);
    const response = await ApiClient.get(`${API_ENDPOINTS.GET_CONVERSATION_BY_ID}${codeWeSapp}`);
    return response.data;
  } catch (error) {
    // console.error("Erreur lors de la récupération des conversations:", error);
    // throw error;
  }
};

// Récupère une conversation spécifique par son ID, avec ses messages
export const getConversationWithMessages = async (conversationId: string): Promise<any> => {
  try {
    const response = await ApiClient.get(`${API_ENDPOINTS.GET_CONVERSATION_WITH_MESSAGES}${conversationId}`);
    return response.data.conversation;
  } catch (error) {
    // console.error("Erreur lors de la récupération de la conversation spécifique:", error);
    // throw error;
  }
};

// Récupère les messages d'une conversation avec pagination
export const getMessagesByConversationId = async (
  conversationId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<MessageResponse> => {
  try {
    const url = `${API_ENDPOINTS.GET_MESSAGES_BY_CONVERSATION_ID}${conversationId}&page=${page}&page_size=${pageSize}`;
    const response = await ApiClient.get(url);
    return response.data;
  } catch (error) {
    // console.error("Erreur lors de la récupération des messages:", error);
    throw error;
  }
};


// Récupère toutes les conversations de l'utilisateur
export const getAllConversations = async (): Promise<ConversationWesapp[]> => {
  try {
    const response = await ApiClient.get(API_ENDPOINTS.CREATE_CONVERSATION);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    throw error;
  }
};

export const setReplyToMessage = async (messageId: string): Promise<MessageWesapp[]> => {
  try {
    const response = await ApiClient.get(API_ENDPOINTS.SET_REPLY_TO_MESSAGE + messageId);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    throw error;
  }
};

export const setReaction = async (messageId: string, reaction: string): Promise<MessageWesapp[]> => {
  try {
    const response = await ApiClient.get(API_ENDPOINTS.SET_REACTION + messageId + '/' + reaction);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    throw error;
  }
};

export const createGroupConversation = async (memberCodeIds: string[], groupName: string, currentCodeId: string, groupPhoto?: string | null) => {
  try {
    const response = await ApiClient.post(API_ENDPOINTS.CREATE_GROUP, {
      "members": memberCodeIds,
      "name": groupName,
      "profile_photo": groupPhoto,
      "admin": currentCodeId
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création d'une conversation:", error);
    throw error;
  }
};


export const fetchConversationById = async (conversationId: string, currentCode: string) => {
  try {
    const response = await ApiClient.get(API_ENDPOINTS.GET_OTHER_CONVERSATIONS_USER + conversationId + '&code_uuid=' + currentCode);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};
