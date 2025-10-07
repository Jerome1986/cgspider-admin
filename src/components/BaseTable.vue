<!-- BaseTable.vue -->
<script setup lang="ts">
import { type Component } from 'vue'
import PageContainer from '@/components/PageContainer.vue'

export interface Action<T = unknown> {
  label?: string
  icon?: Component
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  circle?: boolean
  plain?: boolean
  onClick: (row: T) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowAction = Omit<Action, 'onClick'> & { onClick: (row: any) => void }

export interface ColumnDef {
  prop: string
  label: string
  width?: string | number
  slot?: string
  formatter?: (cellValue: unknown, row: unknown) => unknown
  component?: string | Component
}

// props（去掉 page / pageSize，避免和 defineModel 冲突）
withDefaults(
  defineProps<{
    data: unknown[]
    columns: ColumnDef[]
    actions?: RowAction[]
    showIndex?: boolean
    indexMethod?: (index: number) => number
    showPagination?: boolean
    total?: number
    pageTitle: string
    loading?: boolean
  }>(),
  {
    showIndex: true,
    showPagination: true,
    total: 0
  }
)

const emit = defineEmits<{
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}>()

// 分页用 v-model 双向绑定
const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

function onSizeChange(size: number) {
  pageSize.value = size
  emit('size-change', size)
}

function onCurrentChange(p: number) {
  page.value = p
  emit('current-change', p)
}
</script>
<template>
  <PageContainer :title="pageTitle">
    <!--  搜索框  -->
    <template #extra>
      <slot name="extra" />
      <slot name="default"></slot>
    </template>
    <template #content>
      <slot name="content" />
    </template>
    <el-table :data="data" v-bind="$attrs" style="width: 100%; height: 100%" v-loading="loading">
      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
        :index="indexMethod"
      />

      <!-- 动态列 -->
      <el-table-column
        v-for="col in columns"
        :key="String(col.prop)"
        :prop="String(col.prop)"
        :label="col.label"
        :width="col.width"
        align="center"
      >
        <template v-slot="scope">
          <span v-if="!col.slot">
            {{
              col.formatter ? col.formatter(scope.row[col.prop], scope.row) : scope.row[col.prop]
            }}
          </span>
          <slot v-else :name="col.slot" v-bind="scope"></slot>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="$slots.actions || actions?.length"
        label="操作"
        width="180"
        align="center"
      >
        <template v-slot="scope">
          <slot v-if="$slots.actions" name="actions" v-bind="scope" />
          <template v-else>
            <template v-for="action in actions" :key="String(action.label) + String(action.icon)">
              <!-- 有文字 -->
              <el-button
                v-if="action.label"
                size="small"
                :type="action.type || 'text'"
                :icon="action.icon"
                :circle="action.circle"
                :plain="action.plain"
                @click="action.onClick(scope.row)"
                >{{ action.label }}</el-button
              >

              <!-- 无文字（纯图标） -->
              <el-button
                v-else
                size="small"
                :type="action.type || 'text'"
                :icon="action.icon"
                :circle="action.circle"
                :plain="action.plain"
                @click="action.onClick(scope.row)"
              />
            </template>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" style="margin-top: 16px; text-align: right">
      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        layout="total, prev, pager, next, sizes"
        :total="total"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[1, 10, 20, 50, 100]"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>
  </PageContainer>
</template>

<style lang="less" scoped></style>
