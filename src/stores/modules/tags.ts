import { defineStore } from 'pinia'
import { ref } from 'vue'
import { aittribuleTagGetApi, searchAittribuleTagApi } from '@/api/tag.ts'
import type { TagAittribuleItem } from '@/types/Tags'

export const useTagStore = defineStore(
  'cgs-tags',
  () => {
    const aittribuleTagTotal = ref(0)
    //  属性标签
    const aittributeTag = ref<TagAittribuleItem[]>([])
    // 获取属性标签
    const aittribuleTagGet = async (type: string, pageNum: number, pageSize: number) => {
      const res = await aittribuleTagGetApi(type, pageNum, pageSize)
      console.log('标签结果', res.data)
      aittributeTag.value = res.data.list
      aittribuleTagTotal.value = res.data.total
    }

    // 根据类型和标签名称搜索标签
    const searchAittribuleTagTotal = async (
      type: string,
      searchVal: string,
      pageNum: number,
      pageSize: number
    ) => {
      const res = await searchAittribuleTagApi(type, searchVal, pageNum, pageSize)
      aittribuleTagTotal.value = res.data.total
      aittributeTag.value = res.data.list
    }

    return {
      aittribuleTagTotal,
      aittributeTag,
      aittribuleTagGet,
      searchAittribuleTagTotal
    }
  },
  {
    persist: true
  }
)
