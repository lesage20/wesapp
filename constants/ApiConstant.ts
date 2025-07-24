// URL réelle de votre API (actuellement inaccessible)
// export const API_BASE_URL = 'http://192.168.1.7:8090/api/';

// URL temporaire pour tester l'application sans serveur backend
export const API_BASE_URL = 'https://wesapp.waretrack.online/api/';
export const API_ENDPOINTS = {
  REQUEST_OTP: 'auth/request-otp/',
  VERIFY_OTP: 'auth/verify-otp/',
  SAVE_TOKEN: 'users/save-token/',
  CREATE_CONNECTION: 'connections/',
  // LIST_CONNECTIONS: 'connections/',
  CREATE_CONVERSATION: 'conversations/',
  GET_CONVERSATION_WITH_MESSAGES: 'conversations/get-one-conversation/?conversation_id=',
  GET_CONVERSATION_BY_ID: 'conversations/?code=',
  GET_MESSAGES_BY_CONVERSATION_ID: 'messages/?conversation_id=',
  CREATE_GROUP: 'groups/',
  CREATE_USER: 'users/create-profile/',
  SEARCH_WESAPP_CODE_BY_PHONE: 'users/we-sapp-codes/search-by-phone/?',
  GET_CONNECTIONS: 'connections/get-by-code/?code=',
  SET_REPLY_TO_MESSAGE: 'messages/set-reply-to-message/',
  SET_REACTION: 'messages/set-reaction/',
  GET_WESAPP_CODE: 'users/we-sapp-codes/get-by-code/?code=',
  UPDATE_GROUP: 'groups/',
  DELETE_GROUP: 'groups/',
  ADD_MEMBERS_TO_GROUP: 'groups/',
  GET_GROUPS: 'groups/get-group-members/?conversation_id=',
  GET_WESAPP_USERS: 'users/we-sapp-codes/',
  GET_OTHER_CONVERSATIONS_USER: 'conversations/get-other-conversations-user/?conversation_id=',
  BLOCK_USER: 'blocked/',
  UNBLOCK_USER: 'blocked/unblock/',
  DELETE_CONNECTION: 'connections/',
  GET_BLOCKED_CONTACTS: 'blocked/blocked-users/',
  UPDATE_CODE: 'users/we-sapp-codes/',
  CHECK_PREMIUM_CODE: 'users/we-sapp-codes/check-premium/?code=',
  CREATE_PREMIUM_USER: 'users/we-sapp-codes/create-premium-profile/',
  LEAVE_GROUP: 'groups/:id/leave-group/',
  REMOVE_MEMBER_FROM_GROUP: 'groups/:id/remove-member/',
};