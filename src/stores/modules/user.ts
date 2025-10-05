import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse } from '@/types/Users'
import { createDefaultUserInfo } from '@/utils/BaseInfo.ts'

export const useUserStore = defineStore(
  'cgs-user',
  () => {
    // 用户信息
    const userInfo = ref<LoginResponse>(createDefaultUserInfo())
    // 设置用户信息
    const setUserInfo = (info: LoginResponse) => {
      userInfo.value = { ...userInfo.value, ...info }
    }

    // 记住账号
    const remenber = ref(false)
    const setRemenber = (val: boolean) => (remenber.value = val)
    // 缓存账号
    const username = ref('')
    const setUsername = (val: string) => {
      username.value = val
    }

    // 清空用户信息--退出登录
    const clearUserInfo = () => createDefaultUserInfo()

    return {
      userInfo,
      username,
      setUsername,
      remenber,
      setRemenber,
      setUserInfo,
      clearUserInfo
    }
  },
  {
    persist: true
  }
)
