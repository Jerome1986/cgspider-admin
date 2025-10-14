import { request } from '@/utils/request.ts'
import type {
  WatermarkAddResult,
  WatermarkDeleteResult,
  WatermarkEditResult,
  WatermarkPageResult
} from '@/types/Watermark.ts'

/**
 * 获取所有水印
 * /watermark-get
 * @param pageNum
 * @param pageSize
 * @constructor
 */
export const WatermarkGetApi = (pageNum: number, pageSize: number) => {
  return request<WatermarkPageResult>({
    method: 'GET',
    url: '/watermark-get',
    params: { pageNum, pageSize }
  })
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
    url: '/watermark-add',
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
    url: '/watermark-update',
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
    url: '/watermark-del',
    data: { watermarkId }
  })
}
