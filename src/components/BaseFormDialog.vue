<script setup lang="ts" generic="T extends Record<string, unknown>">
import { type Component, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface Field<T> {
  prop: keyof T
  label: string
  component?: string | Component
  props?: Record<string, unknown>
  options?: { label: string; value: unknown }[]
}

const props = defineProps<{
  visible: boolean
  title: string
  fields: Field<T>[]
  modelValue: T
  rules?: Partial<Record<keyof T, FormRules>>
}>()

const emit = defineEmits(['update:visible', 'confirm'])

const formRef = ref<FormInstance>()
const formData = reactive({ ...props.modelValue } as T)

watch(
  () => props.modelValue,
  (newVal) => Object.assign(formData as Record<string, unknown>, newVal as Record<string, unknown>),
  { deep: true, immediate: true }
)

const visible = ref(props.visible)
watch(
  () => props.visible,
  (val) => (visible.value = val)
)
watch(visible, (val) => emit('update:visible', val))

function handleCancel() {
  visible.value = false
}

function handleConfirm() {
  formRef.value?.validate?.((valid: boolean) => {
    if (valid) {
      emit('confirm', { ...(formData as Record<string, unknown>) } as T)
      visible.value = false
    }
  })
}
</script>
<template>
  <el-dialog :title="title" v-model="visible" width="500px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item
        v-for="field in fields"
        :key="field.prop as string"
        :label="field.label"
        :prop="field.prop as string"
      >
        <component
          :is="field.component || 'el-input'"
          v-model="formData[field.prop as keyof typeof formData]"
          v-bind="field.props || {}"
        >
          <template v-if="field.options">
            <el-option
              v-for="opt in field.options"
              :key="String(opt.value)"
              :label="opt.label"
              :value="opt.value"
            />
          </template>
        </component>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>
