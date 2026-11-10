<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores'
import { adminMeApi } from '@/api/login'

const user = useUserStore()
const ready = ref(false)
// 缓存令牌需由当前管理员接口重新确认，不能只依赖前端role字段。
watch(
  () => user.userInfo.token,
  async (token) => {
    ready.value = false
    try {
      if (token) {
        const res = await adminMeApi()
        if (user.userInfo.token !== token) return
        user.setUserInfo({
          ...user.userInfo,
          _id: String(res.data.id),
          username: res.data.username,
          userAvatarUrl: res.data.userAvatarUrl,
          role: 'admin'
        })
      }
    } catch {
      /* 请求层统一提示和处理401，网络故障不伪造登录成功。 */
    } finally {
      if (user.userInfo.token === token) ready.value = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-manage">
    <el-config-provider :locale="zhCn">
      <router-view v-if="ready"></router-view>
      <div v-else>正在核验管理员身份…</div>
    </el-config-provider>
  </div>
</template>

<style lang="scss" scoped></style>
