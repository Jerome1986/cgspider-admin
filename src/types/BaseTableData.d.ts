// 用户表格数据类型
export interface UserBaseTableData {
  /** 唯一标识 */
  _id?: string
  /** 用户名 */
  username: string
  /** 用户角色 */
  role: string
  /** 金币 */
  coins: number
  /** 创建时间 */
  createdAt: string
  /** 会员到期时间 */
  membershipExpiry: string | null
  /** 编辑时原始金币余额，用于并发校验 */
  expectedCoins?: number
  /** 账号状态 */
  status: number
}
