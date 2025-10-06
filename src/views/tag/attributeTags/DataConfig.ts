// 用户表格数据配置
import type { ColumnDef } from '@/components/BaseTable.vue'
import type { Field } from '@/components/BaseFormDialog.vue'
import { ref } from 'vue'
import type { TagEditForm } from '@/types/Tags'

// 表格配置项
export const columns = ref<ColumnDef[]>([
  { prop: 'name', label: '标签名称' },
  { prop: 'en_name', label: '标签英文' }
])

// 弹窗表单字段
export const formFieldsDef: Field<TagEditForm>[] = [
  { prop: 'name', label: '标签名称' },
  { prop: 'en_name', label: '标签英文' },
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
