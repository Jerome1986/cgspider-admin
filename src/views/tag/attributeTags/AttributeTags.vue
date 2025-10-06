<script setup lang="ts">
import BaseTable from '@/components/BaseTable.vue'
import { ref, onMounted } from 'vue'
import BaseFormDialog from '@/components/BaseFormDialog.vue'
import type { RowAction } from '@/components/BaseTable.vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { columns, formFieldsDef } from './DataConfig.ts'
import TypeHeader from '@/components/TypeHeader.vue'
import { useMenuStore, useTagStore } from '@/stores'
import type { CateEditForm } from '@/types/Cate.ts'
import SearchPage from '@/components/SearchPage.vue'
import type { TagEditForm } from '@/types/Tags'
import { addAittribuleTagApi, deleteAittribuleTagApi, updateAittribuleTagApi } from '@/api/tag.ts'

// 定义store
const menuStore = useMenuStore()
const tagStore = useTagStore()
const loading = ref<boolean>(true)
// 分页
const param = ref({
  pageNum: 1,
  pageSize: 10
})

// 弹窗
const dialogVisible = ref(false)

const handleSizeChange = async (size: number) => {
  console.log('条数', size)
  param.value.pageNum = 1
  param.value.pageSize = size
  await tagStore.aittribuleTagGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
}

const handleCurrentChange = async (current: number) => {
  loading.value = true
  console.log('页码', current)
  param.value.pageNum = current
  await tagStore.aittribuleTagGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

// 表单默认值
const editForm = ref<TagEditForm>({ _id: '', name: '', en_name: '', type: '' })
// 表单title
const dialogTitle = ref<string>('')
// 新增
async function onAddChannel() {
  editForm.value = { _id: '', name: '', en_name: '', type: '' }
  dialogTitle.value = '新增标签'
  dialogVisible.value = true
}

// 编辑
function onEditChannel(row: TagEditForm) {
  editForm.value = { ...row }
  dialogTitle.value = '编辑标签'
  dialogVisible.value = true
}

// 处理提交
const handleConfirm = async (row: TagEditForm) => {
  console.log('提交', row)
  loading.value = true
  try {
    let result
    switch (dialogTitle.value) {
      case '新增标签':
        result = await addAittribuleTagApi(row.name, row.en_name, row.type)
        // 重置分页
        param.value.pageNum = 1
        break
      case '编辑标签':
        console.log('edit')
        if (row._id) result = await updateAittribuleTagApi(row._id, row.name, row.en_name, row.type)
        break
    }
    // 将类型同步
    menuStore.setCurrentMenu(row.type)
    ElMessage.success(result!.message)
    // 操作完重新获取数据
    await tagStore.aittribuleTagGet(
      menuStore.currentMenu,
      param.value.pageNum,
      param.value.pageSize
    )
    editForm.value = { _id: '', name: '', en_name: '', type: '' }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 删除
function onDelChannel(row: CateEditForm) {
  loading.value = true
  console.log('delete row', row)
  ElMessageBox.confirm('确定要删除此用户吗?')
    .then(async () => {
      if (row._id) await deleteAittribuleTagApi(row._id)
      ElMessage.success('删除成功')
      // 重新获取数据
      await tagStore.aittribuleTagGet(
        menuStore.currentMenu,
        param.value.pageNum,
        param.value.pageSize
      )
    })
    .catch((err) => {
      console.error(err)
    })

  loading.value = false
}

// 表格操作项配置
const actions: RowAction[] = [
  { icon: Edit, type: 'primary', circle: true, plain: true, onClick: onEditChannel },
  { icon: Delete, type: 'danger', circle: true, plain: true, onClick: onDelChannel }
]

// 处理类型的改变，根据类型渲染标签
const handleChangeType = async (type: string) => {
  loading.value = true
  console.log('type', type)
  // 切换类型重置页码
  param.value.pageNum = 1
  await tagStore.aittribuleTagGet(type, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

// 处理搜索
const handleSearch = async (value: string) => {
  loading.value = true
  const keyword = value.trim() // 去掉首尾空格
  console.log('搜索关键字:', keyword)
  //  开始搜索
  await tagStore.searchAittribuleTagTotal(
    menuStore.currentMenu,
    keyword,
    param.value.pageNum,
    param.value.pageSize
  )

  // 每次搜索或重置都回到第一页
  param.value.pageNum = 1
  loading.value = false
}

// 清空搜索
const handleClearSearch = async () => {
  loading.value = true
  param.value.pageNum = 1
  await tagStore.aittribuleTagGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  await tagStore.aittribuleTagGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
})
</script>

<template>
  <div class="userManager">
    <BaseTable
      page-title="属性标签"
      :data="tagStore.aittributeTag"
      :columns="columns"
      :actions="actions"
      :total="tagStore.aittribuleTagTotal"
      :loading="loading"
      v-model:page="param.pageNum"
      v-model:pageSize="param.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #extra>
        <div style="display: flex">
          <TypeHeader @changeType="handleChangeType"></TypeHeader>
          <el-button type="primary" @click="onAddChannel">添加标签</el-button>
        </div>
        <SearchPage @search="handleSearch" @clear="handleClearSearch"></SearchPage>
      </template>
    </BaseTable>

    <BaseFormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :fields="formFieldsDef"
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
