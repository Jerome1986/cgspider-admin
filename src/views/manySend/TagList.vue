<script setup lang="ts">
import { useTagStore, useMenuStore } from '@/stores'
import { watch, onMounted } from 'vue'

const tagStore = useTagStore()
const menuStore = useMenuStore()

const props = defineProps<{
  type?: string
}>()

const emit = defineEmits(['click:tagItem'])

// 处理标签点击
const handleTag = (tag_id: string) => {
  emit('click:tagItem', tag_id)
}

// 根据类型获取标签
const loadTags = async (type: string) => {
  await tagStore.aittribuleAll(type)
}

// 监听类型变化
watch(
  () => props.type,
  (newType) => {
    if (newType) {
      loadTags(newType)
    }
  },
  { immediate: true }
)

// 如果没有传入 type，使用当前菜单类型
onMounted(async () => {
  if (!props.type) {
    await loadTags(menuStore.currentMenu)
  }
})
</script>

<template>
  <div class="tagList">
    <div class="title">选择标签:</div>
    <div class="list">
      <div
        class="tagItem"
        v-for="item in tagStore.aittribuleOptions"
        :key="item.value"
        :class="{ tagItemActive: (item as any).isActive }"
        @click="handleTag(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*标签*/
.tagList {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;

  .title {
    margin-right: 20px;
    width: fit-content;
  }

  .list {
    flex: 1;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;

    .tagItem {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgb(222, 222, 222);
      cursor: pointer;
    }

    .tagItemActive {
      border: 1px solid #409eff;
    }
  }
}
</style>
