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

export interface TagAittribulePageResult {
  list: TagAittribuleItem[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 弹窗表单模型类型
export interface TagEditForm {
  _id?: string
  name: string
  en_name: string
  type: string
}
