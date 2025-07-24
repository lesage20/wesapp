export interface User {
    id: string;
    username: string;
    phone_number: string;
    device_tokens: string[];
  }
  
  // export interface WeSappCode {
  //   id: string;
  //   code: string;
  //   bio: string;
  //   profile_photo: string;
  //   username: string;
  // }
  
  export interface UserConnection {
    id: string;
    connection_id: string;
    connection_name: string;
    we_sapp_code: WeSappCode;
    owner_we_sapp_code: WeSappCode;
    blocked: boolean;
    muted_until: string | null;
    nickname: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  }
  
  export interface GroupWesapp {
    id: string;
    name: string;
    description: string;
    members: WeSappCode[];
    admin: WeSappCode;
    profile_photo: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AuthResponse {
    token: string;
  }

  export interface VerifyOtpResponse {
    token: string;
    existing_user: boolean;
    pending_user_id?: string;
    message?: string;
    // Champ user_data (pour compatibilitu00e9)
    user_data?: {
      id: string;
      username: string;
      phoneNumber: string;
      profilePhoto?: string;
      countryCode?: string;
      isOnline?: boolean;
      lastSeen?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    // Nouveau champ user retournu00e9 par l'API
    user?: {
      id: string;
      user_id: string;
      phone_number: string;
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
      // Autres propriu00e9tu00e9s possibles
      [key: string]: any;
    };
  }

  // export interface WeSappUserInfo {
  //   id: string;
  //   user_id: string;
  //   phone_number: string;
  //   status?: string;
  //   last_seen?: string | null;
  //   is_online?: boolean;
  //   device_tokens?: string[];
  //   language?: string;
  //   country_code?: string;
  //   verified_at?: string;
  //   is_signup_confirm?: boolean;
  //   created_at?: string;
  //   updated_at?: string;
  //   [key: string]: any;
  // }

  // export interface WeSappCode {
  //   id: string;
  //   code: string;
  //   username: string;
  //   bio: string;
  //   label: string;
  //   profile_photo: string;
  //   is_active: boolean;
  //   is_default: boolean;
  //   // Nouveaux champs retournés par l'API
  //   user?: WeSappUserInfo;
  //   created_at?: string;
  //   updated_at?: string;
  // }

export interface WeSappUser {
  id: string;
  user_id: string;
  phone_number: string;
  status: string;
  last_seen: string | null;
  is_online: boolean;
  device_tokens: string[];
  language: string;
  country_code: string;
  verified_at: string;
  is_signup_confirm: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeSappCode {
  id: string;
  user: WeSappUser;
  code: string;
  is_active: boolean;
  is_default: boolean;
  bio: string;
  label: string;
  profile_photo: string;
  username: string;
  is_premium: string;
  created_at: string;
  updated_at: string;
  unread_messages: number;
}

// Modèle pour les participants d'une conversation
export interface ConversationParticipant {
  id: string;
  user: WeSappUser;
  code: string;
  is_active: boolean;
  is_default: boolean;
  bio: string;
  label: string;
  profile_photo: string;
  username: string;
  created_at: string;
  updated_at: string;
}

// Modèle pour une conversation WeSapp avec ses participants
export interface ConversationWesapp {
  id: string;
  participants: ConversationParticipant[];
  created_at: string;
  updated_at: string;
}

// Modèle pour un message dans une conversation
export interface MessageWesapp {
  id: string;
  conversation: string;
  sender: ConversationParticipant;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface Messages {
  id: string;
  type: string;
  status: string;
  readBy: string[];
  content: string;
  isEdited: boolean;
  mentions: string[];
  editedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  locationId: string | null;
  conversationId: string;
  senderWeSappCodeId: string;
  mediaUrl?: string | null;
  reactions?: string[] | null;
  is_read?: boolean;
  loadingMedia?: boolean;
  reply?: {
    message: string;
    mediaUrl?: string | null;
  };
  hiddenFor?: string[];
  sender?: {
    code?: string;
    username?: string;
    profilePhoto?: string;
  };
}

// Modèle pour la réponse paginée des messages
export interface MessageResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MessageWesapp[];
}