<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { TagColorItem } from '@/types/Tags'
import { options, props, rules } from '@/views/tag/colorTags/DataConfig.ts'
import { addColorTagApi, updateColorTagApi } from '@/api/tag.ts'

// 弹窗
const dialogVisible = ref(false)
// 准备数据和校验规则
const formModel = ref<TagColorItem>({
  _id: '',
  color: '',
  type: ''
})

// 打开弹窗并初始化表单数据
const open = (row: TagColorItem) => {
  dialogVisible.value = true
  formModel.value = { ...row }
}

// 将弹窗打开的方法暴露给父组件
defineExpose({
  open
})

const emit = defineEmits(['success'])
const formRef = ref<FormInstance>()

// 提交表单
const onSubmit = async (formEl: FormInstance | undefined) => {
  console.log(formEl)
  try {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        let result
        if (!formModel.value._id) {
          //   添加
          console.log('submit!', formModel.value)
          result = await addColorTagApi(formModel.value.type, formModel.value.color)
          console.log('添加', result)
        } else {
          //   编辑
          result = await updateColorTagApi(
            formModel.value._id,
            formModel.value.color,
            formModel.value.type
          )
        }
        ElMessage.success(result!.message)
        // 关闭弹窗
        dialogVisible.value = false
        // 通知父组件刷新数据
        emit('success')
      } else {
        console.log('error submit!', fields)
      }
    })
  } catch (error) {
    console.error('提交失败:', error)
  }
}
</script>

<template>
  <div class="channelEdit">
    <el-dialog v-model="dialogVisible" :title="formModel._id ? '编辑颜色' : '添加颜色'" width="30%">
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-width="100px"
        style="padding-right: 30px"
      >
        <el-form-item label="选择颜色" prop="color">
          <div class="color-container">
            <div class="add-color">
              <el-color-picker
                v-model="formModel.color"
                show-alpha
                color-format="hex"
              ></el-color-picker>
              <span class="color-value" v-if="formModel.color">已选: {{ formModel.color }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="选择类型" prop="type">
          <div class="color-container">
            <el-select
              v-model="formModel.type"
              :options="options"
              :props="props"
              placeholder="Select"
              style="width: 240px"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit(formRef)"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.channelEdit {
  /*颜色标签*/
  .color-container {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .add-color {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .color-value {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
