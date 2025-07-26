/**
 * Types TypeScript pour l'API WeSapp
 * 
 * Ce fichier contient tous les types basés sur les schémas de api-doc.yaml
 * et les types pour la gestion d'état des hooks.
 */

import { MESSAGE_TYPES } from './constants';

// ============================================================================
// TYPES DE BASE POUR LES HOOKS
// ============================================================================

export interface UseApiState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// TYPES D'AUTHENTIFICATION
// ============================================================================

export interface RequestOTPPayload {
  phone_number: string;
  country_code: string;
}

export interface VerifyOTPPayload {
  phone_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  isNewUser: boolean;
  user?: User;
  pendingUserId?: string;
  token?: string;
}
export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface CreateProfilePayload {
  username: string;
  profile_photo?: string;
  bio?: string;
  label?: string;
}

// ============================================================================
// TYPES UTILISATEUR
// ============================================================================


export interface VerifyOTPAPIResponse {
  existing_user?: boolean;
  pending_user_id?: string | null;
  message?: string;
  token?: string;
  user?: {
    id?: string;
    user_id?: string;
    phone_number?: string;
    status?: string;
    last_seen?: string | null;
    is_online?: boolean;
    device_tokens?: string[];
    language?: string;
    country_code?: string;
    verified_at?: string;
    is_signup_confirm?: boolean;
    created_at?: string;
    updated_at?: string;
    username?: string;
    profile_photo?: string;
  };
}

export interface User {
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
export interface WeSappCode {
  id: string;
  user: User;
  code: string;
  is_active: boolean;
  is_default: boolean;
  bio: string;
  label: string;
  profile_photo: string;
  profile_image?: string; // Alias pour compatibilité
  avatar?: string; // Alias pour compatibilité
  username: string;
  created_at: string;
  updated_at: string;
  is_premium: boolean | null;
  unread_messages: number | null;
}

export interface UserSettings {
  id: string;
  user: string;
  theme: string;
  notifications: Record<string, any>;
  privacy: Record<string, any>;
  language: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TYPES DE MESSAGES ET CONVERSATIONS
// ============================================================================

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface MessageLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface MessageContact {
  name: string;
  phoneNumber: string;
  avatar?: string;
}

export interface MessageDocument {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: WeSappCode;
  content: string;
  message_type: MessageType;
  reply?: string;
  timestamp: string;
  is_read: boolean;
  read_by: Record<string, any>;
  is_edited: boolean;
  mentions: Record<string, any>;
  edited_at: string | null;
  expires_at: string | null;
  location_id: string | null;
  media_url: string | null;
  reactions: Record<string, any>;
  hidden_for: Record<string, any>;
  
  // Types étendus pour l'interface
  isOwn?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  videoUrl?: string;
  videoDuration?: number;
  videoThumbnail?: string;
  document?: MessageDocument;
  contact?: MessageContact;
  location?: MessageLocation;
  replyTo?: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: WeSappCode[];
  is_group: boolean;
  messages: Message[];
  group: string;
  created_at: string;
  updated_at: string;
}

export interface SendMessagePayload {
  conversation: string;
  content: string;
  type: string;
  reply_to_id?: string | null;
  media_url?: string;
  location_id?: string;
  sender_id: string;
  sender_code?: string;
  sender_username?: string;
  sender_profile_photo?: string;
  file?: string;
}

export interface UpdateMessagePayload {
  content?: string;
  is_read?: boolean;
  reactions?: Record<string, any>;
  is_edited?: boolean;
}

// ============================================================================
// TYPES DE CONNEXIONS
// ============================================================================

export interface UserConnection {
  id: string;
  connection_id: string;
  user: string;
  we_sapp_code: string;
  owner_we_sapp_code: string;
  connection_name: string;
  blocked: boolean;
  muted_until: string | null;
  nickname: string;
  tags: Record<string, any>;
  created_at: string;
  updated_at: string;
  we_sapp_code_details: WeSappCode;
  owner_we_sapp_code_details: WeSappCode;
}

export interface CreateConnectionPayload {
  we_sapp_code: string;
  owner_we_sapp_code: string;
  connection_name: string;
  nickname?: string;
  tags?: Record<string, any>;
}

export interface UpdateConnectionPayload {
  connection_name?: string;
  blocked?: boolean;
  muted_until?: string | null;
  nickname?: string;
  tags?: Record<string, any>;
}

// ============================================================================
// TYPES DE GROUPES
// ============================================================================

export interface Group {
  id: string;
  name: string;
  description: string;
  members: WeSappCode[];
  admin: WeSappCode;
  profile_photo: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  profile_photo?: string | null;
  member_ids?: string[];
  members?: string[];
  admin?: string;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  profile_photo?: string;
}

export interface GroupMemberPayload {
  member_ids: string[];
}

// ============================================================================
// TYPES DE BLOCAGE
// ============================================================================

export interface WesappUserBlocked {
  id: string;
  we_sapp_code: WeSappCode;
  blocked_we_sapp_code: WeSappCode;
  we_sapp_code_id: string;
  blocked_we_sapp_code_id: string;
}

export interface BlockUserPayload {
  we_sapp_code_id: string;
  blocked_we_sapp_code_id: string;
}

// ============================================================================
// TYPES D'APPELS
// ============================================================================

export interface StartCallPayload {
  recipient_id: number;
  call_type: 'video' | 'audio';
  we_sapp_code: string;
}

export interface CallTokenPayload {
  channel: string;
  recipient_id: number;
  call_type: 'video' | 'audio';
}

// ============================================================================
// TYPES D'ERREUR ET RÉPONSE API
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
  success: boolean;
}

// ============================================================================
// TYPES POUR LES HOOKS SPÉCIALISÉS
// ============================================================================

// Hook d'authentification
export interface UseAuthReturn {
  // États
  user: WeSappCode | null;
  currentUser: WeSappCode | null;
  profile: WeSappCode | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestOTP: (phoneNumber: string, countryCode?: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otpCode: string) => Promise<void>;
  createProfile: (profileData: CreateProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Hook de messages
export interface UseMessagesReturn {
  // États
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  isLoadingMore: boolean;
  hasMoreConversations: boolean;
  hasMoreMessages: boolean;
  
  // Actions principales
  loadConversations: (refresh?: boolean) => Promise<void>;
  loadMessages: (conversationId: string, refresh?: boolean) => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  updateMessage: (messageId: string, payload: UpdateMessagePayload) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<void>;
  
  // Actions utilitaires
  checkExistingConversation: (participantIds: string[]) => Promise<Conversation | null>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Nouvelles fonctions harmonisées avec l'API existante
  checkExistingConversationImproved: (participantIds: string[]) => Promise<Conversation | null>;
  getOrCreateConversation: (participantIds: string[]) => Promise<Conversation>;
  getConversationById: (codeWeSapp: string) => Promise<void>;
  getConversationWithMessages: (conversationId: string) => Promise<any>;
  getMessagesByConversationId: (conversationId: string, page?: number, pageSize?: number) => Promise<any>;
  setReplyToMessage: (messageId: string) => Promise<Message[]>;
  setReaction: (messageId: string, reaction: string) => Promise<Message[]>;
  createGroupConversation: (memberCodeIds: string[], groupName: string, currentCodeId: string, groupPhoto?: string | null) => Promise<any>;
  fetchConversationById: (conversationId: string, currentCode: string) => Promise<any>;
  
  // État de la conversation courante
  currentConversationId: string | null;
}

// Hook de contacts
export interface UseContactsReturn {
  // États
  connections: UserConnection[];
  blockedUsers: WesappUserBlocked[];
  searchResults: WeSappCode[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  isLoadingMore: boolean;
  hasMoreConnections: boolean;
  
  // Actions principales
  loadConnections: (refresh?: boolean) => Promise<void>;
  loadMoreConnections: () => Promise<void>;
  createConnection: (payload: CreateConnectionPayload) => Promise<void>;
  updateConnection: (connectionId: string, payload: UpdateConnectionPayload) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  searchByPhone: (phoneNumber: string) => Promise<WeSappCode[]>;
  getConnectionByCode: (code: string) => Promise<UserConnection | null>;
  updateConnectionByCode: (code: string, payload: UpdateConnectionPayload) => Promise<void>;
  
  // Gestion des blocages
  loadBlockedUsers: () => Promise<void>;
  blockUser: (payload: BlockUserPayload) => Promise<void>;
  unblockUser: (blockedUserId: string) => Promise<void>;
  checkIfBlocked: (weSappCodeId: string) => Promise<boolean>;
  
  // Nouvelles fonctions harmonisées avec l'API existante
  checkCode: (code: string) => Promise<WeSappCode | null>;
  fetchWeSappUsers: () => Promise<WeSappCode[]>;
  getBlockedContacts: (code: string) => Promise<WesappUserBlocked[]>;
  blockUserImproved: (weSappCodeId: string, blockedWeSappCodeId: string) => Promise<void>;
  unblockUserImproved: (weSappCodeId: string, blockedWeSappCodeId: string) => Promise<void>;
  deleteConnectionImproved: (connectionId: string) => Promise<void>;
  
  // Actions utilitaires
  addToFavorites: (connectionId: string) => Promise<void>;
  removeFromFavorites: (connectionId: string) => Promise<void>;
  muteConnection: (connectionId: string, muteUntil?: string) => Promise<void>;
  unmuteConnection: (connectionId: string) => Promise<void>;
  searchConnections: (query: string) => UserConnection[];
  getFavoriteConnections: () => UserConnection[];
  getMutedConnections: () => UserConnection[];
  getBlockedConnections: () => UserConnection[];
  refresh: () => Promise<void>;
}

// Hook de profil
export interface UseProfileReturn {
  // États
  profile: WeSappCode | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProfile: (userData?: User | null, index?: number) => Promise<void>;
  updateProfile: (payload: Partial<WeSappCode>) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (payload: Partial<UserSettings>) => Promise<void>;
}

// Hook de groupes
export interface UseGroupsReturn {
  // États
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: WeSappCode[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  isLoadingMore: boolean;
  hasMoreGroups: boolean;
  
  // Actions principales
  loadGroups: (refresh?: boolean) => Promise<void>;
  loadMoreGroups: () => Promise<void>;
  getGroup: (groupId: string) => Promise<Group | null>;
  createGroup: (payload: CreateGroupPayload) => Promise<Group>;
  updateGroup: (groupId: string, payload: UpdateGroupPayload) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  // Gestion des membres
  addMembers: (groupId: string, memberIds: string[]) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupMembers: (groupId: string) => Promise<WeSappCode[]>;
  
  // Nouvelles fonctions harmonisées avec l'API existante
  createGroupImproved: (name: string, description: string, members: string[], admin: string, profilePhoto?: string) => Promise<Group>;
  updateGroupImproved: (id: string, name?: string, description?: string, members?: string[], admin?: string, profilePhoto?: string) => Promise<Group>;
  addMembersToGroupImproved: (id: string, members: string[], conversationId: string) => Promise<Group>;
  deleteGroupImproved: (id: string) => Promise<void>;
  leaveGroupImproved: (groupId: string, conversationId: string, code: string) => Promise<any>;
  removeMemberFromGroupImproved: (groupId: string, conversationId: string, memberId: string) => Promise<any>;
  getGroupByIdImproved: (id: string, code: string) => Promise<Group>;
  
  // Fonctions utilitaires
  isUserAdmin: (group: Group, userId: string) => boolean;
  isUserMember: (group: Group, userId: string) => boolean;
  getMemberCount: (group: Group) => number;
  getGroupsByAdmin: (adminId: string) => Group[];
  searchGroups: (query: string) => Group[];
  
  // Mises à jour rapides
  updateGroupName: (groupId: string, name: string) => Promise<void>;
  updateGroupDescription: (groupId: string, description: string) => Promise<void>;
  updateGroupPhoto: (groupId: string, profilePhoto: string) => Promise<void>;
  
  // Gestion des permissions
  canEditGroup: (group: Group, userId: string) => boolean;
  canAddMembers: (group: Group, userId: string) => boolean;
  canRemoveMembers: (group: Group, userId: string) => boolean;
  canDeleteGroup: (group: Group, userId: string) => boolean;
  
  // Statistiques
  getTotalGroupsCount: () => number;
  getAdminGroupsCount: (adminId: string) => number;
  getTotalMembersCount: () => number;
  
  // Actions générales
  refresh: () => Promise<void>;
}

export interface WebSocketAction {
  action: "send_message"  | 'send_file' | 'mark_message_as_read' | 'delete_message';
}