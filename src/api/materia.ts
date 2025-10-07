import { request } from '@/utils/request.ts'
import type { MaterialItem, MaterialPageResult } from '@/types/Material'
import type { addResult, deleteResult, editResult } from '@/types/Global '

/**
 * 根据类型获取素材
 * /material-get
 * @param type
 * @param pageNum
 * @param pageSize
 */
export const materiaGetApi = (type: string, pageNum: number, pageSize: number) => {
  return request<MaterialPageResult>({
    method: 'GET',
    url: '/material-get',
    params: { type, pageNum, pageSize }
  })
}

/**
 * 更新当前素材
 * /material-update
 * @param data - 整个素材对象--包含ID
 */
export const materialUpdateApi = (data: MaterialItem) => {
  return request<editResult>({
    method: 'POST',
    url: '/material-update',
    data: data
  })
}

/**
 * 根据指定ID删除素材
 * /material-deleted
 * @param materialId - 素材ID
 */
export const materialDeleteApi = (materialId: string) => {
  return request<deleteResult>({
    method: 'POST',
    url: '/material-deleted',
    data: { materialId }
  })
}

/**
 * 新增一个素材
 * /material-addOne
 * @param top_id
 * @param sub_id
 * @param third_id
 * @param name
 * @param en_name
 * @param cover_url
 * @param files_url
 * @param aittributeTags
 * @param colorTags
 * @param type
 */
export const materialAddOneApi = (
  top_id: string,
  sub_id: string = '',
  third_id: string = '',
  name: string,
  en_name: string,
  cover_url: string,
  files_url: string,
  aittributeTags: string[] = [],
  colorTags: string[] = [],
  type: string
) => {
  return request<addResult>({
    method: 'POST',
    url: '/material-addOne',
    data: {
      top_id,
      sub_id,
      third_id,
      name,
      en_name,
      cover_url,
      files_url,
      aittributeTags,
      colorTags,
      type
    }
  })
}
