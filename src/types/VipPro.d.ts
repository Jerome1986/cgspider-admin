/**
 * 产品类型声明
 */
export interface Product {
  /** 唯一标识 */
  _id: string

  /** 产品类型 */
  productType: string

  /** 产品类型（英文） */
  en_productType: string

  /** 产品名称 */
  productName: string

  /** 产品名称（英文） */
  en_name: string

  /** 价格 */
  price: number

  /** 金币数量 */
  goldCoinsAmount: number

  /** 会员类型 */
  membershipType: string

  /** 每日下载限制 */
  dailyDownloadLimit: string

  /** 描述 */
  description: string

  /** 描述（英文） */
  en_description: string

  /** 是否激活 */
  isActive?: boolean
}

// 新增返回类型
export interface ProductAddResult {
  insertedId: string
}

// 更新返回类型
export interface ProductUpdateResult {
  matchedCount: number
  modifiedCount: number
}

// 删除返回类型
export interface ProductDelResult {
  acknowledged: boolean
}
