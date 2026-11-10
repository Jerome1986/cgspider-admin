// 用户表格数据配置
import type { ColumnDef } from '@/components/BaseTable.vue'
import type { Field } from '@/components/BaseFormDialog.vue'
import type { CateEditForm } from '@/types/Cate.ts'

// 表格配置项
export const columns: ColumnDef[] = [
  { prop: 'name', label: '分类名称' },
  { prop: 'sort', label: '排序（越小越靠前）' },
  { prop: 'en_name', label: '分类英文' },
  { prop: 'parentName', label: '所属父级' }
]

// 弹窗表单字段
export const formFields: Field<CateEditForm>[] = [
  { prop: 'name', label: '分类名称' },
  {
    prop: 'sort',
    label: '排序',
    component: 'el-input-number',
    props: { min: 0, max: 2147483647, precision: 0, step: 1, valueOnClear: 0 }
  },
  { prop: 'en_name', label: '分类英文' }
]
