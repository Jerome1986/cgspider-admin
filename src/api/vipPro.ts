import { request } from '@/utils/request.ts'
import type {
  Product,
  ProductAddResult,
  ProductDelResult,
  ProductUpdateResult
} from '@/types/VipPro'

/**
 * 获取所有vip产品
 * /products-get
 */
export const productsGetApi = () => {
  return request<Product[]>({
    method: 'GET',
    url: '/products-get'
  })
}

/**
 * 删除指定产品
 * /products-delete
 * @param  id - 要删除产品的id
 */

export const deleteProduct = (id: string) => {
  return request<ProductDelResult>({
    method: 'DELETE',
    url: '/products-delete',
    params: { id }
  })
}

/**
 * 添加产品
 * @param  productInfo - 传递的产品信息
 */

export const addProduct = (productInfo: Product) => {
  return request<ProductAddResult>({
    method: 'POST',
    url: '/products-add',
    data: productInfo
  })
}

/**
 * 更新指定产品
 * @param  productInfo - 要更新的信息对象
 */

export const updateProduct = (productInfo: Product) => {
  return request<ProductUpdateResult>({
    method: 'PUT',
    url: '/products-update',
    data: productInfo
  })
}
