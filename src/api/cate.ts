/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
// 下划线参数保留旧调用签名，不把旧协议的父级名称与层级写入新接口。
import { request } from '@/utils/request'
import type { Category, CategoryPageResult } from '@/types/Cate'
import type { CategoryNode } from '@/types/Api'

// 保留服务端排序，编辑名称时不将sort隐式重置为0。
const originals = new Map<string, Category>()
/** 完整树映射为现有后台的字符串ID扁平列表，不以999条代替完整读取。 */
export const cateAllApi = async (type: string) => {
  const res = await request<CategoryNode[]>({ url: '/api/categories/tree', params: { type } })
  const list: Category[] = []
  const visit = (nodes: CategoryNode[], parentName = '') => {
    for (const node of nodes) {
      const row: Category = {
        _id: String(node.id),
        name: node.name,
        en_name: node.enName,
        parentId: node.parentId === null ? null : String(node.parentId),
        parentName,
        type: node.type,
        level: node.level,
        sort: node.sort,
        createdAt: node.createdAt,
        updateAt: node.updatedAt
      }
      list.push(row)
      originals.set(row._id, row)
      visit(node.children, node.name)
    }
  }
  visit(res.data)
  return { ...res, data: list }
}
/** 现有选择器读取指定层级完整分类。 */
export const cateAllGetApi = async (type: string, level = 1) => {
  const res = await cateAllApi(type)
  return { ...res, data: res.data.filter((row) => row.level === level) }
}
/** 分类树完整读取后按直属父级、关键词分页，保留页面现有交互。 */
export const searchCateApi = async (
  type: string,
  searchVal: string,
  pageNum = 1,
  pageSize = 10,
  parentId: string | null = null
) => {
  const res = await cateAllApi(type)
  const list = res.data.filter(
    (row) =>
      row.parentId === parentId && (row.name.includes(searchVal) || row.en_name.includes(searchVal))
  )
  const data: CategoryPageResult = {
    list: list.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    total: list.length,
    pageNum,
    pageSize,
    totalPage: Math.ceil(list.length / pageSize)
  }
  return { ...res, data }
}
export const cateListGetApi = (
  type: string,
  pageNum: number,
  pageSize: number,
  parentId: string | null = null
) => searchCateApi(type, '', pageNum, pageSize, parentId)
/** 新增分类，层级由服务端根据父级计算。 */
export const addCateApi = (
  name: string,
  en_name: string,
  type: string,
  parentId: string | null = null,
  _parentName = '',
  _level = 1
) =>
  request({
    url: '/api/categories',
    method: 'POST',
    data: {
      name,
      enName: en_name,
      type,
      sort: 0,
      ...(parentId ? { parentId: Number(parentId) } : {})
    }
  })
/** 编辑仅允许名称；类型、父级和排序不隐式改变。 */
export const cateEditApi = (
  id: string,
  name: string,
  en_name: string,
  type: string | null,
  parentId: string | null = null
) => {
  const original = originals.get(id)
  if (!original) throw new Error('请刷新分类列表后重试')
  if ((type && type !== original.type) || parentId !== original.parentId)
    throw new Error('当前接口不支持修改分类类型或父级')
  return request({
    url: '/api/categories/' + id,
    method: 'PATCH',
    data: { name, enName: en_name, sort: original.sort }
  })
}
/** 删除叶子分类，关联校验由后端执行。 */
export const delCateListApi = (id: string) =>
  request({ url: '/api/categories/' + id, method: 'DELETE' })
