import { request } from '@/utils/request.ts'
import type { OrderPageResult } from '@/types/OrderItem.ts'

/**
 * 获取所有订单-带分页
 * /user-order-get
 * @param pageNum - 页码
 * @param pageSize - 条数
 */
export const orderListGetApi = (pageNum: number, pageSize: number) => {
  return request<OrderPageResult>({
    method: 'GET',
    url: '/user-order-get',
    params: { pageNum, pageSize }
  })
}

/**
 * 根据订单号/用户名搜索订单
 * /user-order-search
 * @param searchValue - 搜索内容
 * @param pageNum - 页码
 * @param pageSize - 条数
 */
export const searchOrderApi = (searchValue: string, pageNum: number = 1, pageSize: number = 10) => {
  return request<OrderPageResult>({
    method: 'POST',
    url: '/user-order-search',
    data: { searchValue, pageNum, pageSize }
  })
}
