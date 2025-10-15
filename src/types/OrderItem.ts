/**
 * 支付记录类型声明
 */
export interface OrderItem {
  /** 唯一标识 */
  _id: string

  /** 用户ID */
  user_id: string

  /** 订单ID */
  order_id: string

  /** 产品ID */
  product_id: string

  /** 产品名称 */
  product_name: string

  /** 支付金额 */
  amount: number

  /** 支付状态 */
  status: number

  /** 创建时间戳 */
  create_date: number

  /** 充值类型 */
  recharge_type: string

  /** 支付ID */
  payment_id: string

  /** 更新时间 */
  updated_at: string
  /** 文本状态映射--用于显示 */
  statusText: string
}

export interface OrderPageResult {
  list: OrderItem[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 映射订单状态类型
export interface StatusMap {
  [key: number]: string
  0: string
  1: string
  2: string
}
