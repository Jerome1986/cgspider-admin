import { request } from '@/utils/request.ts'
import type {
  TagAittribuleItem,
  TagAittribulePageResult,
  TagColorItem,
  TagColorPageResult
} from '@/types/Tags'
import type { addResult, deleteResult, editResult } from '@/types/Global '

/**
 * 根据类型一次获取所有属性标签--用于选择器
 * /attributeTag-all
 * @param type - 页面类型
 */
export const aittribuleAllApi = (type: string) => {
  return request<TagAittribuleItem[]>({
    method: 'GET',
    url: '/attributeTag-all',
    params: { type }
  })
}

/**
 * 获取属性标签
 * /attributeTag-get
 * @param type - 所属类型
 * @param pageNum - 页码
 * @param pageSize - 条数
 */
export const aittribuleTagGetApi = (type: string, pageNum: number, pageSize: number) => {
  return request<TagAittribulePageResult>({
    method: 'GET',
    url: '/attributeTag-get',
    params: { type, pageNum, pageSize }
  })
}

/**
 * 新增标签
 * @param name - 标签名称
 * @param en_name - 标签英文
 * @param type - 所属类型
 */
export const addAittribuleTagApi = (name: string, en_name: string, type: string) => {
  return request<addResult>({
    method: 'POST',
    url: '/attributeTag-add',
    data: { name, en_name, type }
  })
}

/**
 * 根据ID更新属性标签
 * /attributeTag-update
 * @param tagId - 标签ID
 * @param name - 标签名称
 * @param en_name - 标签英文
 * @param type - 所属类型
 */
export const updateAittribuleTagApi = (
  tagId: string,
  name: string,
  en_name: string,
  type: string
) => {
  return request<editResult>({
    method: 'POST',
    url: '/attributeTag-update',
    data: { tagId, name, en_name, type }
  })
}

/**
 * 根据标签ID删除指定标签
 * /attributeTag-del
 * @param cateId - 标签ID
 */
export const deleteAittribuleTagApi = (cateId: string) => {
  return request<deleteResult>({
    method: 'POST',
    url: '/attributeTag-del',
    data: { cateId }
  })
}

/**
 * 根据类型和标签名称搜索标签
 * /attributeTag-search
 * @param type
 * @param searchVal
 * @param pageNum
 * @param pageSize
 */
export const searchAittribuleTagApi = (
  type: string,
  searchVal: string,
  pageNum: number = 1,
  pageSize: number = 10
) => {
  return request<TagAittribulePageResult>({
    method: 'POST',
    url: '/attributeTag-search',
    data: { type, searchVal, pageNum, pageSize }
  })
}

/**
 * 根据类型获取颜色标签
 *  /colorTag-get
 * @param type
 * @param pageNum
 * @param pageSize
 */
export const colorTagGetApi = (type: string, pageNum: number, pageSize: number) => {
  return request<TagColorPageResult>({
    method: 'GET',
    url: '/colorTag-get',
    params: { type, pageNum, pageSize }
  })
}

/**
 * 添加颜色标签
 * /colorTag-add
 * @param type - 页面类型
 * @param color - 颜色
 */
export const addColorTagApi = (type: string, color: string) => {
  return request<addResult>({
    method: 'POST',
    url: '/colorTag-add',
    data: { type, color }
  })
}

/**
 * 根据标签ID更新颜色标签
 * /colorTag-update
 * @param colorId - 颜色标签ID
 * @param color - 颜色
 * @param type - 所属页面类型
 */
export const updateColorTagApi = (colorId: string, color: string, type: string) => {
  return request<editResult>({
    method: 'POST',
    url: '/colorTag-update',
    data: { colorId, color, type }
  })
}

/**
 * 根据指定ID删除颜色标签
 * /colorTag-del
 * @param colorId - 颜色标签ID
 */
export const deleteColorTagApi = (colorId: string) => {
  return request<deleteResult>({
    method: 'POST',
    url: '/colorTag-del',
    data: { colorId }
  })
}

/**
 * 根据类型一次性获取所有颜色标签--用于选择器
 * /colorTag-all
 * @param type - 页面类型
 */
export const colorTagAllApi = (type: string) => {
  return request<TagColorItem[]>({
    method: 'GET',
    url: '/colorTag-all',
    params: { type }
  })
}
