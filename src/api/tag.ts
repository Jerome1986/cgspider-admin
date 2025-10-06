import { request } from '@/utils/request.ts'
import type { TagAittribulePageResult } from '@/types/Tags'
import type { addResult, deleteResult, editResult } from '@/types/Global '

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
