<script setup lang="ts">
defineProps({
  title: {
    required: true,
    type: String
  }
})
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <div>{{ title }}</div>
        <div class="extra">
          <slot name="extra"></slot>
        </div>
      </div>
      <div class="content">
        <slot name="content"></slot>
      </div>
    </template>
    <!-- 主体内容 -->
    <slot></slot>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
