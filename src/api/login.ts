import { request } from '@/utils/request'
import type { AdminProfile } from '@/types/Api'
import { createDefaultUserInfo } from '@/utils/BaseInfo'

/** 管理员登录，使用独立管理员表与ADMIN令牌，不走客户端user-login。 */
export const loginApi = async (username: string, password: string) => {
  const res = await request<{ token: string; userInfo: AdminProfile }>({
    url: '/api/admin/login',
    method: 'POST',
    data: { username, password }
  })
  return {
    ...res,
    data: {
      ...createDefaultUserInfo(),
      _id: String(res.data.userInfo.id),
      username: res.data.userInfo.username,
      role: 'admin' as const,
      token: res.data.token,
      userAvatarUrl: res.data.userInfo.userAvatarUrl
    }
  }
}
/** 恢复页面时重新核验当前管理员身份。 */
export const adminMeApi = () => request<AdminProfile>({ url: '/api/admin/me' })
