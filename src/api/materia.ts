/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
// 保留旧调用签名；当前模型不保存独立keywords字段。
import { request } from '@/utils/request'
import { aittribuleAllApi } from './tag'
import type { MaterialItem, MaterialPageResult, ServerMaterial } from '@/types/Material'
import type { ServerPage } from '@/types/Api'

/** 管理端投影保留全部文件，界面首地址只用于兼容旧单文件编辑控件。 */
export const materiaGetApi = async (
  type: string,
  pageNum: number,
  pageSize: number,
  keyword = ''
) => {
  const [res, dictionary] = await Promise.all([
    request<ServerPage<ServerMaterial>>({
      url: '/api/material-get',
      params: { materialType: type, pagesNum: pageNum, pagesSize: pageSize, searchValue: keyword }
    }),
    aittribuleAllApi(type)
  ])
  const list: MaterialItem[] = res.data.list.map((row) => {
    const files = typeof row.files_url === 'string' ? [row.files_url] : row.files_url
    return {
      ...row,
      files_url: files[0] || '',
      fileUrls: [...files],
      aittributeTags: row.tags.map(
        (name) => dictionary.data.find((tag) => tag.name === name)?._id || name
      ),
      colorTags: [...row.colors],
      keywords: ''
    }
  })
  const data: MaterialPageResult = {
    list,
    total: res.data.total,
    pageNum,
    pageSize,
    totalPage: Math.ceil(res.data.total / pageSize)
  }
  return { ...res, data }
}
/** 新增和更新统一构造白名单，支持三级分类，不发送旧keywords。 */
const payload = async (row: MaterialItem) => {
  const dictionary = await aittribuleAllApi(row.type)
  return {
    top_id: row.top_id,
    sub_id: row.sub_id || '',
    third_id: row.third_id || '',
    name: row.name,
    en_name: row.en_name || '',
    cover_url: row.cover_url,
    files_url:
      row.fileUrls?.length && row.fileUrls[0] === row.files_url ? row.fileUrls : [row.files_url],
    tags: (row.aittributeTags || []).map(
      (value) => dictionary.data.find((tag) => tag._id === value)?.name || value
    ),
    colors: [...(row.colorTags || [])],
    type: row.type,
    status: row.status ?? 1
  }
}
export const materialUpdateApi = async (row: MaterialItem) =>
  request({
    url: '/api/material-update',
    method: 'PUT',
    data: { ...(await payload(row)), _id: row._id }
  })
export const materialDeleteApi = (material_id: string) =>
  request({ url: '/api/material-deleted', method: 'DELETE', params: { material_id } })
/** 发布一组素材，文件数组保持数组，不再以逗号拼接URL。 */
export const materialAddOneApi = async (
  top_id: string,
  sub_id = '',
  third_id = '',
  name: string,
  en_name: string,
  cover_url: string,
  files_url: string | string[],
  aittributeTags: string[] = [],
  colorTags: string[] = [],
  type: string,
  _keywords?: string
) => {
  const files = typeof files_url === 'string' ? [files_url] : files_url
  if (!files.length || files.some((file) => !file))
    throw new Error('每组素材需要至少一个非图片文件')
  const row: MaterialItem = {
    _id: '',
    top_id,
    sub_id,
    third_id,
    name,
    en_name,
    cover_url,
    files_url: files[0] || '',
    fileUrls: files,
    aittributeTags,
    colorTags,
    type,
    keywords: ''
  }
  return request({ url: '/api/material-add', method: 'POST', data: await payload(row) })
}
/** 管理端搜索沿用分页列表入口，避免旧搜索的顶层total协议差异。 */
export const materialSearchApi = (
  searchVal: string,
  type: string,
  pageNum: number,
  pageSize: number
) => materiaGetApi(type, pageNum, pageSize, searchVal)
