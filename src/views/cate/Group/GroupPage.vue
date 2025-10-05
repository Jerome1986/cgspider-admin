<script setup lang="ts">
import BaseTable from '@/components/BaseTable.vue'
import { ref, onMounted } from 'vue'
import BaseFormDialog from '@/components/BaseFormDialog.vue'
import type { RowAction } from '@/components/BaseTable.vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { columns, formFields } from './DataConfig.ts'
import { cateEditApi, delCateListApi } from '@/api/cate.ts'
import TypeHeader from '@/components/TypeHeader.vue'
import { useCateStore, useMenuStore } from '@/stores'
import CateSubHeader from '@/components/CateSubHeader.vue'
import type { CateEditForm } from '@/types/Cate.ts'
import SearchPage from '@/components/SearchPage.vue'

// 定义store
const menuStore = useMenuStore()
const cateStore = useCateStore()
const loading = ref<boolean>(true)
// 一级分类切换时
const handleChangeCate = async (parentId: string) => {
  loading.value = true
  console.log('父级ID', parentId)
  param.value.pageNum = 1
  cateStore.setTopCurrentId(parentId)
  await cateStore.cateListGet(
    menuStore.currentMenu,
    param.value.pageNum,
    param.value.pageSize,
    3,
    parentId
  )
  loading.value = false
}

// 弹窗
const dialogVisible = ref(false)

// 分页
const param = ref({
  pageNum: 1,
  pageSize: 10
})

const handleSizeChange = async (size: number) => {
  loading.value = true
  console.log('条数', size)
  param.value.pageSize = size
  await cateStore.cateListGet(
    menuStore.currentMenu,
    param.value.pageNum,
    param.value.pageSize,
    3,
    cateStore.topCateCurrentId
  )
  loading.value = false
}

const handleCurrentChange = async (current: number) => {
  loading.value = true
  console.log('页码', current)
  param.value.pageNum = current
  await cateStore.cateListGet(
    menuStore.currentMenu,
    param.value.pageNum,
    param.value.pageSize,
    3,
    cateStore.topCateCurrentId
  )
  loading.value = false
}

// 表单默认值
const editForm = ref<CateEditForm>({ _id: '', name: '', en_name: '', type: '' })
// 表单title
const dialogTitle = ref<string>('')

// 编辑
function onEditChannel(row: CateEditForm) {
  editForm.value = { ...row }
  console.log(editForm.value)
  dialogTitle.value = '编辑分类'
  dialogVisible.value = true
}

// 处理窗口提交
const handleConfirm = async (row: CateEditForm) => {
  loading.value = true
  console.log('提交', row)
  try {
    if (row._id) {
      const result = await cateEditApi(row._id, row.name, row.en_name, null, row.parentId)
      // 将类型同步
      menuStore.setCurrentMenu(row.type)
      // 操作完重新获取数据
      await cateStore.cateListGet(
        menuStore.currentMenu,
        param.value.pageNum,
        param.value.pageSize,
        3,
        cateStore.topCateCurrentId
      )

      ElMessage.success(result!.message)
      editForm.value = { _id: '', name: '', en_name: '', type: '' }
    }
  } catch (error) {
    console.error(error)
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
      console.log('删除')
      if (row._id) await delCateListApi(row._id)
      // 重新获取数据
      await cateStore.cateListGet(
        menuStore.currentMenu,
        param.value.pageNum,
        param.value.pageSize,
        3,
        cateStore.topCateCurrentId
      )
      ElMessage.success('删除成功')
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

// 处理类型的改变，根据类型渲染分类
const handleChangeType = async (type: string) => {
  loading.value = true
  console.log(type)
  param.value.pageNum = 1
  await cateStore.topCateListGet(type, param.value.pageNum, param.value.pageSize, 2)
  await cateStore.cateListGet(
    menuStore.currentMenu,
    param.value.pageNum,
    param.value.pageSize,
    3,
    cateStore.topCateCurrentId
  )
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
      param.value.pageSize,
      cateStore.topCateCurrentId,
      3
    )
  } else {
    cateStore.cateListGet(
      menuStore.currentMenu,
      param.value.pageNum,
      param.value.pageSize,
      3,
      cateStore.topCateCurrentId
    )
  }

  loading.value = false
}

// 清空搜索
const handleClearSearch = async () => {
  loading.value = true
  param.value.pageNum = 1
  await cateStore.cateListGet(
    menuStore.currentMenu,
    param.value.pageNum,
    param.value.pageSize,
    3,
    cateStore.topCateCurrentId
  )
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  try {
    await cateStore.topCateListGet(
      menuStore.currentMenu,
      param.value.pageNum,
      param.value.pageSize,
      2
    )
    await cateStore.cateListGet(
      menuStore.currentMenu,
      param.value.pageNum,
      param.value.pageSize,
      3,
      cateStore.topCateCurrentId
    )
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="cateManager">
    <BaseTable
      page-title="三级分类"
      :data="cateStore.thirdCateList"
      :columns="columns"
      :actions="actions"
      :total="cateStore.thirdTotal"
      :loading="loading"
      v-model:page="param.pageNum"
      v-model:pageSize="param.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #extra>
        <TypeHeader @changeType="handleChangeType"></TypeHeader>
      </template>
      <!-- 副标题--用于显示类型分类等区域  -->
      <template #content>
        <CateSubHeader :list="cateStore.topCateList" @changeCate="handleChangeCate"></CateSubHeader>
        <SearchPage @search="handleSearch" @clear="handleClearSearch"></SearchPage>
      </template>
    </BaseTable>
    <!-- 弹窗 -->
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
  width: 100%;
  height: 100%;
}
</style>
