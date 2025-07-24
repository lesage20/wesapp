import ApiClient from '../ApiClient';
import { API_ENDPOINTS } from '../../constants/ApiConstant';




export const updateCode = async (ownerWeSappCodeId?: string, username?: string, label?: string, bio?: string, profilePhoto?: string,unreadMessages?: number) => {
 
    if (!ownerWeSappCodeId) {
      throw new Error("ownerWeSappCodeId requis");
    }
    
    const response = await ApiClient.patch(
      `${API_ENDPOINTS.UPDATE_CODE}${ownerWeSappCodeId}/`,{
        "owner_we_sapp_code":ownerWeSappCodeId,
        "username":username,
        "label":label,
        "bio":bio,
        "profile_photo":profilePhoto,
        "unread_messages":unreadMessages,
      });
    console.log("Connexions récupérées:", response.data);
    return response.data || [];
};

export const deleteCode = async (ownerWeSappCodeId?: string) => {
 
    if (!ownerWeSappCodeId) {
      throw new Error("Code WeSapp requis");
    }
    
    const response = await ApiClient.delete(
      `${API_ENDPOINTS.UPDATE_CODE}${ownerWeSappCodeId}/`);
      
      if ( response.status === 204) {
        return true;
      }
      return false;
};

export const setDefaultCode = async (ownerWeSappCodeId?: string) => {
 
    if (!ownerWeSappCodeId) {
      throw new Error("default requis");
    }
    
    const response = await ApiClient.patch(
      `${API_ENDPOINTS.UPDATE_CODE}${ownerWeSappCodeId}/`,{
        "is_default":true,
      });

    return response.data || [];


    }

export const updateCodeUnreadMessages = async (ownerWeSappCodeId?: string) => {
 
      if (!ownerWeSappCodeId) {
        throw new Error("ownerWeSappCodeId requis");
      }
      
      const response = await ApiClient.get(
        `${API_ENDPOINTS.UPDATE_CODE}update-notification?owner_we_sapp_code=${ownerWeSappCodeId}`);
      console.log("Connexions récupérées:", response.data);
      // return response.data || [];
  };
