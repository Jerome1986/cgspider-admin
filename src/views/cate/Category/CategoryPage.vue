<script setup lang="ts">
import BaseTable from '@/components/BaseTable.vue'
import { ref, onMounted } from 'vue'
import BaseFormDialog from '@/components/BaseFormDialog.vue'
import type { RowAction } from '@/components/BaseTable.vue'
import { Edit, Delete, FolderAdd } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { columns, formFields, setFormFields } from './DataConfig.ts'
import { addCateApi, cateEditApi, delCateListApi } from '@/api/cate.ts'
import TypeHeader from '@/components/TypeHeader.vue'
import { useCateStore, useMenuStore } from '@/stores'
import type { CateEditForm } from '@/types/Cate.ts'
import SearchPage from '@/components/SearchPage.vue'

// 定义store
const menuStore = useMenuStore()
const cateStore = useCateStore()
const loading = ref<boolean>(true)
// 分页
const param = ref({
  pageNum: 1,
  pageSize: 10
})

// 弹窗
const dialogVisible = ref(false)

const handleSizeChange = async (size: number) => {
  loading.value = true
  console.log('条数', size)
  param.value.pageSize = size
  await cateStore.cateListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

const handleCurrentChange = async (current: number) => {
  loading.value = true
  console.log('页码', current)
  param.value.pageNum = current
  await cateStore.cateListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

// 表单默认值
const editForm = ref<CateEditForm>({ _id: '', name: '', en_name: '', type: '' })
// 表单title
const dialogTitle = ref<string>('')
// 新增
async function onAddChannel() {
  editForm.value = { _id: '', name: '', en_name: '', type: '' }
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
  // 设置弹窗根据dialogTitle显示不同的字段
  setFormFields(dialogTitle.value)
}

// 给当前分类添加子级分类
const onAddSubChannel = (row: CateEditForm) => {
  console.log(row)
  editForm.value = {
    _id: row._id,
    name: '',
    en_name: '',
    type: row.type,
    parentName: row.name
  }
  console.log('ddd', editForm.value)
  dialogTitle.value = '新增子级分类'
  dialogVisible.value = true
  // 设置弹窗根据dialogTitle显示不同的字段
  setFormFields(dialogTitle.value)
}

// 编辑
function onEditChannel(row: CateEditForm) {
  editForm.value = { ...row }
  dialogTitle.value = '编辑分类'
  dialogVisible.value = true
}

// 处理提交
const handleConfirm = async (row: CateEditForm) => {
  console.log('提交', row)
  loading.value = true
  try {
    let result
    switch (dialogTitle.value) {
      case '新增分类':
        result = await addCateApi(row.name, row.en_name, row.type)
        console.log('提交结果', result)
        // 重置分页
        param.value.pageNum = 1
        break
      case '编辑分类':
        if (row._id)
          result = await cateEditApi(row._id, row.name, row.en_name, menuStore.currentMenu)
        break
      case '新增子级分类':
        if (row._id)
          result = await addCateApi(row.name, row.en_name, row.type, row._id, row.parentName, 2)
        break
    }
    // 将类型同步
    menuStore.setCurrentMenu(row.type)
    ElMessage.success(result!.message)
    // 操作完重新获取数据
    await cateStore.cateListGet(row.type, param.value.pageNum, param.value.pageSize)
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
      if (row._id) await delCateListApi(row._id)
      ElMessage.success('删除成功')
      // 重新获取数据
      await cateStore.cateListGet(row.type, param.value.pageNum, param.value.pageSize)
    })
    .catch((err) => {
      console.error(err)
    })

  loading.value = false
}

// 表格操作项配置
const actions: RowAction[] = [
  { icon: FolderAdd, type: 'success', circle: true, plain: true, onClick: onAddSubChannel },
  { icon: Edit, type: 'primary', circle: true, plain: true, onClick: onEditChannel },
  { icon: Delete, type: 'danger', circle: true, plain: true, onClick: onDelChannel }
]

// 处理类型的改变，根据类型渲染分类
const handleChangeType = async (type: string) => {
  loading.value = true
  // 切换类型重置页码
  param.value.pageNum = 1
  await cateStore.cateListGet(type, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

// 处理搜索
const handleSearch = (value: string) => {
  loading.value = true
  const keyword = value.trim() // 去掉首尾空格
  console.log('搜索关键字:', keyword)
  // 每次搜索或重置都回到第一页
  param.value.pageNum = 1
  if (keyword) {
    cateStore.searchCateListGet(
      menuStore.currentMenu,
      keyword,
      param.value.pageNum,
      param.value.pageSize
    )
  } else {
    cateStore.cateListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  }
  loading.value = false
}

// 清空搜索
const handleClearSearch = async () => {
  loading.value = true
  param.value.pageNum = 1
  await cateStore.cateListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  await cateStore.cateListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
})
</script>

<template>
  <div class="cateManager">
    <BaseTable
      page-title="一级分类"
      :data="cateStore.cateList"
      :columns="columns"
      :actions="actions"
      :total="cateStore.total"
      :loading="loading"
      v-model:page="param.pageNum"
      v-model:pageSize="param.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #extra>
        <div style="display: flex">
          <TypeHeader @changeType="handleChangeType"></TypeHeader>
          <el-button type="primary" @click="onAddChannel" style="margin-left: 20px"
            >添加分类</el-button
          >
        </div>
        <SearchPage @search="handleSearch" @clear="handleClearSearch"></SearchPage>
      </template>
    </BaseTable>

    <BaseFormDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :fields="formFields"
      :model-value="editForm"
      @confirm="handleConfirm"
    >
    </BaseFormDialog>
  </div>
</template>

<style scoped lang="scss">
.cateManager {
  height: 100%;
}
</style>
