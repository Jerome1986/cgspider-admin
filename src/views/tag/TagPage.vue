<script setup lang="ts"></script>

<template>
  <section class="tag-page">
    <el-alert
      class="tag-notice"
      title="属性标签和颜色标签为所有素材类型共享的字典，修改会影响所有类型。"
      type="info"
      :closable="false"
      show-icon
    />
    <div class="tag-content"><router-view /></div>
  </section>
</template>

<style scoped lang="scss">
.tag-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}
.tag-notice {
  flex-shrink: 0;
  padding: 12px 16px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  color: #43566b;
}
.tag-content {
  flex: 1;
  min-height: 0;
  min-width: 0;
}
// 只调整标签页面的卡片头部，避免改变其他管理页面的工具栏。
.tag-content :deep(.page-container > .el-card__header > .header) {
  flex-wrap: wrap;
  gap: 16px 24px;
}
.tag-content :deep(.header > .extra) {
  min-width: 0;
  max-width: 100%;
}
.tag-content :deep(.tag-toolbar) {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  max-width: 100%;
}
.tag-content :deep(.tag-actions) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}
.tag-content :deep(.tag-actions .list) {
  flex-wrap: wrap;
  gap: 8px;
}
.tag-content :deep(.tag-actions .item),
.tag-content :deep(.tag-actions > .el-button) {
  flex-shrink: 0;
  white-space: nowrap;
}
.tag-content :deep(.tag-search) {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 0;
  max-width: 100%;
}
.tag-content :deep(.tag-search .el-input) {
  min-width: 0;
}
@media (max-width: 900px) {
  .tag-content :deep(.header > .extra) {
    width: 100%;
  }
  .tag-content :deep(.tag-toolbar) {
    align-items: stretch;
  }
  .tag-content :deep(.tag-actions) {
    justify-content: flex-start;
  }
}
</style>
