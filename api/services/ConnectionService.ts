import ApiClient from '../ApiClient';
// import ApiClient from '../apiClient';
import { API_ENDPOINTS } from '../../constants/ApiConstant';

// export const createConnection = async (
//   connectionName: string,
//   weSappCode: string,
//   ownerWeSappCode: string
// ): Promise<UserConnection> => {
//   const response = await ApiClient.post(API_ENDPOINTS.CREATE_CONNECTION, {
//     connection_name: connectionName,
//     we_sapp_code: weSappCode,
//     owner_we_sapp_code: ownerWeSappCode,
//   });
//   return response.data;
// };

export const createConnection = async (wesappCode?: string, ownerWeSappCode?: string, connectionName?: string) => {
  try {
    if (!wesappCode) {
      throw new Error("Code WeSapp requis");
    }
    if (!ownerWeSappCode) {
      throw new Error("Code WeSapp requis");
    }
    if (!connectionName) {
      throw new Error("Nom de la connexion requis");
    }
    
    const response = await ApiClient.post(
      API_ENDPOINTS.CREATE_CONNECTION,{
        "connection_name": connectionName,
        "we_sapp_code":wesappCode,
        "owner_we_sapp_code":ownerWeSappCode
    });

    console.log("Connexions récupérées:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};

export const updateConnection = async (wesappCode?: string, ownerWeSappCode?: string, connectionName?: string, wesappCodeId?: string) => {
  try {
    if (!wesappCode) {
      throw new Error("Code WeSapp requis");
    }
    if (!ownerWeSappCode) {
      throw new Error("Code WeSapp requis");
    }
    if (!connectionName) {
      throw new Error("Nom de la connexion requis");
    }
    
    const response = await ApiClient.patch(
      `${API_ENDPOINTS.CREATE_CONNECTION}${wesappCodeId}/`,{
        "connection_name": connectionName,
        "we_sapp_code":wesappCode,
        "owner_we_sapp_code":ownerWeSappCode,
      });
    console.log("Connexions récupérées:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};

export const checkCode = async (code: string) => {
  try {
    const response = await ApiClient.get(
      `${API_ENDPOINTS.GET_WESAPP_CODE}${code}`);
    return response.data || [];

  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    // throw error;
    return null;
  }
};

export const fetchWeSappUsers = async () => {
  try {
    const response = await ApiClient.get(API_ENDPOINTS.GET_WESAPP_USERS);
    return response.data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des codes WeSapp:", error);
    throw error;
  }
};


export const blockUser = async (
  weSappCodeId: string,
  blockedWeSappCodeId: string
) => {
  if (!weSappCodeId || !blockedWeSappCodeId) {
    throw new Error("Les deux IDs sont requis pour bloquer un utilisateur.");
  }

  try {
    const response = await ApiClient.post(API_ENDPOINTS.BLOCK_USER, {
      we_sapp_code_id: weSappCodeId,
      blocked_we_sapp_code_id: blockedWeSappCodeId,
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors du blocage :", error?.response?.data || error.message);
    throw error;
  }
};


export const unblockUser = async (
  weSappCodeId: string,
  blockedWeSappCodeId: string
) => {
  if (!weSappCodeId || !blockedWeSappCodeId) {
    throw new Error("Les deux IDs sont requis pour débloquer un utilisateur.");
  }

  try {
    const response = await ApiClient.delete(API_ENDPOINTS.UNBLOCK_USER, {
      params: {
        we_sapp_code: weSappCodeId,
        blocked_code: blockedWeSappCodeId,
      },
    });

    return true;
  } catch (error: any) {
    console.error("Erreur lors du déblocage :", error?.response?.data || error.message);
    throw error;
  }
};

export const deleteConnection = async (
  connectionId: string
) => {
  if (!connectionId) {
    throw new Error("L'ID de la connexion est requis pour supprimer une connexion.");
  }

  try {
    const response = await ApiClient.delete(API_ENDPOINTS.DELETE_CONNECTION + connectionId + '/');
    if (response.status === 204) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la connexion :", error?.response?.data || error.message);
    throw error;
  }
};

export const getBlockedContacts = async (code: string): Promise<any[]> => {
  const response = await ApiClient.get(API_ENDPOINTS.GET_BLOCKED_CONTACTS + code + '/');
  return response.data;
};


