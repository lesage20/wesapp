/**
 * Hook pour la gestion des groupes
 * 
 * Gère la création, modification, suppression des groupes,
 * l'ajout/suppression de membres et l'administration des groupes.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../useApi';
import { 
  API_ENDPOINTS, 
  PAGINATION_CONFIG,
  SUCCESS_MESSAGES,
} from '../constants';
import {
  UseGroupsReturn,
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  GroupMemberPayload,
  WeSappCode,
  PaginatedResponse,
  PaginationParams
} from '../types';

interface UseGroupsOptions {
  autoLoad?: boolean;
  userId?: string;
}

export const useGroups = (options: UseGroupsOptions = {}): UseGroupsReturn => {
  const { autoLoad = false, userId } = options;
  
  // États locaux
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<WeSappCode[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  
  // Pagination
  const groupOffsetRef = useRef(0);
  
  // Hooks API spécialisés
  const groupsApi = useApi<PaginatedResponse<Group>>({ showToast: false });
  const createGroupApi = useApi<Group>({ showToast: true });
  const getGroupApi = useApi<Group>({ showToast: false });
  const updateGroupApi = useApi<Group>({ showToast: true });
  const deleteGroupApi = useApi({ showToast: true });
  const addMembersApi = useApi<Group>({ showToast: true });
  const removeMemberApi = useApi<Group>({ showToast: true });
  const leaveGroupApi = useApi<Group>({ showToast: true });
  const getMembersApi = useApi<Group>({ showToast: false });
  
  // État global de loading
  const isLoading = groupsApi.isLoading || 
                   createGroupApi.isLoading || 
                   getGroupApi.isLoading ||
                   updateGroupApi.isLoading || 
                   deleteGroupApi.isLoading ||
                   addMembersApi.isLoading ||
                   removeMemberApi.isLoading ||
                   leaveGroupApi.isLoading ||
                   getMembersApi.isLoading;
  
  // État global d'erreur
  const error = groupsApi.error || 
               createGroupApi.error || 
               getGroupApi.error ||
               updateGroupApi.error || 
               deleteGroupApi.error ||
               addMembersApi.error ||
               removeMemberApi.error ||
               leaveGroupApi.error ||
               getMembersApi.error;
  
  /**
   * Charger les groupes avec pagination
   */
  const loadGroups = useCallback(async (refresh = false): Promise<void> => {
    if (refresh) {
      groupOffsetRef.current = 0;
      setHasMoreGroups(true);
    }
    
    if (!hasMoreGroups && !refresh) {
      return;
    }
    
    const params: PaginationParams = {
      limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
      offset: groupOffsetRef.current,
    };
    
    const queryParams = new URLSearchParams({
      limit: params.limit!.toString(),
      offset: params.offset!.toString(),
    });
    
    // Ajouter le filtre utilisateur si fourni
    if (userId) {
      queryParams.append('user_id', userId);
    }
    
    const url = `${API_ENDPOINTS.GROUPS.BASE}?${queryParams}`;
    const result = await groupsApi.get(url);
    
    if (result) {
      if (refresh) {
        setGroups(result.results);
      } else {
        setGroups(prev => [...prev, ...result.results]);
      }
      
      groupOffsetRef.current += result.results.length;
      setHasMoreGroups(!!result.next);
    }
  }, [groupsApi, hasMoreGroups, userId]);
  
  /**
   * Charger plus de groupes (pagination)
   */
  const loadMoreGroups = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMoreGroups) return;
    
    setIsLoadingMore(true);
    await loadGroups(false);
    setIsLoadingMore(false);
  }, [loadGroups, isLoadingMore, hasMoreGroups]);
  
  /**
   * Récupérer un groupe spécifique
   */
  const getGroup = useCallback(async (groupId: string): Promise<Group | null> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    const url = `${API_ENDPOINTS.GROUPS.BASE}${groupId}/`;
    const result = await getGroupApi.get(url);
    
    if (result) {
      setCurrentGroup(result);
      return result;
    }
    
    return null;
  }, [getGroupApi]);
  
  /**
   * Créer un nouveau groupe
   */
  const createGroup = useCallback(async (payload: CreateGroupPayload): Promise<void> => {
    if (!payload.name?.trim()) {
      throw new Error('Le nom du groupe est requis');
    }
    
    if (payload.name.length < 2) {
      throw new Error('Le nom du groupe doit contenir au moins 2 caractères');
    }
    
    if (payload.name.length > 100) {
      throw new Error('Le nom du groupe ne peut pas dépasser 100 caractères');
    }
    
    if (payload.description && payload.description.length > 500) {
      throw new Error('La description ne peut pas dépasser 500 caractères');
    }
    
    const result = await createGroupApi.post(API_ENDPOINTS.GROUPS.BASE, payload);
    
    if (result) {
      // Ajouter le nouveau groupe au début de la liste
      setGroups(prev => [result, ...prev]);
      setCurrentGroup(result);
    }
  }, [createGroupApi]);
  
  /**
   * Mettre à jour un groupe
   */
  const updateGroup = useCallback(async (groupId: string, payload: UpdateGroupPayload): Promise<void> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    // Validation des données
    if (payload.name && payload.name.length < 2) {
      throw new Error('Le nom du groupe doit contenir au moins 2 caractères');
    }
    
    if (payload.name && payload.name.length > 100) {
      throw new Error('Le nom du groupe ne peut pas dépasser 100 caractères');
    }
    
    if (payload.description && payload.description.length > 500) {
      throw new Error('La description ne peut pas dépasser 500 caractères');
    }
    
    const url = `${API_ENDPOINTS.GROUPS.BASE}${groupId}/`;
    const result = await updateGroupApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour le groupe dans la liste locale
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, ...result } : group
      ));
      
      // Mettre à jour le groupe courant si c'est celui qui a été modifié
      if (currentGroup?.id === groupId) {
        setCurrentGroup(result);
      }
    }
  }, [updateGroupApi, currentGroup?.id]);
  
  /**
   * Supprimer un groupe
   */
  const deleteGroup = useCallback(async (groupId: string): Promise<void> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    const url = `${API_ENDPOINTS.GROUPS.BASE}${groupId}/`;
    const result = await deleteGroupApi.delete(url);
    
    if (result !== null) { // Succès de suppression
      // Supprimer le groupe de la liste locale
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      // Réinitialiser le groupe courant si c'est celui qui a été supprimé
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    }
  }, [deleteGroupApi, currentGroup?.id]);
  
  /**
   * Ajouter des membres au groupe
   */
  const addMembers = useCallback(async (groupId: string, memberIds: string[]): Promise<void> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    if (!memberIds || memberIds.length === 0) {
      throw new Error('Au moins un membre doit être ajouté');
    }
    
    const payload: GroupMemberPayload = {
      member_ids: memberIds,
    };
    
    const url = API_ENDPOINTS.GROUPS.ADD_MEMBERS(groupId);
    const result = await addMembersApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour le groupe dans la liste locale
      setGroups(prev => prev.map(group => 
        group.id === groupId ? result : group
      ));
      
      // Mettre à jour le groupe courant si c'est celui qui a été modifié
      if (currentGroup?.id === groupId) {
        setCurrentGroup(result);
      }
    }
  }, [addMembersApi, currentGroup?.id]);
  
  /**
   * Supprimer un membre du groupe
   */
  const removeMember = useCallback(async (groupId: string, memberId: string): Promise<void> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    if (!memberId) {
      throw new Error('ID du membre requis');
    }
    
    const payload: GroupMemberPayload = {
      member_ids: [memberId],
    };
    
    const url = API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId);
    const result = await removeMemberApi.patch(url, payload);
    
    if (result) {
      // Mettre à jour le groupe dans la liste locale
      setGroups(prev => prev.map(group => 
        group.id === groupId ? result : group
      ));
      
      // Mettre à jour le groupe courant si c'est celui qui a été modifié
      if (currentGroup?.id === groupId) {
        setCurrentGroup(result);
      }
    }
  }, [removeMemberApi, currentGroup?.id]);
  
  /**
   * Quitter un groupe
   */
  const leaveGroup = useCallback(async (groupId: string): Promise<void> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    const url = API_ENDPOINTS.GROUPS.LEAVE_GROUP(groupId);
    const result = await leaveGroupApi.post(url, {});
    
    if (result) {
      // Supprimer le groupe de la liste locale (l'utilisateur n'en fait plus partie)
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      // Réinitialiser le groupe courant si c'est celui qui a été quitté
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    }
  }, [leaveGroupApi, currentGroup?.id]);
  
  /**
   * Récupérer les membres d'un groupe
   */
  const getGroupMembers = useCallback(async (groupId: string): Promise<WeSappCode[]> => {
    if (!groupId) {
      throw new Error('ID du groupe requis');
    }
    
    const queryParams = new URLSearchParams({
      group_id: groupId,
    });
    
    const url = `${API_ENDPOINTS.GROUPS.GET_MEMBERS}?${queryParams}`;
    const result = await getMembersApi.get(url);
    
    if (result && result.members) {
      setGroupMembers(result.members);
      return result.members;
    }
    
    return [];
  }, [getMembersApi]);
  
  /**
   * Fonctions utilitaires
   */
  const isUserAdmin = useCallback((group: Group, userId: string): boolean => {
    return group.admin.id === userId;
  }, []);
  
  const isUserMember = useCallback((group: Group, userId: string): boolean => {
    return group.members.some(member => member.id === userId);
  }, []);
  
  const getMemberCount = useCallback((group: Group): number => {
    return group.members.length;
  }, []);
  
  const getGroupsByAdmin = useCallback((adminId: string): Group[] => {
    return groups.filter(group => group.admin.id === adminId);
  }, [groups]);
  
  const searchGroups = useCallback((query: string): Group[] => {
    if (!query.trim()) {
      return groups;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return groups.filter(group => 
      group.name.toLowerCase().includes(lowercaseQuery) ||
      group.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [groups]);
  
  /**
   * Fonctions de mise à jour rapide
   */
  const updateGroupName = useCallback(async (groupId: string, name: string): Promise<void> => {
    return updateGroup(groupId, { name });
  }, [updateGroup]);
  
  const updateGroupDescription = useCallback(async (groupId: string, description: string): Promise<void> => {
    return updateGroup(groupId, { description });
  }, [updateGroup]);
  
  const updateGroupPhoto = useCallback(async (groupId: string, profilePhoto: string): Promise<void> => {
    return updateGroup(groupId, { profile_photo: profilePhoto });
  }, [updateGroup]);
  
  /**
   * Gestion des permissions
   */
  const canEditGroup = useCallback((group: Group, userId: string): boolean => {
    return isUserAdmin(group, userId);
  }, [isUserAdmin]);
  
  const canAddMembers = useCallback((group: Group, userId: string): boolean => {
    return isUserAdmin(group, userId);
  }, [isUserAdmin]);
  
  const canRemoveMembers = useCallback((group: Group, userId: string): boolean => {
    return isUserAdmin(group, userId);
  }, [isUserAdmin]);
  
  const canDeleteGroup = useCallback((group: Group, userId: string): boolean => {
    return isUserAdmin(group, userId);
  }, [isUserAdmin]);
  
  /**
   * Statistiques des groupes
   */
  const getTotalGroupsCount = useCallback((): number => {
    return groups.length;
  }, [groups]);
  
  const getAdminGroupsCount = useCallback((adminId: string): number => {
    return getGroupsByAdmin(adminId).length;
  }, [getGroupsByAdmin]);
  
  const getTotalMembersCount = useCallback(): number => {
    return groups.reduce((total, group) => total + group.members.length, 0);
  }, [groups]);
  
  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadGroups(true);
    if (currentGroup) {
      await getGroup(currentGroup.id);
    }
  }, [loadGroups, getGroup, currentGroup]);
  
  // Auto-load au montage si demandé
  useEffect(() => {
    if (autoLoad) {
      loadGroups(true);
    }
  }, [autoLoad, loadGroups]);
  
  return {
    // États
    groups,
    currentGroup,
    groupMembers,
    isLoading,
    error,
    
    // Pagination
    isLoadingMore,
    hasMoreGroups,
    
    // Actions principales
    loadGroups,
    loadMoreGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Gestion des membres
    addMembers,
    removeMember,
    leaveGroup,
    getGroupMembers,
    
    // Fonctions utilitaires
    isUserAdmin,
    isUserMember,
    getMemberCount,
    getGroupsByAdmin,
    searchGroups,
    
    // Mises à jour rapides
    updateGroupName,
    updateGroupDescription,
    updateGroupPhoto,
    
    // Gestion des permissions
    canEditGroup,
    canAddMembers,
    canRemoveMembers,
    canDeleteGroup,
    
    // Statistiques
    getTotalGroupsCount,
    getAdminGroupsCount,
    getTotalMembersCount,
    
    // Actions générales
    refresh,
  };
};

export default useGroups;