import { request } from '@/utils/request.ts'
import type { Category, CategoryPageResult } from '@/types/Cate.ts'
import type { addResult, deleteResult, editResult } from '@/types/Global '

/**
 * 分类请求
 * /cate-pageGet
 * @param type - 所属类型
 * @param pageNum - 页码
 * @param pageSize - 每页条数
 * @param parentId - 父级ID，默认为NULL，请求顶级
 */
export const cateListGetApi = (
  type: string,
  pageNum: number,
  pageSize: number,
  parentId: string | null = null
) => {
  return request<CategoryPageResult>({
    method: 'GET',
    url: '/cate-pageGet',
    params: { type, pageNum, pageSize, parentId }
  })
}

/**
 * 添加分类
 * @param name - 分类名称
 * @param en_name - 分类英文
 * @param type - 所属类型
 * @param parentId - 父级ID，默认为NULL，没有自身就是父级
 * @param parentName
 */
export const addCateApi = (
  name: string,
  en_name: string,
  type: string,
  parentId: string | null = null,
  parentName: string = '',
  level: number = 1
) => {
  return request<addResult>({
    method: 'POST',
    url: '/cate-add',
    data: { name, en_name, type, parentId, parentName, level }
  })
}

/**
 * 删除分类通用接口
 *  /cate-delById
 * @param cateId - 分类ID
 */
export const delCateListApi = (cateId: string) => {
  return request<deleteResult>({
    method: 'POST',
    url: '/cate-delById',
    data: { cateId }
  })
}

/**
 * 通用分类更新接口
 * /cate-updateById
 * /cate-update
 * @param cateId - 当前分类ID
 * @param name - 分类名称
 * @param en_name - 分类英文
 * @param type -  所属类型
 * @param parentId - 父级ID 默认NULL，不传就是没有父级
 */
export const cateEditApi = (
  cateId: string,
  name: string,
  en_name: string,
  type: string | null,
  parentId: string | null = null
) => {
  return request<editResult>({
    method: 'POST',
    url: '/cate-updateById',
    data: { cateId, name, en_name, type, parentId }
  })
}

/**
 * 获取所有分类，不带分页
 * /cate-allGet
 * @param type - 所属类型
 * @param level - 所属分类层级
 */
export const cateAllGetApi = (type: string, level: number = 1) => {
  return request<Category[]>({
    method: 'GET',
    url: '/cate-allGet',
    params: { type, level }
  })
}

/**
 * 根据类型-父级分类-当前分类名称同时匹配搜索分类
 * /cate-search
 * @param type - 页面类型
 * @param searchVal - 搜索名称
 * @param pageNum - 页码
 * @param pageSize - 条数
 * @param parentId - 父级ID
 */
export const searchCateApi = (
  type: string,
  searchVal: string,
  pageNum = 1,
  pageSize = 10,
  parentId: string | null = null
) => {
  return request<CategoryPageResult>({
    method: 'POST',
    url: '/cate-search',
    data: { type, searchVal, pageNum, pageSize, parentId }
  })
}
