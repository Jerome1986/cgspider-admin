<script setup lang="ts">
import type { Category } from '@/types/Cate.ts'
import { useCateStore } from '@/stores'

defineProps<{
  list: Category[]
}>()

const cateStore = useCateStore()

// 提交切换事件
const emit = defineEmits(['changeCate'])
const handleChangeCate = (cateId: string) => {
  emit('changeCate', cateId)
}
</script>

<template>
  <div class="list">
    <div class="title">父级分类</div>
    <div
      class="item"
      v-for="item in list"
      :key="item._id"
      :class="{ itemActive: cateStore.topCateCurrentId === item._id }"
      @click="handleChangeCate(item._id)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.list {
  margin-top: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .title {
    font-size: 14px;
    color: $cgs-font-dec;
  }

  .item {
    font-size: 14px;
    padding: 4px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .itemActive {
    border: 1px solid $cgs-brandColor;
    color: $cgs-brandColor;
  }
}
</style>
