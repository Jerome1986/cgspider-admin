import { useUserStore } from '@/stores'
import axios, { isAxiosError } from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios'
import type { ApiResult } from '@/types/Api'

export const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
)
// 字符串数组错误统一为可读提示。
const messageText = (value: unknown): string =>
  Array.isArray(value)
    ? value.filter((v) => typeof v === 'string').join('；')
    : typeof value === 'string'
      ? value
      : '网络连接失败，请稍后重试'
export const getErrorMessage = (error: unknown): string =>
  isAxiosError(error)
    ? messageText(error.response?.data?.message || error.message)
    : error instanceof Error
      ? error.message
      : messageText(error)

// 网络层仅注入当前管理员令牌，处理HTTP错误；不重复包装业务数据。
const sendRequest = async <T>(options: AxiosRequestConfig): Promise<T> => {
  const user = useUserStore(),
    token = user.userInfo.token
  try {
    const response = await axios.request<T>({
      ...options,
      baseURL,
      timeout: options.timeout ?? 30000,
      headers: { ...options.headers, ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    })
    return response.data
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      token &&
      user.userInfo.token === token
    ) {
      user.clearUserInfo()
      if (router.currentRoute.value.path !== '/login') await router.replace('/login')
    }
    ElMessage({ type: 'error', message: getErrorMessage(error), grouping: true })
    throw error
  }
}
/** 业务请求保留code/message/data外壳，业务失败不当作成功。 */
export const request = async <T>(options: AxiosRequestConfig): Promise<ApiResult<T>> => {
  const result = await sendRequest<ApiResult<T>>(options)
  if (result?.code !== 200) {
    const message = messageText(result?.message)
    ElMessage.error(message)
    throw new Error(message)
  }
  return result
}
/** 管理员上传图片或素材包，返回服务端直接JSON字符串URL，不手写multipart边界。 */
export const uploadAsset = async (
  file: File,
  cover: boolean,
  onUploadProgress?: (event: AxiosProgressEvent) => void
): Promise<string> => {
  const data = new FormData()
  data.append('file', file)
  const url = await sendRequest<string>({
    method: 'POST',
    url: cover ? '/api/material-upload-cover' : '/api/material-upload-files',
    data,
    timeout: 0,
    onUploadProgress
  })
  if (typeof url !== 'string' || !/^https?:\/\//.test(url))
    throw new Error('上传返回的文件地址无效')
  return url
}
