// 属性标签类型
export interface TagAittribuleItem {
  /** 唯一标识 */
  _id: string
  /** 标签名称 */
  name: string
  /** 标签英文 */
  en_name: string
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

// 颜色标签类型
export interface TagColorItem {
  /** 唯一标识 */
  _id: string
  /** 色值 */
  color: string
  /** 所属页面类型 */
  type: string
  /** 创建时间 */
  createdAt?: Date
  /** 更新时间 */
  updatedAt?: Date
}

// 属性标签分页返回类型
export interface TagAittribulePageResult {
  list: TagAittribuleItem[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 颜色标签带分页返回类型
export interface TagColorPageResult {
  list: TagColorItem[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 弹窗表单属性标签类型
export interface TagEditForm {
  _id?: string
  name: string
  en_name: string
  type: string
}
