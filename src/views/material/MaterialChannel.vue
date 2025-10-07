<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {
  ElMessage,
  genFileId,
  type UploadInstance,
  type UploadProps,
  type UploadRawFile,
  type UploadUserFile
} from 'element-plus'
import type { MaterialItem } from '@/types/Material'
import { useCateStore, useMenuStore, useTagStore } from '@/stores'
import { materialAddOneApi, materialUpdateApi } from '@/api/materia.ts'

// 定义store
const menuStore = useMenuStore()
const cateStore = useCateStore()
const tagStore = useTagStore()

const dialogVisible = ref(false)

// 准备数据和校验规则
const formModelDef = ref<MaterialItem>({
  _id: '', // 添加 _id 字段
  top_id: '', //一级分类
  sub_id: '', //二级分类
  third_id: '',
  name: '', //商品名
  en_name: '', //商品英文名
  cover_url: '', //封面图-必填
  files_url: '', //素材文件
  aittributeTags: [], //标签
  colorTags: [], //颜色标签
  type: '' //类型-必填
})

const formModel = ref<MaterialItem>(formModelDef.value)

// 表单规则
const rules = ref({
  top_id: [{ required: true, message: '请起码选择一个分类', trigger: 'blur' }],
  name: [{ required: true, message: '请输入素材名称', trigger: 'blur' }],
  en_name: [{ message: '请输入素材英文名称', trigger: 'blur' }],
  cover_url: [{ required: true, message: '请上传封面图', trigger: 'change' }],
  files_url: [{ required: true, message: '请上传文件素材', trigger: 'change' }],
  type: [{ required: true, message: '请选择所属类型', trigger: 'change' }]
})

// 修改弹窗标题逻辑
const dialogTitle = computed(() => {
  return formModel.value._id ? '编辑素材' : '添加素材'
})

// 分类联级选择器
const cateArray = ref<string[]>([])
const handleCascaderChange = () => {
  console.log('cateArray', cateArray.value)
  formModel.value.top_id = cateArray.value[0] || ''
  formModel.value.sub_id = cateArray.value[1] || ''
  formModel.value.third_id = cateArray.value[2] || ''
}

// 添加文件列表的响应式变量
const coverFileList = ref<UploadUserFile[]>([])
const materialFileList = ref<UploadUserFile[]>([])

// 修改打开弹窗方法
const open = async (row: MaterialItem) => {
  console.log(row)
  dialogVisible.value = true
  if (row._id) {
    // 编辑
    formModel.value = { ...row }
    // 回显分类 - 过滤掉空值，避免 cascader 无法匹配
    cateArray.value = [row.top_id, row.sub_id, row.third_id].filter((id) => id) as string[]
    console.log('cateArray', cateArray.value)
    // 回显封面
    coverFileList.value = [
      {
        name: '封面图',
        url: row.cover_url
      }
    ]
    // 回显文件
    materialFileList.value = [
      {
        name: '素材文件',
        url: row.files_url
      }
    ]
  } else {
    console.log('添加')
    // 添加
    formModel.value = { ...formModelDef.value }
    formModel.value.type = menuStore.currentMenu
    cateArray.value = []
    coverFileList.value = []
    materialFileList.value = []
  }
}

// 处理图片上传
const uploadRef = ref<UploadInstance>()
//限制图片格式
const beforeUploadCover = (rawFile: UploadRawFile) => {
  // 允许的图片格式
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml'
  ]

  if (!allowedImageTypes.includes(rawFile.type)) {
    ElMessage.error('请上传图片格式文件（JPG、PNG、GIF、BMP、WEBP、SVG）')
    return false
  }
  return true
}

// 覆盖上一张图片/文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

// 处理上传文件
const uploadFileRef = ref<UploadInstance>()
// 覆盖上一个文件
const handleFilesExceed: UploadProps['onExceed'] = (files) => {
  uploadFileRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadFileRef.value!.handleStart(file)
}

// 限制文件格式 - 移除限制
const beforeUploadFiles = () => {
  // 移除文件格式限制，允许上传任何类型的文件
  return true
}

// 图片上传成功回调
const handleSuccess = (response: never) => {
  console.log('图片上传成功', response)
  formModel.value.cover_url = response
  ElMessage.success('图片上传成功')
}

// 图片上传失败的回调
const handleError = (error: Error) => {
  console.log(error)
  ElMessage.error('文件名已存在')
}

// 文件上传成功回调
const handleFilesSuccess = (response: never) => {
  console.log('文件上传成功', response)
  formModel.value.files_url = response
  ElMessage.success('文件上传成功')
}

// 将弹窗打开的方法暴露给父组件
defineExpose({
  open
})

// 修改提交表单方法
const emits = defineEmits(['success'])
const formRef = ref()
const onSubmit = async () => {
  try {
    console.log('提交时的表单', formModel.value)
    // 验证表单
    await formRef.value.validate()
    // 提交表单数据
    if (formModel.value._id) {
      // 编辑更新
      await materialUpdateApi(formModel.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await materialAddOneApi(
        formModel.value.top_id!,
        formModel.value.sub_id,
        formModel.value.third_id,
        formModel.value.name,
        formModel.value.en_name,
        formModel.value.cover_url,
        formModel.value.files_url,
        formModel.value.aittributeTags,
        formModel.value.colorTags,
        formModel.value.type
      )
      ElMessage.success('添加成功')
    }

    // 关闭弹窗
    dialogVisible.value = false
    // 提交成功通知父组件刷新列表
    emits('success')
  } catch (error) {
    console.error('提交失败:', error)
  }
}

onMounted(async () => {
  await cateStore.allCateGet(menuStore.currentMenu)
  await tagStore.aittribuleAll(menuStore.currentMenu)
  await tagStore.colorAllGet(menuStore.currentMenu)
})
</script>

<template>
  <div class="proChannelAdd">
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%">
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-width="100px"
        style="padding-right: 30px"
      >
        <el-form-item label="所属类型" prop="type">
          <el-input v-model="formModel.type" :disabled="true"></el-input>
        </el-form-item>
        <!--   一级分类     -->
        <el-form-item label="所属分类">
          <el-cascader
            v-model="cateArray"
            :options="cateStore.cateOptions"
            @change="handleCascaderChange"
          />
        </el-form-item>

        <el-form-item label="素材名称" prop="name">
          <el-input v-model="formModel.name" placeholder="请输入素材名称"></el-input>
        </el-form-item>
        <el-form-item label="素材英文" prop="en_name">
          <el-input v-model="formModel.en_name" placeholder="请输入素材英文名"></el-input>
        </el-form-item>
        <!--   封面图     -->
        <el-form-item label="封面图" prop="cover_url">
          <div class="upload-container">
            <el-upload
              ref="uploadRef"
              action="https://etnrve3alw.gzg.sealos.run/material-upload-cover"
              list-type="picture-card"
              :on-success="handleSuccess"
              :on-error="handleError"
              :before-upload="beforeUploadCover"
              :on-exceed="handleExceed"
              :limit="1"
              :file-list="coverFileList"
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </div>
        </el-form-item>
        <!--  上传文件    -->
        <el-form-item label="上传素材" prop="files_url">
          <el-upload
            ref="uploadFileRef"
            action="https://etnrve3alw.gzg.sealos.run/material-upload-files"
            :on-exceed="handleFilesExceed"
            :before-upload="beforeUploadFiles"
            :on-success="handleFilesSuccess"
            :limit="1"
            :file-list="materialFileList"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">请上传素材压缩包</div>
            </template>
          </el-upload>
        </el-form-item>
        <!--   标签     -->
        <el-form-item label="标签" prop="tags">
          <div class="tags">
            <el-select
              v-model="formModel.aittributeTags"
              multiple
              placeholder="请选择标签"
              style="width: 240px"
            >
              <el-option
                v-for="item in tagStore.aittribuleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </el-form-item>
        <!--   颜色     -->
        <el-form-item label="颜色">
          <el-select
            v-model="formModel.colorTags"
            multiple
            placeholder="Select"
            style="width: 240px"
          >
            <el-option
              v-for="item in tagStore.colorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="flex items-center">
                <el-tag :color="item.value" style="margin-right: 8px" size="small" />
                <span :style="{ color: item.value }">{{ item.label }}</span>
              </div>
            </el-option>
            <template #tag>
              <el-tag v-for="color in formModel.colorTags" :key="color" :color="color" />
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.proChannelAdd {
  /*属性标签*/
  .tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .tagItem {
      cursor: pointer;
      padding: 4px 8px;
      height: fit-content;
      line-height: 1.2;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: all 0.3s;
      font-size: 12px;

      &:hover {
        background-color: #f5f7fa;
      }

      &.tag-selected {
        border: 1px solid #409eff;
        color: #409eff;
      }
    }
  }

  // 颜色
  .el-tag {
    border: none;
    aspect-ratio: 1;
  }

  .upload-container {
    display: flex;
    align-items: center;
    gap: 16px;

    :deep(.el-upload--picture-card) {
      width: 120px;
      height: 120px;
      line-height: 120px;
    }

    .el-button {
      height: 40px;
      margin-top: 40px; // 垂直居中对齐
      padding: 0 20px;
      font-size: 14px;
    }
  }

  :deep(.el-upload) {
    .el-button {
      margin-right: 12px;
    }
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    color: #909399;
    font-size: 13px;
  }
}
</style>
