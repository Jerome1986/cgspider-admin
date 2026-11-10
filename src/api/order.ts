import { request } from '@/utils/request'
import type { OrderItem } from '@/types/OrderItem'
import type { ServerPage } from '@/types/Api'

/** 订单关键词走分页查询入口，避免旧搜索数组与分页对象混用。 */
export const searchOrderApi = async (searchValue: string, pageNum = 1, pageSize = 10) => {
  const res = await request<ServerPage<OrderItem>>({
    url: '/api/user-order-get',
    params: { page: pageNum, pageSize, searchValue }
  })
  return {
    ...res,
    data: { ...res.data, pageNum, pageSize, totalPage: Math.ceil(res.data.total / pageSize) }
  }
}
export const orderListGetApi = (pageNum: number, pageSize: number) =>
  searchOrderApi('', pageNum, pageSize)
