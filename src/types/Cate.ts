// 分类数据类型
export interface Category {
  /** 唯一标识 */
  _id: string
  /** 父级ID，如果没有，为NULL 自身就是父级 */
  parentId: string | null // 顶级分类 parentId=null
  /** 父级名称 */
  parentName?: string
  /** 当前分类分明 */
  name: string
  /** 分类英文名称 */
  en_name: string
  /** 所属页面类型 */
  type: string
  /** 所属层级 */
  level: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updateAt: Date
}

// 分类带分页请求返回
export interface CategoryPageResult {
  list: Category[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
}

// 弹窗表单模型类型
export interface CateEditForm {
  /** 分类ID */
  _id?: string
  /** 分类名称 */
  name: string
  /** 英文名称 */
  en_name: string
  /** 所属类型 */
  type: string
  /** 父级ID */
  parentId?: string | null
  /** 父级名称 */
  parentName?: string
}
