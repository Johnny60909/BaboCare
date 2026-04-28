import axios from "axios";
import type {
  CurrentUserDto,
  UpdateMyProfileRequest,
} from "../dtos/Users/currentUser.dto";
import { getToken } from "../../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";

export class CurrentUserService {
  /**
   * 取得當前用戶信息
   */
  static async getCurrentUser(
    signal?: AbortSignal
  ): Promise<CurrentUserDto> {
    const token = getToken();
    const response = await axios.get<{ result: CurrentUserDto }>(
      `${API_URL}/api/users/me`,
      {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.result;
  }

  /**
   * 更新當前用戶個人資料
   */
  static async updateMyProfile(
    request: UpdateMyProfileRequest,
    signal?: AbortSignal
  ): Promise<CurrentUserDto> {
    const token = getToken();
    const response = await axios.put<{ result: CurrentUserDto }>(
      `${API_URL}/api/users/me`,
      request,
      {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.result;
  }
}
