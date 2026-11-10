import { request } from '@/utils/request'
import type { Product } from '@/types/VipPro'
import type { ServerPage } from '@/types/Api'

/** 后台读取包含下架商品的全部分页，不使用只含在售套餐的公开接口。 */
export const productsGetApi = async () => {
  const first = await request<ServerPage<Product>>({
    url: '/api/admin/products',
    params: { pagesNumber: 1, pagesSize: 100 }
  })
  const list = [...first.data.list]
  for (let page = 2; list.length < first.data.total; page++) {
    const next = await request<ServerPage<Product>>({
      url: '/api/admin/products',
      params: { pagesNumber: page, pagesSize: 100 }
    })
    if (!next.data.list.length) break
    list.push(...next.data.list)
  }
  return { ...first, data: list }
}
// 白名单构造，移除界面专用英文类型字段，数值显式转换。
const payload = (row: Product) => ({
  productType:
    row.productType === '金币充值'
      ? 'gold'
      : row.productType === '购买会员'
        ? 'membership'
        : row.productType,
  productName: row.productName,
  en_name: row.en_name || '',
  price: Number(row.price),
  goldCoinsAmount: Number(row.goldCoinsAmount || 0),
  membershipType:
    row.membershipType === '年费会员'
      ? 'annual'
      : row.membershipType === '永久会员'
        ? 'permanent'
        : row.membershipType || '',
  dailyDownloadLimit: Number(row.dailyDownloadLimit || 0),
  description: row.description,
  en_description: row.en_description || '',
  isActive: row.isActive ?? true
})
/** 商品CRUD。 */
export const deleteProduct = (_id: string) =>
  request({ url: '/api/products-delete', method: 'DELETE', params: { _id } })
export const addProduct = (row: Product) =>
  request({ url: '/api/products-add', method: 'POST', data: payload(row) })
export const updateProduct = (row: Product) =>
  request({ url: '/api/products-update', method: 'PUT', data: { ...payload(row), _id: row._id } })
