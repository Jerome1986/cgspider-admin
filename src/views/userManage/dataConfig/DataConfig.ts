// 用户表格数据配置
import type { ColumnDef } from '@/components/BaseTable.vue'
import type { Field } from '@/components/BaseFormDialog.vue'
import type { UserRole, UserStatus } from '@/types/Users'
import { formatTime } from '@/utils/formatTime.ts'
import { formatStatus } from '@/utils/formatUserStatus.ts'

// 表格配置项
export const columns: ColumnDef[] = [
  { prop: 'username', label: '用户名' },
  { prop: 'role', label: '角色' },
  { prop: 'coins', label: '金币' },
  { prop: 'createdAt', label: '创建时间', formatter: (v) => formatTime(v as string) },
  {
    prop: 'membershipExpiry',
    label: '会员到期时间',
    formatter: (v) => formatTime(v as string)
  },
  { prop: 'status', label: '账号状态', formatter: (v) => formatStatus(v as number) }
]

// 弹窗表单模型类型
export interface UserEditForm {
  _id?: string
  username: string
  role: UserRole
  coins: number
  status: UserStatus
}

// 弹窗表单字段
export const formFields: Field<UserEditForm>[] = [
  { prop: 'username', label: '用户名' },
  {
    prop: 'role',
    label: '角色',
    component: 'el-select',
    props: { placeholder: '选择用户身份', style: 'width: 160px' },
    options: [
      { label: '普通用户', value: 'user' },
      { label: '管理员', value: 'admin' }
    ]
  },
  { prop: 'coins', label: '金币', component: 'el-input-number', props: { min: 0 } },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    props: { placeholder: '选择状态', style: 'width: 160px' },
    options: [
      { label: '禁用', value: 0 },
      { label: '激活', value: 1 }
    ]
  }
]
