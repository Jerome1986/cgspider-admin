<script setup lang="ts">
import { type MenuItem, menuList } from '@/conifg/menu.ts'
import { useMenuStore } from '@/stores'

const menuStore = useMenuStore()
// 提交页面类型点击事件
const emit = defineEmits(['changeType'])
const handleChange = (val: MenuItem) => {
  console.log(val)
  menuStore.setCurrentMenu(val.name)
  emit('changeType', val.name)
}
</script>

<template>
  <div class="list">
    <div
      class="item"
      v-for="item in menuList"
      :key="item.id"
      :class="{ itemActive: menuStore.currentMenu === item.name }"
      @click="handleChange(item)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.list {
  margin-right: 40px;
  display: flex;
  align-items: center;
  gap: 16px;

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
