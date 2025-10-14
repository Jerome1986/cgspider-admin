<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TypeHeader from '@/components/TypeHeader.vue'
import { useCateStore, useMenuStore, useTagStore } from '@/stores'
import type { CateEditForm } from '@/types/Cate.ts'
import type { MaterialItem } from '@/types/Material'
import { materiaGetApi, materialDeleteApi } from '@/api/materia.ts'
import PageContainer from '@/components/PageContainer.vue'
import MaterialChannel from '@/views/material/MaterialChannel.vue'
import { getTagName } from '@/utils/getTagName.ts'
import router from '@/router'

// 定义store
const menuStore = useMenuStore()
const cateStore = useCateStore()
const tagStore = useTagStore()
const loading = ref<boolean>(true)

// 分页
const param = ref({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)

// 获取素材
const materialList = ref<MaterialItem[]>([])
const materialListGet = async (type: string, pageNum: number, pageSize: number) => {
  const res = await materiaGetApi(type, pageNum, pageSize)
  materialList.value = res.data.list
  total.value = res.data.total
}

// 弹窗
const dialog = ref()

const handleSizeChange = async (size: number) => {
  loading.value = true
  console.log('条数', size)
  param.value.pageNum = 1
  param.value.pageSize = size
  await materialListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

const handleCurrentChange = async (current: number) => {
  loading.value = true
  console.log('页码', current)
  param.value.pageNum = current
  await materialListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
}

// 新增
async function onAddChannel() {
  dialog.value.open({})
}

// 编辑
function onEditChannel(row: MaterialItem) {
  dialog.value.open(row)
}

// 处理提交
const handleConfirm = async () => {
  console.log('提交成功')
  await materialListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
}

// 删除
function onDelChannel(row: CateEditForm) {
  loading.value = true
  console.log('delete row', row)
  ElMessageBox.confirm('确定要删除此用户吗?')
    .then(async () => {
      if (row._id) await materialDeleteApi(row._id)
      ElMessage.success('删除成功')
      // 重新获取数据
      await materialListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
    })
    .catch((err) => {
      console.error(err)
    })

  loading.value = false
}

// 处理类型的改变，根据类型渲染分类
const handleChangeType = async (type: string) => {
  console.log(type)
  loading.value = true
  // 切换类型重置页码
  param.value.pageNum = 1
  await materialListGet(type, param.value.pageNum, param.value.pageSize)
  await cateStore.allCateGet(menuStore.currentMenu)
  await tagStore.aittribuleAll(menuStore.currentMenu)
  await tagStore.colorAllGet(menuStore.currentMenu)
  loading.value = false
}

// 批量发布
const onManyAdd = () => {
  console.log('批量')
  router.push({ path: '/many' })
}

onMounted(async () => {
  loading.value = true
  await materialListGet(menuStore.currentMenu, param.value.pageNum, param.value.pageSize)
  loading.value = false
})
</script>

<template>
  <page-container title="素材管理">
    <div class="header">
      <!--  类型  -->
      <TypeHeader @changeType="handleChangeType"></TypeHeader>
    </div>
    <template #extra>
      <el-button type="success" @click="onManyAdd">批量发布</el-button>
      <el-button type="primary" @click="onAddChannel">添加素材</el-button>
    </template>

    <el-table :data="materialList" style="width: 100%" v-loading="loading">
      <el-table-column label="序号" align="center" width="60" type="index"> </el-table-column>
      <el-table-column label="素材名称" align="center" prop="name"></el-table-column>
      <el-table-column label="素材英文" align="center" prop="en_name" width="160"></el-table-column>
      <el-table-column label="封面图" align="center">
        <template #default="scope">
          <el-image lazy style="width: 80px; height: 80px" :src="scope.row.cover_url" fit="cover">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="所属类型" align="center" prop="type" width="80"></el-table-column>
      <el-table-column
        label="文件素材"
        align="center"
        show-overflow-tooltip
        prop="files_url"
      ></el-table-column>
      <el-table-column label="关键词" align="center" prop="keywords"></el-table-column>
      <el-table-column label="标签" align="center" prop="aittributeTags">
        <template #default="{ row }">
          <span v-if="row.aittributeTags?.length">
            <el-tag
              v-for="tagId in row.aittributeTags"
              :key="tagId"
              type="info"
              class="mr-1"
              style="margin-right: 4px"
            >
              {{ getTagName(tagId) }}
            </el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="颜色" align="center" prop="colorTags">
        <template #default="{ row }">
          <span v-if="row.colorTags?.length">
            <el-tag
              v-for="tagId in row.colorTags"
              :key="tagId"
              type="info"
              class="mr-2"
              style="width: 20px; height: 20px"
              :style="{ backgroundColor: tagId }"
            >
            </el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
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
        :page-sizes="[1, 5, 10, 15]"
        layout="jumper,total, sizes, prev, pager, next "
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </page-container>

  <!-- 添加素材 组件框 -->
  <MaterialChannel ref="dialog" @success="handleConfirm" />
</template>

<style scoped lang="scss">
.page-container {
  .header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    width: 100%;
  }
}
</style>
