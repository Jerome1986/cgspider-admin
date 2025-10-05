<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/index.js'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/login.ts'
import type { loginFrom } from '@/types/Users'

// 定义store
const userStore = useUserStore()
const router = useRouter()
// 表单
const form = ref<FormInstance>()
// 用户表单初始数据
const userForm = ref<loginFrom>({
  username: userStore.username || '',
  password: ''
})

// 表单规则
const rules = reactive<FormRules<loginFrom>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 12, message: '用户名是6-12位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码最小位6位数', trigger: 'blur' }
  ]
})

// 记住我
const isRemenber = (e: boolean) => {
  console.log(e)
  if (!userStore.remenber) userStore.setUsername('')
  userStore.setRemenber(e)
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  console.log(formEl?.validate)
  // 如果记住我为true,则存入username
  if (userStore.remenber) userStore.setUsername(userForm.value.username)
  if (!formEl) return

  // 验证表单
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')
      try {
        // 发起登录请求
        const res = await loginApi(userForm.value.username, userForm.value.password)
        userStore.setUserInfo(res.data)
        console.log('登录返回', res)
        ElMessage.success('登录成功')
        await router.push('/')
      } catch (err) {
        console.log(err, '我是错误')
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 登录 -->
      <el-form ref="form" :model="userForm" :rules="rules" size="large" autocomplete="off">
        <el-form-item prop="title">
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="userForm.username"
            name="username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="userForm.password"
            @keydown.enter="submitForm(form)"
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="userStore.remenber" @change="isRemenber($event)"
              >记住我</el-checkbox
            >
            <el-link type="primary" :underline="false" @click="ElMessage.warning('请联系管理员')"
              >忘记密码？</el-link
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="submitForm(form)"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background: url('@/assets/bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
