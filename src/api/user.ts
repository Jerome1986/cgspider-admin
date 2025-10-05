import { request } from '@/utils/request.ts'
import type { UserListPageResult } from '@/types/Users'
import type { addResult, deleteResult, editResult } from '@/types/Global '

/**
 * 获取用户列表
 * /userAdminGet
 * @param role - 当前操作身份
 * @param pageNum - 页码
 * @param pageSize - 每页条数
 */
export const userListGetApi = (role: string, pageNum: number, pageSize: number) => {
  return request<UserListPageResult>({
    method: 'GET',
    url: '/userAdminGet',
    params: { role, pageNum, pageSize }
  })
}

/**
 * 新增用户
 * /user-add
 * @param username - 用户名
 * @param role - 用户角色
 * @param coins - 金币
 * @param status - 账号状态
 */
export const userListAddAPi = (username: string, role: string, coins: number, status: number) => {
  return request<addResult>({
    method: 'POST',
    url: '/user-add',
    data: { username, role, coins, status }
  })
}

/**
 * 根据用户id删除用户
 * @param userId - 用户id
 */
export const userDeleteAPi = (userId: string) => {
  return request<deleteResult>({
    method: 'POST',
    url: '/user-deleted',
    data: { userId }
  })
}

/**
 * 根据用户id更新用户信息
 * @param userId - 用户id
 * @param role - 角色
 * @param username - 用户名
 * @param coins - 金币
 * @param status - 用户状态
 */
export const userUpdateAPi = (
  userId: string,
  role: string,
  username: string,
  coins: number,
  status: number
) => {
  return request<editResult>({
    method: 'POST',
    url: '/user-editInfo',
    data: { userId, role, username, coins, status }
  })
}
