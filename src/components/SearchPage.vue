<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const emit = defineEmits(['search', 'clear'])

const searchValue = ref('')

// 搜索事件
const handleSearch = () => {
  console.log(searchValue.value)
  emit('search', searchValue.value)
}

// 清除搜索事件
const handleClearSearch = () => {
  emit('clear')
}
</script>

<template>
  <!--   搜索   -->
  <div class="search">
    <el-input
      v-model="searchValue"
      style="width: 240px; margin-right: 16px"
      placeholder="根据分类名称搜索"
      :prefix-icon="Search"
      clearable
      @clear="handleClearSearch"
      @keydown.enter="handleSearch"
    />
    <el-button type="primary" @click="handleSearch">查询</el-button>
  </div>
</template>

<style scoped lang="scss">
.search {
  margin-top: 20px;
  text-align: end;
}
</style>
