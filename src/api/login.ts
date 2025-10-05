import { request } from '@/utils/request.ts'
import type { LoginResponse } from '@/types/Users'

/**
 * 管理员登录
 * '/user-login'
 * @param username
 * @param password
 */
export const loginApi = (username: string, password: string) => {
  return request<LoginResponse>({
    method: 'POST',
    url: '/user-login',
    data: { username, password }
  })
}
