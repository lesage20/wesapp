/**
 * Hook pour la gestion des contacts et connexions
 * 
 * Gère les connexions WeSapp, la recherche d'utilisateurs,
 * l'ajout de contacts et la gestion des blocages.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  PAGINATION_CONFIG,
  SUCCESS_MESSAGES,
} from '../constants';
import {
  UseContactsReturn,
  UserConnection,
  CreateConnectionPayload,
  UpdateConnectionPayload,
  WeSappCode,
  PaginatedResponse,
  PaginationParams,
  WesappUserBlocked,
  BlockUserPayload
} from '../types';

interface UseContactsOptions {
  autoLoad?: boolean;
  includeBlocked?: boolean;
}

export const useContacts = (options: UseContactsOptions = {}): UseContactsReturn => {
  const { autoLoad = false, includeBlocked = false } = options;
  
  // États locaux
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<WesappUserBlocked[]>([]);
  const [searchResults, setSearchResults] = useState<WeSappCode[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreConnections, setHasMoreConnections] = useState(true);
  
  // Pagination
  const connectionOffsetRef = useRef(0);
  
  // Hooks API spécialisés
  const connectionsApi = useApi<PaginatedResponse<UserConnection>>({ showToast: false });
  const createConnectionApi = useApi<UserConnection>({ showToast: true });
  const updateConnectionApi = useApi<UserConnection>({ showToast: true });
  const deleteConnectionApi = useApi({ showToast: true });
  const searchApi = useApi<WeSappCode[]>({ showToast: false });
  const getByCodeApi = useApi<UserConnection>({ showToast: false });
  const updateByCodeApi = useApi<UserConnection>({ showToast: true });
  const blockedApi = useApi<PaginatedResponse<WesappUserBlocked>>({ showToast: false });
  const blockUserApi = useApi<WesappUserBlocked>({ showToast: true });
  const unblockUserApi = useApi({ showToast: true });
  const isBlockedApi = useApi<WesappUserBlocked>({ showToast: false });
  // Nouveaux hooks API pour l'harmonisation avec l'API existante
  const checkCodeApi = useApi<WeSappCode>({ showToast: false });
  const fetchWeSappUsersApi = useApi<WeSappCode[]>({ showToast: false });
  const getBlockedContactsApi = useApi<WesappUserBlocked[]>({ showToast: false });
  
  // État global de loading
  const isLoading = connectionsApi.isLoading || 
                   createConnectionApi.isLoading || 
                   updateConnectionApi.isLoading || 
                   deleteConnectionApi.isLoading ||
                   searchApi.isLoading ||
                   getByCodeApi.isLoading ||
                   updateByCodeApi.isLoading ||
                   blockedApi.isLoading ||
                   blockUserApi.isLoading ||
                   unblockUserApi.isLoading ||
                   checkCodeApi.isLoading ||
                   fetchWeSappUsersApi.isLoading ||
                   getBlockedContactsApi.isLoading;
  
  // État global d'erreur
  const error = connectionsApi.error || 
               createConnectionApi.error || 
               updateConnectionApi.error || 
               deleteConnectionApi.error ||
               searchApi.error ||
               getByCodeApi.error ||
               updateByCodeApi.error ||
               blockedApi.error ||
               blockUserApi.error ||
               unblockUserApi.error ||
               checkCodeApi.error ||
               fetchWeSappUsersApi.error ||
               getBlockedContactsApi.error;
  
  /**
   * Charger les connexions avec pagination
   */
  const loadConnections = useCallback(async (refresh = false): Promise<void> => {
    if (refresh) {
      connectionOffsetRef.current = 0;
      setHasMoreConnections(true);
    }
    
    if (!hasMoreConnections && !refresh) {
      return;
    }
    
    const params: PaginationParams = {
      limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
      offset: connectionOffsetRef.current,
    };
    
    const queryParams = new URLSearchParams({
      limit: params.limit!.toString(),
      offset: params.offset!.toString(),
    });
    
    const url = `${API_ENDPOINTS.CONNECTIONS.BASE}?${queryParams}`;
    const result = await connectionsApi.get(url);
    
    if (result) {
      if (refresh) {
        setConnections(result.results);
      } else {
        setConnections(prev => [...prev, ...result.results]);
      }
      
      connectionOffsetRef.current += result.results.length;
      setHasMoreConnections(!!result.next);
    }
  }, [connectionsApi, hasMoreConnections]);
  
  /**
   * Charger plus de connexions (pagination)
   */
  const loadMoreConnections = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMoreConnections) return;
    
    setIsLoadingMore(true);
    await loadConnections(false);
    setIsLoadingMore(false);
  }, [loadConnections, isLoadingMore, hasMoreConnections]);
  
  /**
   * Créer une nouvelle connexion
   */
  const createConnection = useCallback(async (payload: CreateConnectionPayload): Promise<void> => {
    if (!payload.we_sapp_code?.trim()) {
      throw new Error('Le code WeSapp est requis');
    }
    
    if (!payload.owner_we_sapp_code?.trim()) {
      throw new Error('Le código WeSapp du propriétaire est requis');
    }
    
    if (!payload.connection_name?.trim()) {
      throw new Error('Le nom de connexion est requis');
    }
    
    const result = await createConnectionApi.post(API_ENDPOINTS.CONNECTIONS.BASE, payload);
    
    if (result) {
      // Ajouter la nouvelle connexion au début de la liste
      setConnections(prev => [result, ...prev]);
    }
  }, [createConnectionApi]);
  
  /**
   * Mettre à jour une connexion
   */
  const updateConnection = useCallback(async (connectionId: string, payload: UpdateConnectionPayload): Promise<void> => {
    if (!connectionId) {
      throw new Error('L\'ID de connexion est requis');
    }
    
    const url = `${API_ENDPOINTS.CONNECTIONS.BASE}${connectionId}/`;
    const result = await updateConnectionApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour la connexion dans la liste locale
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, ...result } : conn
      ));
    }
  }, [updateConnectionApi]);
  
  /**
   * Supprimer une connexion
   */
  const deleteConnection = useCallback(async (connectionId: string): Promise<void> => {
    if (!connectionId) {
      throw new Error('L\'ID de connexion est requis');
    }
    
    const url = `${API_ENDPOINTS.CONNECTIONS.BASE}${connectionId}/`;
    const result = await deleteConnectionApi.delete(url);
    
    if (result !== null) { // Succès de suppression
      // Supprimer la connexion de la liste locale
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    }
  }, [deleteConnectionApi]);
  
  /**
   * Rechercher des utilisateurs par numéro de téléphone
   */
  const searchByPhone = useCallback(async (phoneNumber: string): Promise<WeSappCode[]> => {
    if (!phoneNumber?.trim()) {
      throw new Error('Le numéro de téléphone est requis');
    }
    
    // Validation du format du numéro de téléphone
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Format de numéro de téléphone invalide. Utilisez le format international (+225...)');
    }
    
    const queryParams = new URLSearchParams({
      phone: phoneNumber,
    });
    
    const url = `${API_ENDPOINTS.USERS.SEARCH_BY_PHONE}?${queryParams}`;
    const result = await searchApi.get(url);
    
    if (result) {
      setSearchResults(result);
      return result;
    }
    
    return [];
  }, [searchApi]);
  
  /**
   * Récupérer une connexion par code WeSapp
   */
  const getConnectionByCode = useCallback(async (code: string): Promise<UserConnection | null> => {
    if (!code?.trim()) {
      throw new Error('Le code WeSapp est requis');
    }
    
    const queryParams = new URLSearchParams({
      code: code,
    });
    
    const url = `${API_ENDPOINTS.CONNECTIONS.GET_BY_CODE}?${queryParams}`;
    return await getByCodeApi.get(url);
  }, [getByCodeApi]);
  
  /**
   * Mettre à jour les connexions par code WeSapp
   */
  const updateConnectionByCode = useCallback(async (code: string, payload: UpdateConnectionPayload): Promise<void> => {
    if (!code?.trim()) {
      throw new Error('Le code WeSapp est requis');
    }
    
    const queryParams = new URLSearchParams({
      code: code,
    });
    
    const url = `${API_ENDPOINTS.CONNECTIONS.UPDATE_BY_CODE}?${queryParams}`;
    const result = await updateByCodeApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour les connexions correspondant au code
      setConnections(prev => prev.map(conn => 
        conn.we_sapp_code === code ? { ...conn, ...result } : conn
      ));
    }
  }, [updateByCodeApi]);
  
  /**
   * Charger les utilisateurs bloqués
   */
  const loadBlockedUsers = useCallback(async (): Promise<void> => {
    const result = await blockedApi.get(API_ENDPOINTS.BLOCKED.BASE);
    
    if (result) {
      setBlockedUsers(result.results);
    }
  }, [blockedApi]);
  
  /**
   * Bloquer un utilisateur
   */
  const blockUser = useCallback(async (payload: BlockUserPayload): Promise<void> => {
    if (!payload.we_sapp_code_id || !payload.blocked_we_sapp_code_id) {
      throw new Error('Les IDs des codes WeSapp sont requis');
    }
    
    const result = await blockUserApi.post(API_ENDPOINTS.BLOCKED.BASE, payload);
    
    if (result) {
      // Ajouter à la liste des utilisateurs bloqués
      setBlockedUsers(prev => [result, ...prev]);
      
      // Marquer la connexion comme bloquée si elle existe
      setConnections(prev => prev.map(conn => 
        conn.we_sapp_code_details.id === payload.blocked_we_sapp_code_id 
          ? { ...conn, blocked: true } 
          : conn
      ));
    }
  }, [blockUserApi]);
  
  /**
   * Débloquer un utilisateur
   */
  const unblockUser = useCallback(async (blockedUserId: string): Promise<void> => {
    if (!blockedUserId) {
      throw new Error('L\'ID de l\'utilisateur bloqué est requis');
    }
    
    const url = `${API_ENDPOINTS.BLOCKED.BASE}${blockedUserId}/`;
    const result = await unblockUserApi.delete(url);
    
    if (result !== null) { // Succès de suppression
      // Supprimer de la liste des utilisateurs bloqués
      setBlockedUsers(prev => prev.filter(blocked => blocked.id !== blockedUserId));
      
      // Démarquer la connexion comme débloquée si elle existe
      const blockedUser = blockedUsers.find(bu => bu.id === blockedUserId);
      if (blockedUser) {
        setConnections(prev => prev.map(conn => 
          conn.we_sapp_code_details.id === blockedUser.blocked_we_sapp_code.id 
            ? { ...conn, blocked: false } 
            : conn
        ));
      }
    }
  }, [unblockUserApi, blockedUsers]);
  
  /**
   * Vérifier si un utilisateur est bloqué
   */
  const checkIfBlocked = useCallback(async (weSappCodeId: string): Promise<boolean> => {
    if (!weSappCodeId) {
      return false;
    }
    
    const queryParams = new URLSearchParams({
      we_sapp_code_id: weSappCodeId,
    });
    
    const url = `${API_ENDPOINTS.BLOCKED.IS_BLOCKED}?${queryParams}`;
    const result = await isBlockedApi.get(url);
    
    return !!result;
  }, [isBlockedApi]);
  
  /**
   * Vérifier un code WeSapp (inspiré de l'API existante)
   */
  const checkCode = useCallback(async (code: string): Promise<WeSappCode | null> => {
    if (!code?.trim()) {
      throw new Error('Code WeSapp requis');
    }
    
    try {
      const url = `${API_ENDPOINTS.USERS.GET_BY_CODE}?code=${code}`;
      const result = await checkCodeApi.get(url);
      return result;
    } catch (error) {
      console.error('Erreur lors de la vérification du code WeSapp:', error);
      return null;
    }
  }, [checkCodeApi]);
  
  /**
   * Récupérer tous les utilisateurs WeSapp (inspiré de l'API existante)
   */
  const fetchWeSappUsers = useCallback(async (): Promise<WeSappCode[]> => {
    try {
      const result = await fetchWeSappUsersApi.get(API_ENDPOINTS.USERS.WE_SAPP_CODES);
      return result?.results || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs WeSapp:', error);
      throw error;
    }
  }, [fetchWeSappUsersApi]);
  
  /**
   * Récupérer les contacts bloqués par code (inspiré de l'API existante)
   */
  const getBlockedContacts = useCallback(async (code: string): Promise<WesappUserBlocked[]> => {
    if (!code?.trim()) {
      throw new Error('Code WeSapp requis');
    }
    
    try {
      const url = `${API_ENDPOINTS.BLOCKED.GET_BLOCKED_CONTACTS}${code}/`;
      const result = await getBlockedContactsApi.get(url);
      return result || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts bloqués:', error);
      throw error;
    }
  }, [getBlockedContactsApi]);
  
  /**
   * Bloquer un utilisateur (amélioré selon l'API existante)
   */
  const blockUserImproved = useCallback(async (weSappCodeId: string, blockedWeSappCodeId: string): Promise<void> => {
    if (!weSappCodeId || !blockedWeSappCodeId) {
      throw new Error('Les deux IDs sont requis pour bloquer un utilisateur.');
    }
    
    try {
      const payload = {
        we_sapp_code_id: weSappCodeId,
        blocked_we_sapp_code_id: blockedWeSappCodeId,
      };
      
      const result = await blockUserApi.post(API_ENDPOINTS.BLOCKED.BLOCK_USER, payload);
      
      if (result) {
        // Ajouter à la liste des utilisateurs bloqués
        setBlockedUsers(prev => [...prev, result]);
        
        // Marquer la connexion comme bloquée
        setConnections(prev => prev.map(conn => 
          conn.we_sapp_code_details.id === blockedWeSappCodeId 
            ? { ...conn, blocked: true } 
            : conn
        ));
      }
    } catch (error: any) {
      console.error('Erreur lors du blocage :', error?.response?.data || error.message);
      throw error;
    }
  }, [blockUserApi]);
  
  /**
   * Débloquer un utilisateur (amélioré selon l'API existante)
   */
  const unblockUserImproved = useCallback(async (weSappCodeId: string, blockedWeSappCodeId: string): Promise<void> => {
    if (!weSappCodeId || !blockedWeSappCodeId) {
      throw new Error('Les deux IDs sont requis pour débloquer un utilisateur.');
    }
    
    try {
      const params = {
        we_sapp_code: weSappCodeId,
        blocked_code: blockedWeSappCodeId,
      };
      
      const queryParams = new URLSearchParams(params);
      const url = `${API_ENDPOINTS.BLOCKED.UNBLOCK}?${queryParams}`;
      
      const result = await unblockUserApi.delete(url);
      
      if (result !== null) {
        // Supprimer de la liste des utilisateurs bloqués
        setBlockedUsers(prev => prev.filter(blocked => 
          blocked.blocked_we_sapp_code.id !== blockedWeSappCodeId
        ));
        
        // Démarquer la connexion comme débloquée
        setConnections(prev => prev.map(conn => 
          conn.we_sapp_code_details.id === blockedWeSappCodeId 
            ? { ...conn, blocked: false } 
            : conn
        ));
      }
    } catch (error: any) {
      console.error('Erreur lors du déblocage :', error?.response?.data || error.message);
      throw error;
    }
  }, [unblockUserApi]);
  
  /**
   * Supprimer une connexion (inspiré de l'API existante)
   */
  const deleteConnectionImproved = useCallback(async (connectionId: string): Promise<void> => {
    if (!connectionId?.trim()) {
      throw new Error('L\'ID de la connexion est requis pour supprimer une connexion.');
    }
    
    try {
      const url = `${API_ENDPOINTS.CONNECTIONS.DELETE_CONNECTION}${connectionId}/`;
      const result = await deleteConnectionApi.delete(url);
      
      if (result !== null) {
        // Supprimer de la liste des connexions
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
        return;
      }
      
      throw new Error('Échec de la suppression de la connexion');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la connexion :', error?.response?.data || error.message);
      throw error;
    }
  }, [deleteConnectionApi]);
  
  /**
   * Fonctions utilitaires
   */
  const addToFavorites = useCallback(async (connectionId: string): Promise<void> => {
    await updateConnection(connectionId, { 
      tags: { favorite: true } 
    });
  }, [updateConnection]);
  
  const removeFromFavorites = useCallback(async (connectionId: string): Promise<void> => {
    await updateConnection(connectionId, { 
      tags: { favorite: false } 
    });
  }, [updateConnection]);
  
  const muteConnection = useCallback(async (connectionId: string, muteUntil?: string): Promise<void> => {
    const mutedUntil = muteUntil || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h par défaut
    await updateConnection(connectionId, { muted_until: mutedUntil });
  }, [updateConnection]);
  
  const unmuteConnection = useCallback(async (connectionId: string): Promise<void> => {
    await updateConnection(connectionId, { muted_until: null });
  }, [updateConnection]);
  
  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadConnections(true),
      includeBlocked ? loadBlockedUsers() : Promise.resolve(),
    ]);
  }, [loadConnections, loadBlockedUsers, includeBlocked]);
  
  /**
   * Recherche locale dans les connexions
   */
  const searchConnections = useCallback((query: string): UserConnection[] => {
    if (!query.trim()) {
      return connections;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return connections.filter(conn => 
      conn.connection_name.toLowerCase().includes(lowercaseQuery) ||
      conn.nickname.toLowerCase().includes(lowercaseQuery) ||
      conn.we_sapp_code_details.username.toLowerCase().includes(lowercaseQuery) ||
      conn.we_sapp_code_details.code.toLowerCase().includes(lowercaseQuery)
    );
  }, [connections]);
  
  /**
   * Obtenir les connexions par catégorie
   */
  const getFavoriteConnections = useCallback((): UserConnection[] => {
    return connections.filter(conn => conn.tags?.favorite === true);
  }, [connections]);
  
  const getMutedConnections = useCallback((): UserConnection[] => {
    const now = new Date();
    return connections.filter(conn => 
      conn.muted_until && new Date(conn.muted_until) > now
    );
  }, [connections]);
  
  const getBlockedConnections = useCallback((): UserConnection[] => {
    return connections.filter(conn => conn.blocked);
  }, [connections]);
  
  // Auto-load au montage si demandé
  useEffect(() => {
    if (autoLoad) {
      loadConnections(true);
      if (includeBlocked) {
        loadBlockedUsers();
      }
    }
  }, [autoLoad, includeBlocked, loadConnections, loadBlockedUsers]);
  
  return {
    // États
    connections,
    blockedUsers,
    searchResults,
    isLoading,
    error,
    
    // Pagination
    isLoadingMore,
    hasMoreConnections,
    
    // Actions principales
    loadConnections,
    loadMoreConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    searchByPhone,
    getConnectionByCode,
    updateConnectionByCode,
    
    // Gestion des blocages
    loadBlockedUsers,
    blockUser,
    unblockUser,
    checkIfBlocked,
    
    // Nouvelles fonctions harmonisées avec l'API existante
    checkCode,
    fetchWeSappUsers,
    getBlockedContacts,
    blockUserImproved,
    unblockUserImproved,
    deleteConnectionImproved,
    
    // Actions utilitaires
    addToFavorites,
    removeFromFavorites,
    muteConnection,
    unmuteConnection,
    searchConnections,
    getFavoriteConnections,
    getMutedConnections,
    getBlockedConnections,
    refresh,
  };
};

export default useContacts;