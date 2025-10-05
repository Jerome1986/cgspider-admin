<script setup lang="ts">
import BaseTable from '@/components/BaseTable.vue'
import { ref, computed, onMounted } from 'vue'
import type { UserBaseTableData } from '@/types/BaseTableData'
import BaseFormDialog from '@/components/BaseFormDialog.vue'
import type { RowAction } from '@/components/BaseTable.vue'
import type { UserRole, UserStatus } from '@/types/Users'
import { Edit, Delete, Search } from '@element-plus/icons-vue'
import { columns, formFields, type UserEditForm } from '@/views/userManage/dataConfig/DataConfig.ts'
import { userDeleteAPi, userListAddAPi, userListGetApi, userUpdateAPi } from '@/api/user.ts'
import { useUserStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()

// 用户列表
const userList = ref<UserBaseTableData[]>([])
const userListGet = async (role: string, pageNum: number, pageSize: number) => {
  const res = await userListGetApi(role, pageNum, pageSize)
  console.log('渲染结果', res.data)
  userList.value = res.data.list
  total.value = res.data.total
}

// 搜索
const searchValue = ref('')
const filteredUsers = computed(() => {
  const keyword = searchValue.value.trim().toLowerCase()
  if (!keyword) return userList.value
  return userList.value.filter((u) => u.username.toLowerCase().includes(keyword))
})

// 弹窗
const dialogVisible = ref(false)

// 分页
const param = ref({
  pageNum: 1,
  pageSize: 10
})

const total = ref(0)

const handleSizeChange = (size: number) => {
  console.log('条数', size)
  param.value.pageSize = size
  userListGet(userStore.userInfo.role, param.value.pageNum, param.value.pageSize)
}

const handleCurrentChange = (current: number) => {
  console.log('页码', current)
  param.value.pageNum = current
  userListGet(userStore.userInfo.role, param.value.pageNum, param.value.pageSize)
}

// 表单编辑默认值
const editForm = ref<UserEditForm>({
  _id: '',
  username: '',
  role: 'user',
  coins: 0,
  status: 1
})

// 新增
async function onAddChannel() {
  editForm.value = { _id: '', username: '', role: 'user', coins: 0, status: 1 }
  dialogVisible.value = true
}

// 编辑
function onEditChannel(row: UserBaseTableData) {
  editForm.value = {
    _id: row._id,
    username: row.username,
    role: row.role as UserRole,
    coins: row.coins,
    status: row.status as UserStatus
  }
  dialogVisible.value = true
}

// 处理提交
const handleConfirm = async (row: UserBaseTableData) => {
  console.log('提交', row)
  try {
    let result
    if (row._id) {
      //  编辑
      result = await userUpdateAPi(row._id, row.role, row.username, row.coins, row.status)
    } else {
      //   添加
      result = await userListAddAPi(row.username, row.role, row.coins, row.status)
    }
    // 操作完重新获取数据
    await userListGet(userStore.userInfo.role, param.value.pageNum, param.value.pageSize)
    ElMessage.success(result.message)
    editForm.value = { _id: '', username: '', role: 'user', coins: 0, status: 1 }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '操作失败'
    ElMessage.error(message)
  }
}

// 删除
function onDelChannel(row: UserBaseTableData) {
  console.log('delete row', row)
  ElMessageBox.confirm('确定要删除此用户吗?')
    .then(async () => {
      if (row._id) await userDeleteAPi(row._id)
      ElMessage.success('删除成功')
      // 重新获取数据
      await userListGet(userStore.userInfo.role, param.value.pageNum, param.value.pageSize)
    })
    .catch((err) => {
      // catch error
      ElMessage.error(err)
    })
}

// 表格操作项配置
const actions: RowAction[] = [
  { icon: Edit, type: 'primary', circle: true, plain: true, onClick: onEditChannel },
  { icon: Delete, type: 'danger', circle: true, plain: true, onClick: onDelChannel }
]

onMounted(() => userListGet(userStore.userInfo.role, param.value.pageNum, param.value.pageSize))
</script>

<template>
  <div class="userManager">
    <BaseTable
      page-title="用户管理"
      :data="filteredUsers"
      :columns="columns"
      :actions="actions"
      :total="total"
      v-model:page="param.pageNum"
      v-model:pageSize="param.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #extra>
        <el-input
          v-model="searchValue"
          style="width: 240px; margin-right: 40px"
          placeholder="输入你要查找的用户名"
          :suffix-icon="Search"
        />
        <el-button type="primary" @click="onAddChannel">添加用户</el-button>
      </template>
    </BaseTable>

    <BaseFormDialog
      v-model:visible="dialogVisible"
      title="用户信息"
      :fields="formFields"
      :model-value="editForm"
      @confirm="handleConfirm"
    >
    </BaseFormDialog>
  </div>
</template>

<style scoped lang="scss">
.userManager {
  height: 100%;
}
</style>
