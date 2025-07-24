import ApiClient from '../ApiClient';
import { API_ENDPOINTS } from '../../constants/ApiConstant';
import { GroupWesapp } from '../../types';

interface ApiResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

export const createGroup = async (
  name: string,
  description: string,
  members: string[],
  admin: string,
  profilePhoto?: string
): Promise<GroupWesapp> => {
  const response = await ApiClient.post(API_ENDPOINTS.CREATE_GROUP, {
    name,
    description,
    members,
    admin,
    profile_photo: profilePhoto,
  });
  return response.data;
};

export const updateGroup = async (id: string, name?: string, description?: string, members?: string[], admin?: string, profilePhoto?: string): Promise<GroupWesapp> => {
  const response = await ApiClient.patch(API_ENDPOINTS.UPDATE_GROUP + id + '/', {
    name,
    description,
    members,
    admin,
    profile_photo: profilePhoto,
  });
  return response.data;
};


export const addMembersToGroup = async (id: string, members: string[], conversationId: string): Promise<GroupWesapp> => {
  const response = await ApiClient.patch(API_ENDPOINTS.ADD_MEMBERS_TO_GROUP + id + '/add-members/', {
    members,
    conversation_id: conversationId,
  });
  return response.data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  await ApiClient.delete(API_ENDPOINTS.DELETE_GROUP + id + '/');
};

// Leave group function
export const leaveGroup = async (groupId: string, conversationId: string, code: string): Promise<ApiResponse> => {
  try {
    const response = await ApiClient.post(`${API_ENDPOINTS.LEAVE_GROUP.replace(':id', groupId)}`, {
      conversation_id: conversationId,
      code: code,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to leave group');
  }
};

// Remove member from group function
export const removeMemberFromGroup = async (groupId: string, conversationId: string, memberId: string): Promise<ApiResponse> => {
  try {
    const response = await ApiClient.patch(`${API_ENDPOINTS.REMOVE_MEMBER_FROM_GROUP.replace(':id', groupId)}`, {
      conversation_id: conversationId,
      member_id: memberId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to remove member from group');
  }
};

export const getGroupById = async (id: string, code: string): Promise<GroupWesapp> => {
  const response = await ApiClient.get(API_ENDPOINTS.GET_GROUPS + id + '&code=' + code);
  return response.data;
};