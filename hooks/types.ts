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
}

export interface VerifyOTPPayload {
  phone_number: string;
  otp_code: string;
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

export interface User {
  id: string;
  user_id: string;
  phone_number: string;
  status: string;
  last_seen: string | null;
  is_online: boolean;
  device_tokens: Record<string, any>;
  language: string;
  country_code: string;
  verified_at: string | null;
  is_signup_confirm: boolean;
  created_at: string;
  updated_at: string;
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
  message_type: MessageType;
  reply_to?: string;
  media_url?: string;
  location_id?: string;
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
  profile_photo?: string;
  member_ids?: string[];
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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestOTP: (phoneNumber: string) => Promise<void>;
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
  
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  updateMessage: (messageId: string, payload: UpdateMessagePayload) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<void>;
}

// Hook de contacts
export interface UseContactsReturn {
  // États
  connections: UserConnection[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadConnections: () => Promise<void>;
  createConnection: (payload: CreateConnectionPayload) => Promise<void>;
  updateConnection: (connectionId: string, payload: UpdateConnectionPayload) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  searchByPhone: (phoneNumber: string) => Promise<WeSappCode[]>;
  getConnectionByCode: (code: string) => Promise<UserConnection>;
}

// Hook de profil
export interface UseProfileReturn {
  // États
  profile: WeSappCode | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (payload: Partial<WeSappCode>) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (payload: Partial<UserSettings>) => Promise<void>;
}

// Hook de groupes
export interface UseGroupsReturn {
  // États
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadGroups: () => Promise<void>;
  createGroup: (payload: CreateGroupPayload) => Promise<void>;
  updateGroup: (groupId: string, payload: UpdateGroupPayload) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMembers: (groupId: string, memberIds: string[]) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
}