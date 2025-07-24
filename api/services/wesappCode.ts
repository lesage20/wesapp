import ApiClient from '../ApiClient';
// import ApiClient from '../apiClient';
import { API_ENDPOINTS } from '../../constants/ApiConstant';



export const checkPremiumCode = async (codeWeSapp?: string) => {
 
    if (!codeWeSapp) {
      throw new Error("codeWeSapp requis");
    }
    
    const response = await ApiClient.get(
      `${API_ENDPOINTS.CHECK_PREMIUM_CODE}${codeWeSapp}`
    );
    return response.data.premium;
}
