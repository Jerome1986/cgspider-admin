import { request } from '@/utils/request.ts'
import type { ServerPage } from '@/types/Api'
import type {
  WatermarkAddResult,
  WatermarkDeleteResult,
  WatermarkEditResult,
  WatermarkEditForm
} from '@/types/Watermark.ts'

/**
 * 获取所有水印
 * /watermark-get
 * @param pageNum
 * @param pageSize
 * @constructor
 */
export const WatermarkGetApi = async (pageNum: number, pageSize: number) => {
  const result = await request<ServerPage<WatermarkEditForm>>({
    method: 'GET',
    url: '/api/watermark-get',
    params: { pagesNum: pageNum, pagesSize: pageSize }
  })
  return {
    ...result,
    data: { ...result.data, pageNum, pageSize, totalPages: Math.ceil(result.data.total / pageSize) }
  }
}

/**
 * 添加水印
 * /watermark-add
 * @param name - 名称
 * @param images - 水印地址
 */
export const WatermarkAddApi = (name: string, images: string) => {
  return request<WatermarkAddResult>({
    method: 'POST',
    url: '/api/watermark-add',
    data: { name, images }
  })
}

/**
 * 更新水印
 * /watermark-update
 * @param watermarkId - 水印ID
 * @param name - 名称
 * @param images - 地址
 */
export const watermarkEditApi = (watermarkId: string, name: string, images: string) => {
  return request<WatermarkEditResult>({
    method: 'POST',
    url: '/api/watermark-update',
    data: { watermarkId, name, images }
  })
}

/**
 * 删除水印
 * /watermark-del
 * @param watermarkId - 水印ID
 */
export const watermarkDeleteApi = (watermarkId: string) => {
  return request<WatermarkDeleteResult>({
    method: 'POST',
    url: '/api/watermark-del',
    data: { watermarkId }
  })
}
