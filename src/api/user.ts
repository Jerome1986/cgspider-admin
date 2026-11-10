import { request } from '@/utils/request'
import type { UserBaseTableData } from '@/types/BaseTableData'
import type { ServerPage, ServerUser } from '@/types/Api'

/** 业务用户列表，管理员角色不再作为查询授权参数。 */
export const userListGetApi = async (
  _role: string,
  pageNum: number,
  pageSize: number,
  keyword = ''
) => {
  const res = await request<ServerPage<ServerUser>>({
    url: '/api/user-get',
    params: { pagesNum: pageNum, pagesSize: pageSize, keyword }
  })
  const list: UserBaseTableData[] = res.data.list.map((row) => ({
    ...row,
    _id: String(row.id),
    membershipExpiry: row.endDate
  }))
  return {
    ...res,
    data: {
      list,
      total: res.data.total,
      pageNum,
      pageSize,
      totalPages: Math.ceil(res.data.total / pageSize)
    }
  }
}
/** 新增固定启用的业务用户；界面选择禁用时随后设置状态。 */
export const userListAddAPi = async (
  username: string,
  role: string,
  coins: number,
  status: number
) => {
  const res = await request<{ insertedId: number }>({
    url: '/api/user-add',
    method: 'POST',
    data: { username, role, coins }
  })
  if (status === 0)
    await request({
      url: '/api/user-status-update',
      method: 'PUT',
      data: { id: res.data.insertedId, status }
    })
  return res
}
/** 余额带打开表单时的原值校验，禁止覆盖并发下载扣费。 */
export const userUpdateAPi = async (
  userId: string,
  role: string,
  username: string,
  coins: number,
  status: number,
  expectedCoins?: number
) => {
  if (expectedCoins === undefined) throw new Error('缺少原始余额，请关闭编辑窗口后重试')
  const res = await request({
    url: '/api/user-editInfo',
    method: 'PUT',
    data: {
      id: Number(userId),
      role,
      username,
      ...(coins !== expectedCoins ? { coins, expectedCoins } : {})
    }
  })
  await request({
    url: '/api/user-status-update',
    method: 'PUT',
    data: { id: Number(userId), status }
  })
  return res
}
export const userDeleteAPi = (id: string) =>
  request({ url: '/api/user-deleted', method: 'DELETE', params: { id: Number(id) } })
