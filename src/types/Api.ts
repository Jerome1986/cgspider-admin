/** 服务端成功响应外壳。 */
export interface ApiResult<T> {
  /** 业务状态码 */ code: number
  /** 提示文字 */ message: string
  /** 业务数据 */ data: T
  /** 旧搜索接口总数 */ total?: number
}
/** 后端通用列表投影。 */
export interface ServerPage<T> {
  /** 当前页数据 */ list: T[]
  /** 同条件总数 */ total: number
}
/** 管理员当前资料。 */
export interface AdminProfile {
  /** 整数编号 */ id: number
  /** 用户名 */ username: string
  /** 后台角色 */ role: 'ADMIN'
  /** 显示名 */ displayName: string
  /** 头像地址 */ userAvatarUrl: string
}
/** 分类树节点原始响应。 */
export interface CategoryNode {
  /** 整数编号 */ id: number
  /** 分类名称 */ name: string
  /** 英文名称 */ enName: string
  /** 父分类编号 */ parentId: number | null
  /** 素材类型 */ type: string
  /** 层级 */ level: number
  /** 排序值 */ sort: number
  /** 创建时间 */ createdAt: string
  /** 更新时间 */ updatedAt: string
  /** 直属子级 */ children: CategoryNode[]
}
/** 用户管理原始响应。 */
export interface ServerUser {
  /** 整数编号 */ id: number
  /** 账号名 */ username: string
  /** 业务角色 */ role: string
  /** 金币余额 */ coins: number
  /** 启禁用状态 */ status: number
  /** 创建时间 */ createdAt: string
  /** 会员到期时间 */ endDate: string | null
}
