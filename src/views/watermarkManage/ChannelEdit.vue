<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { images, WatermarkEditForm } from '@/types/Watermark.ts'
import { WatermarkAddApi, watermarkEditApi } from '@/api/watermark.ts'

// 弹窗控制
const dialogVisible = ref(false)

// 默认表单
const formModel = ref<WatermarkEditForm>({
  _id: '',
  name: '',
  images: ''
})

// 修改弹窗标题逻辑
const dialogTitle = computed(() => {
  return formModel.value._id ? '编辑素材' : '添加素材'
})

// 上传组件
const uploadRef = ref()

// 图片回显
const imagesList = ref<images[]>([])

// 打开弹窗
const open = (row: WatermarkEditForm) => {
  dialogVisible.value = true
  console.log(row)
  formModel.value = row
  // 图片回显
  if (row.images) {
    imagesList.value = [
      {
        name: '封面图',
        url: row.images
      }
    ]
  } else {
    imagesList.value = []
  }
}

// 暴露打开弹窗的方法
defineExpose({
  open
})

// 图片上传成功回调
const handleSuccess = (response: string) => {
  console.log('图片上传成功', response)
  formModel.value.images = response
  ElMessage.success('图片上传成功')
}

// 图片上传失败
const handleError = (error: Error) => {
  console.log(error)
  ElMessage.error('文件名已存在')
}

// 提交
const emits = defineEmits(['onSuccess'])
const onSubmit = async () => {
  console.log('提交', formModel.value)

  try {
    if (formModel.value._id) {
      // 编辑
      const upRes = await watermarkEditApi(
        formModel.value._id,
        formModel.value.name,
        formModel.value.images
      )
      console.log('更新结果', upRes)
      ElMessage.success('更新成功')
    } else {
      // 添加
      const addRes = await WatermarkAddApi(formModel.value.name, formModel.value.images)
      console.log('添加结果', addRes)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    emits('onSuccess')
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="proChannelAdd">
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%">
      <el-form ref="formRef" :model="formModel" label-width="100px" style="padding-right: 30px">
        <el-form-item label="水印名称" prop="name">
          <el-input v-model="formModel.name" placeholder="请输入素材名称"></el-input>
        </el-form-item>
        <!--   封面图     -->
        <el-form-item label="预览图" prop="images">
          <div class="upload-container">
            <el-upload
              ref="uploadRef"
              action="https://etnrve3alw.gzg.sealos.run/material-upload-cover"
              list-type="picture-card"
              :on-success="handleSuccess"
              :on-error="handleError"
              :limit="1"
              :file-list="imagesList"
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </div>
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

  /*颜色标签*/
  .color-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .colorItem {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
      }

      &.color-selected {
        border: 1px solid #ffffff;
        box-shadow: 0 0 0 2px #409eff;
      }
    }
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
