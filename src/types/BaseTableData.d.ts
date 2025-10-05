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
  createdAt: Date
  /** 会员到期时间 */
  membershipExpiry: Date
  /** 账号状态 */
  status: number
}
