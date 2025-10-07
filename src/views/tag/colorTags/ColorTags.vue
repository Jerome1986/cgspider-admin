<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import ChannelEdit from './ChannelEdit.vue'

import { ref, onMounted } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TagColorItem } from '@/types/Tags'
import TypeHeader from '@/components/TypeHeader.vue'
import { useMenuStore, useTagStore } from '@/stores'
import { deleteColorTagApi } from '@/api/tag.ts'

// 编辑组件
const dialog = ref()

// 定义store
const menuStore = useMenuStore()
const tagStore = useTagStore()

// 分页参数
const param = ref({
  pageNum: 1,
  pageSize: 10
})

// 加载
const loading = ref(false)

// 处理添加
const onAddChannel = () => {
  console.log('添加')
  dialog.value.open({})
}

// 处理编辑
const onEditChannel = (row: TagColorItem) => {
  console.log('编辑', row)
  dialog.value.open(row)
}

// 处理删除
const onDelChannel = async (row: TagColorItem) => {
  console.log('删除', row)
  // 提示
  ElMessageBox.confirm('确定要删除此标签吗?')
    .then(async () => {
      // 执行删除
      const delRes = await deleteColorTagApi(row._id)
      ElMessage.success(delRes.message)
      // 重新获取数据
      await tagStore.getColorTagList(
        menuStore.currentMenu,
        param.value.pageNum,
        param.value.pageSize
      )
    })
    .catch((err) => {
      // catch error
      console.error(err)
    })
}

// 处理每页条数改变
const handleSizeChange = async (val: number) => {
  param.value.pageSize = val
  param.value.pageNum = 1
  // 重新获取数据
  await tagStore.getColorTagList(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
}

// 处理页码改变
const handleCurrentChange = async (val: number) => {
  param.value.pageNum = val
  // 重新获取数据
  await tagStore.getColorTagList(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
}

// 提交
const onSuccess = async () => {
  console.log('成功提交')
  await tagStore.getColorTagList(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
}

// 处理类型的改变，根据类型渲染分类
const handleChangeType = async (type: string) => {
  console.log(type)
  loading.value = true
  // 切换类型重置页码
  param.value.pageNum = 1
  await tagStore.getColorTagList(type, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  await tagStore.getColorTagList(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
})
</script>

<template>
  <page-container title="颜色标签">
    <template #extra>
      <TypeHeader @changeType="handleChangeType"></TypeHeader>
      <div class="addCate" style="margin-top: 20px; text-align: end">
        <el-button type="primary" @click="onAddChannel">添加颜色</el-button>
      </div>
    </template>

    <el-table :data="tagStore.colorList" style="width: 100%" v-loading="loading">
      <el-table-column label="序号" align="center" width="100" type="index"> </el-table-column>
      <el-table-column label="颜色" align="center" prop="bgc">
        <template #default="{ row }">
          <div class="color-block" :style="{ backgroundColor: row.color }"></div>
        </template>
      </el-table-column>
      <el-table-column label="色值" align="center" prop="color"></el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="onEditChannel(row)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="onDelChannel(row)"
          ></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
    <!-- 页码 -->
    <div style="margin-top: 20px">
      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        v-model:current-page="param.pageNum"
        v-model:page-size="param.pageSize"
        :page-sizes="[1, 10, 50, 100]"
        layout="jumper,total, sizes, prev, pager, next "
        :total="tagStore.colorTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </page-container>

  <!-- 添加/编辑 组件框 -->
  <ChannelEdit ref="dialog" @success="onSuccess"></ChannelEdit>
</template>

<style scoped lang="scss">
.page-container {
  .header {
    display: flex;
    justify-content: flex-end;
  }
}

.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin: 0 auto;
  /* 居中显示 */
}
</style>
