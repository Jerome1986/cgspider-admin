// 用户表格数据配置
import type { ColumnDef } from '@/components/BaseTable.vue'
import type { Field } from '@/components/BaseFormDialog.vue'
import type { CateEditForm } from '@/types/Cate.ts'
import { ref } from 'vue'

// 表格配置项
export const columns = ref<ColumnDef[]>([
  { prop: 'name', label: '分类名称' },
  { prop: 'en_name', label: '分类英文' },
  { prop: 'type', label: '所属类型' }
])

// 弹窗表单字段
const formFieldsDef: Field<CateEditForm>[] = [
  { prop: 'name', label: '分类名称' },
  { prop: 'en_name', label: '分类英文' },
  {
    prop: 'type',
    label: '所属类型',
    component: 'el-select',
    props: { placeholder: '选择所属类型', style: 'width: 160px' },
    options: [
      { label: '材质', value: '材质' },
      { label: '贴图', value: '贴图' },
      { label: '模型', value: '模型' },
      { label: '灯光', value: '灯光' }
    ]
  }
]

export const formFields = ref<Field<CateEditForm>[]>(formFieldsDef)

export const setFormFields = (title: string) => {
  if (title === '新增子级分类') {
    formFields.value = formFieldsDef.filter((item) => item.prop !== 'type')
  } else {
    formFields.value = formFieldsDef
  }
}
