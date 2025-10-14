// 水印数据类型
export interface WatermarkEditForm {
  _id: string
  name: string
  images: string
}

// 图片回显格式类型
export interface images {
  name: string
  url: string
}

// 水印分页返回
export interface WatermarkPageResult {
  list: WatermarkEditForm[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

// 新增水印返回
export interface WatermarkAddResult {
  insertedId: string
}

// 更新水印返回
export interface WatermarkEditResult {
  matchedCount: number
  modifiedCount: number
}

// 删除水印返回
export interface WatermarkDeleteResult {
  acknowledged: boolean
}
