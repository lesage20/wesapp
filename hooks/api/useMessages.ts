/**
 * Hook pour la messagerie
 * 
 * Gère les conversations, messages, envoi de messages,
 * réactions, édition et suppression.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  PAGINATION_CONFIG,
  SUCCESS_MESSAGES,
  MESSAGE_TYPES 
} from '../constants';
import {
  UseMessagesReturn,
  Conversation,
  Message,
  SendMessagePayload,
  UpdateMessagePayload,
  PaginatedResponse,
  PaginationParams
} from '../types';

interface UseMessagesOptions {
  autoLoad?: boolean;
  conversationId?: string;
  realTimeUpdates?: boolean;
}

export const useMessages = (options: UseMessagesOptions = {}): UseMessagesReturn => {
  const { autoLoad = false, conversationId, realTimeUpdates = false } = options;
  
  // États locaux
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Pagination
  const conversationOffsetRef = useRef(0);
  const messageOffsetRef = useRef(0);
  
  // Hooks API spécialisés
  const conversationsApi = useApi<PaginatedResponse<Conversation>>({ showToast: false });
  const messagesApi = useApi<PaginatedResponse<Message>>({ showToast: false });
  const sendMessageApi = useApi<Message>({ showToast: true });
  const updateMessageApi = useApi<Message>({ showToast: false });
  const deleteMessageApi = useApi({ showToast: true });
  const createConversationApi = useApi<Conversation>({ showToast: true });
  const checkExistingApi = useApi<Conversation>({ showToast: false });
  // Nouveaux hooks API pour l'harmonisation avec l'API existante
  const getConversationWithMessagesApi = useApi<any>({ showToast: false });
  const getConversationByIdApi = useApi<any>({ showToast: false });
  const getMessagesByConversationIdApi = useApi<any>({ showToast: false });
  const setReplyToMessageApi = useApi<Message[]>({ showToast: false });
  const setReactionApi = useApi<Message[]>({ showToast: true });
  const createGroupConversationApi = useApi<any>({ showToast: true });
  const fetchConversationByIdApi = useApi<any>({ showToast: false });
  
  // État global de loading
  const isLoading = conversationsApi.isLoading || 
                   messagesApi.isLoading || 
                   sendMessageApi.isLoading || 
                   updateMessageApi.isLoading || 
                   deleteMessageApi.isLoading ||
                   createConversationApi.isLoading ||
                   getConversationWithMessagesApi.isLoading ||
                   getConversationByIdApi.isLoading ||
                   getMessagesByConversationIdApi.isLoading ||
                   setReplyToMessageApi.isLoading ||
                   setReactionApi.isLoading ||
                   createGroupConversationApi.isLoading ||
                   fetchConversationByIdApi.isLoading;
  
  // État global d'erreur
  const error = conversationsApi.error || 
               messagesApi.error || 
               sendMessageApi.error || 
               updateMessageApi.error || 
               deleteMessageApi.error ||
               createConversationApi.error ||
               getConversationWithMessagesApi.error ||
               getConversationByIdApi.error ||
               getMessagesByConversationIdApi.error ||
               setReplyToMessageApi.error ||
               setReactionApi.error ||
               createGroupConversationApi.error ||
               fetchConversationByIdApi.error;
  
  /**
   * Charger les conversations avec pagination
   */
  const loadConversations = useCallback(async (refresh = false): Promise<void> => {
    if (refresh) {
      conversationOffsetRef.current = 0;
      setHasMoreConversations(true);
    }
    
    if (!hasMoreConversations && !refresh) {
      return;
    }
    
    const params: PaginationParams = {
      limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
      offset: conversationOffsetRef.current,
    };
    
    // Construire l'URL avec les paramètres de pagination
    const queryParams = new URLSearchParams({
      limit: params.limit!.toString(),
      offset: params.offset!.toString(),
    });
    
    const url = `${API_ENDPOINTS.CONVERSATIONS.BASE}?${queryParams}`;
    const result = await conversationsApi.get(url);
    
    if (result) {
      if (refresh) {
        setConversations(result.results);
      } else {
        setConversations(prev => [...prev, ...result.results]);
      }
      
      conversationOffsetRef.current += result.results.length;
      setHasMoreConversations(!!result.next);
    }
  }, [conversationsApi, hasMoreConversations]);
  
  /**
   * Charger les messages d'une conversation avec pagination
   */
  const loadMessages = useCallback(async (conversationId: string, refresh = false): Promise<void> => {
    if (refresh) {
      messageOffsetRef.current = 0;
      setHasMoreMessages(true);
    }
    
    if (!hasMoreMessages && !refresh) {
      return;
    }
    
    setCurrentConversationId(conversationId);
    
    const params: PaginationParams = {
      limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
      offset: messageOffsetRef.current,
    };
    
    // Ajouter le conversationId aux paramètres
    const queryParams = new URLSearchParams({
      conversation: conversationId,
      limit: params.limit!.toString(),
      offset: params.offset!.toString(),
    });
    
    const url = `${API_ENDPOINTS.MESSAGES.BASE}?${queryParams}`;
    const result = await messagesApi.get(url);
    
    if (result) {
      if (refresh) {
        setMessages(result.results);
      } else {
        // Pour les messages, on ajoute au début (messages plus anciens)
        setMessages(prev => [...result.results, ...prev]);
      }
      
      messageOffsetRef.current += result.results.length;
      setHasMoreMessages(!!result.next);
    }
  }, [messagesApi, hasMoreMessages]);
  
  /**
   * Charger plus de conversations (pagination)
   */
  const loadMoreConversations = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMoreConversations) return;
    
    setIsLoadingMore(true);
    await loadConversations(false);
    setIsLoadingMore(false);
  }, [loadConversations, isLoadingMore, hasMoreConversations]);
  
  /**
   * Charger plus de messages (pagination)
   */
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMoreMessages || !currentConversationId) return;
    
    setIsLoadingMore(true);
    await loadMessages(currentConversationId, false);
    setIsLoadingMore(false);
  }, [loadMessages, isLoadingMore, hasMoreMessages, currentConversationId]);
  
  /**
   * Envoyer un nouveau message
   */
  const sendMessage = useCallback(async (payload: SendMessagePayload): Promise<void> => {
    if (!payload.content?.trim() && !payload.media_url) {
      throw new Error('Le contenu du message ou un média est requis');
    }
    
    if (!payload.conversation) {
      throw new Error('L\'ID de conversation est requis');
    }
    
    // Validation du type de message
    if (!Object.values(MESSAGE_TYPES).includes(payload.message_type)) {
      throw new Error('Type de message invalide');
    }
    
    const result = await sendMessageApi.post(API_ENDPOINTS.MESSAGES.BASE, payload);
    
    if (result) {
      // Ajouter le message à la liste locale
      setMessages(prev => [...prev, result]);
      
      // Mettre à jour la conversation avec le dernier message
      setConversations(prev => prev.map(conv => 
        conv.id === payload.conversation 
          ? { ...conv, messages: [...conv.messages, result] }
          : conv
      ));
    }
  }, [sendMessageApi]);
  
  /**
   * Mettre à jour un message (réactions, lecture, édition)
   */
  const updateMessage = useCallback(async (messageId: string, payload: UpdateMessagePayload): Promise<void> => {
    if (!messageId) {
      throw new Error('L\'ID du message est requis');
    }
    
    const url = `${API_ENDPOINTS.MESSAGES.BASE}${messageId}/`;
    const result = await updateMessageApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour le message dans la liste locale
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, ...result } : msg
      ));
      
      // Mettre à jour aussi dans les conversations
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...result } : msg
        )
      })));
    }
  }, [updateMessageApi]);
  
  /**
   * Supprimer un message
   */
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!messageId) {
      throw new Error('L\'ID du message est requis');
    }
    
    const url = `${API_ENDPOINTS.MESSAGES.BASE}${messageId}/`;
    const result = await deleteMessageApi.delete(url);
    
    if (result !== null) { // Succès de suppression (pas de contenu retourné)
      // Supprimer le message de la liste locale
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Supprimer aussi des conversations
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.filter(msg => msg.id !== messageId)
      })));
    }
  }, [deleteMessageApi]);
  
  /**
   * Créer une nouvelle conversation
   */
  const createConversation = useCallback(async (participantIds: string[]): Promise<void> => {
    if (!participantIds || participantIds.length === 0) {
      throw new Error('Au moins un participant est requis');
    }
    
    const payload = {
      participant_ids: participantIds,
      is_group: participantIds.length > 2,
    };
    
    const result = await createConversationApi.post(API_ENDPOINTS.CONVERSATIONS.BASE, payload);
    
    if (result) {
      // Ajouter la nouvelle conversation au début de la liste
      setConversations(prev => [result, ...prev]);
    }
  }, [createConversationApi]);
  
  /**
   * Vérifier si une conversation existe déjà
   */
  const checkExistingConversation = useCallback(async (participantIds: string[]): Promise<Conversation | null> => {
    if (!participantIds || participantIds.length === 0) {
      return null;
    }
    
    const queryParams = new URLSearchParams({
      participants: participantIds.join(','),
    });
    
    const url = `${API_ENDPOINTS.CONVERSATIONS.CHECK_EXISTING}?${queryParams}`;
    return await checkExistingApi.get(url);
  }, [checkExistingApi]);
  
  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadConversations(true),
      currentConversationId ? loadMessages(currentConversationId, true) : Promise.resolve(),
    ]);
  }, [loadConversations, loadMessages, currentConversationId]);
  
  /**
   * Fonctions utilitaires pour les réactions
   */
  const addReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    // Optimistic update
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        const currentUserId = 'currentUser'; // À remplacer par l'ID utilisateur réel
        
        if (reactions[emoji]) {
          if (!reactions[emoji].includes(currentUserId)) {
            reactions[emoji].push(currentUserId);
          }
        } else {
          reactions[emoji] = [currentUserId];
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
    
    // API call
    await updateMessage(messageId, { reactions: messages.find(m => m.id === messageId)?.reactions });
  }, [updateMessage, messages]);
  
  const removeReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    // Optimistic update
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        const currentUserId = 'currentUser'; // À remplacer par l'ID utilisateur réel
        
        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].filter((id: string) => id !== currentUserId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
    
    // API call
    await updateMessage(messageId, { reactions: messages.find(m => m.id === messageId)?.reactions });
  }, [updateMessage, messages]);
  
  /**
   * Marquer les messages comme lus
   */
  const markAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    const promises = messageIds.map(messageId => 
      updateMessage(messageId, { is_read: true })
    );
    
    await Promise.all(promises);
  }, [updateMessage]);
  
  /**
   * Vérifier si une conversation existe déjà entre des participants (inspiré de l'API existante)
   */
  const checkExistingConversationImproved = useCallback(async (participantIds: string[]): Promise<Conversation | null> => {
    try {
      if (!participantIds || participantIds.length === 0) {
        throw new Error('Les identifiants des participants sont requis');
      }
      
      // Trier les IDs pour s'assurer de toujours avoir le même ordre
      const sortedIds = [...participantIds].sort();
      
      const url = `${API_ENDPOINTS.CONVERSATIONS.CHECK_EXISTING}?participant_id=${sortedIds[0]}&participant_id_2=${sortedIds[1]}`;
      console.log('Vérification de l\'existence d\'une conversation entre', sortedIds);
      
      const response = await checkExistingApi.get(url);
      
      if (response && response.id) {
        console.log('Conversation existante trouvée:', response);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'existence d\'une conversation:', error);
      return null;
    }
  }, [checkExistingApi]);
  
  /**
   * Créer ou récupérer une conversation (inspiré de l'API existante)
   */
  const getOrCreateConversation = useCallback(async (participantIds: string[]): Promise<Conversation> => {
    try {
      if (!participantIds || participantIds.length === 0) {
        throw new Error('Les identifiants des participants sont requis');
      }
      
      // D'abord vérifier si une conversation existe déjà
      const existingConversation = await checkExistingConversationImproved(participantIds);
      
      if (existingConversation) {
        return existingConversation;
      }
      
      // Si aucune conversation existante, en créer une nouvelle
      console.log('Création d\'une nouvelle conversation avec les participants:', participantIds);
      
      const response = await createConversationApi.post(API_ENDPOINTS.CONVERSATIONS.BASE, {
        'participant_ids': participantIds
      });
      
      console.log('Nouvelle conversation créée:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création/récupération de conversation:', error);
      throw error;
    }
  }, [checkExistingConversationImproved, createConversationApi]);
  
  /**
   * Récupérer les conversations pour un code WeSapp (inspiré de l'API existante)
   */
  const getConversationByIdImproved = useCallback(async (codeWeSapp: string): Promise<any> => {
    try {
      const response = await getConversationByIdApi.get(`${API_ENDPOINTS.CONVERSATIONS.GET_CONVERSATION_BY_ID}?code=${codeWeSapp}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return null;
    }
  }, [getConversationByIdApi]);
  
  /**
   * Récupérer une conversation spécifique par son ID, avec ses messages (inspiré de l'API existante)
   */
  const getConversationWithMessages = useCallback(async (conversationId: string): Promise<any> => {
    try {
      const response = await getConversationWithMessagesApi.get(`${API_ENDPOINTS.CONVERSATIONS.GET_CONVERSATION_WITH_MESSAGES}?conversation_id=${conversationId}`);
      return response?.conversation;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation spécifique:', error);
      return null;
    }
  }, [getConversationWithMessagesApi]);
  
  /**
   * Récupérer les messages d'une conversation avec pagination (inspiré de l'API existante)
   */
  const getMessagesByConversationId = useCallback(async (
    conversationId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<any> => {
    try {
      const url = `${API_ENDPOINTS.MESSAGES.GET_MESSAGES_BY_CONVERSATION_ID}?conversation_id=${conversationId}&page=${page}&page_size=${pageSize}`;
      const response = await getMessagesByConversationIdApi.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }, [getMessagesByConversationIdApi]);
  
  /**
   * Définir un message comme réponse à un autre (inspiré de l'API existante)
   */
  const setReplyToMessage = useCallback(async (messageId: string): Promise<Message[]> => {
    try {
      const response = await setReplyToMessageApi.get(`${API_ENDPOINTS.MESSAGES.SET_REPLY_TO_MESSAGE}${messageId}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la définition de la réponse:', error);
      throw error;
    }
  }, [setReplyToMessageApi]);
  
  /**
   * Ajouter une réaction à un message (inspiré de l'API existante)
   */
  const setReaction = useCallback(async (messageId: string, reaction: string): Promise<Message[]> => {
    try {
      const response = await setReactionApi.get(`${API_ENDPOINTS.MESSAGES.SET_REACTION}${messageId}/${reaction}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  }, [setReactionApi]);
  
  /**
   * Créer une conversation de groupe (inspiré de l'API existante)
   */
  const createGroupConversation = useCallback(async (
    memberCodeIds: string[], 
    groupName: string, 
    currentCodeId: string, 
    groupPhoto?: string | null
  ) => {
    try {
      const response = await createGroupConversationApi.post(API_ENDPOINTS.GROUPS.CREATE_GROUP, {
        'members': memberCodeIds,
        'name': groupName,
        'profile_photo': groupPhoto,
        'admin': currentCodeId
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création d\'une conversation de groupe:', error);
      throw error;
    }
  }, [createGroupConversationApi]);
  
  /**
   * Récupérer une conversation par ID (inspiré de l'API existante)
   */
  const fetchConversationById = useCallback(async (conversationId: string, currentCode: string) => {
    try {
      const response = await fetchConversationByIdApi.get(`${API_ENDPOINTS.CONVERSATIONS.GET_OTHER_USER}?conversation_id=${conversationId}&code_uuid=${currentCode}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation par ID:', error);
      throw error;
    }
  }, [fetchConversationByIdApi]);
  
  // Auto-load au montage si demandé
  useEffect(() => {
    if (autoLoad) {
      loadConversations(true);
    }
  }, [autoLoad, loadConversations]);
  
  // Auto-load des messages si conversationId fourni
  useEffect(() => {
    if (conversationId && autoLoad) {
      loadMessages(conversationId, true);
    }
  }, [conversationId, autoLoad, loadMessages]);
  
  return {
    // États
    conversations,
    messages,
    isLoading,
    error,
    
    // Pagination
    isLoadingMore,
    hasMoreConversations,
    hasMoreMessages,
    
    // Actions principales
    loadConversations,
    loadMessages,
    loadMoreConversations,
    loadMoreMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    createConversation,
    
    // Actions utilitaires
    checkExistingConversation,
    addReaction,
    removeReaction,
    markAsRead,
    refresh,
    
    // Nouvelles fonctions harmonisées avec l'API existante
    checkExistingConversationImproved,
    getOrCreateConversation,
    getConversationByIdImproved,
    getConversationWithMessages,
    getMessagesByConversationId,
    setReplyToMessage,
    setReaction,
    createGroupConversation,
    fetchConversationById,
    
    // État de la conversation courante
    currentConversationId,
  };
};

export default useMessages;