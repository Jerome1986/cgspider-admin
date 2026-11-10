/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
// 保留旧调用签名；共享字典不再使用旧type参数。
import { request } from '@/utils/request'
import type { TagAittribuleItem, TagColorItem } from '@/types/Tags'
import type { ServerPage } from '@/types/Api'

/** 属性标签是共享字典，不再按素材类型隔离。 */
export const aittribuleAllApi = async (_type: string) => {
  const res = await request<ServerPage<TagAittribuleItem>>({ url: '/api/attributeTag-get' })
  return { ...res, data: res.data.list }
}
export const colorTagAllApi = async (_type: string) => {
  const res = await request<ServerPage<TagColorItem>>({ url: '/api/colorTag-get' })
  return { ...res, data: res.data.list }
}
/** 属性名称搜索复用完整字典，筛选后再分页。 */
export const searchAittribuleTagApi = async (
  type: string,
  searchVal: string,
  pageNum = 1,
  pageSize = 10
) => {
  const res = await aittribuleAllApi(type)
  const list = res.data.filter(
    (row) => row.name.includes(searchVal) || row.en_name.includes(searchVal)
  )
  return {
    ...res,
    data: {
      list: list.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      total: list.length,
      pageNum,
      pageSize,
      totalPage: Math.ceil(list.length / pageSize)
    }
  }
}
export const aittribuleTagGetApi = (type: string, pageNum: number, pageSize: number) =>
  searchAittribuleTagApi(type, '', pageNum, pageSize)
export const colorTagGetApi = async (_type: string, pageNum: number, pageSize: number) => {
  const res = await request<ServerPage<TagColorItem>>({
    url: '/api/colorTag-get',
    params: { pagesNum: pageNum, pagesSize: pageSize }
  })
  return {
    ...res,
    data: { ...res.data, pageNum, pageSize, totalPage: Math.ceil(res.data.total / pageSize) }
  }
}
/** 属性与颜色写入只提交服务端白名单。 */
export const addAittribuleTagApi = (name: string, en_name: string, _type: string) =>
  request({ url: '/api/attributeTag-add', method: 'POST', data: { name, en_name } })
export const updateAittribuleTagApi = (_id: string, name: string, en_name: string, _type: string) =>
  request({ url: '/api/attributeTag-update', method: 'PUT', data: { _id, name, en_name } })
export const deleteAittribuleTagApi = (_id: string) =>
  request({ url: '/api/attributeTag-del', method: 'DELETE', params: { _id } })
export const addColorTagApi = (_type: string, color: string) =>
  request({ url: '/api/colorTag-add', method: 'POST', data: { color } })
export const updateColorTagApi = (_id: string, color: string, _type: string) =>
  request({ url: '/api/colorTag-update', method: 'PUT', data: { _id, color } })
export const deleteColorTagApi = (_id: string) =>
  request({ url: '/api/colorTag-del', method: 'DELETE', params: { _id } })
