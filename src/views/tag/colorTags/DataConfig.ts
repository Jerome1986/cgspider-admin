// 下拉框
import { ref } from 'vue'
import type { FormRules } from 'element-plus'
import type { TagColorItem } from '@/types/Tags'

export const options = [
  { label: '材质', value: '材质' },
  { label: '贴图', value: '贴图' },
  { label: '模型', value: '模型' },
  { label: '灯光', value: '灯光' }
]

export const props = { placeholder: '选择所属类型', style: 'width: 160px' }

// 表单规则
export const rules = ref<FormRules<TagColorItem>>({
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
})
