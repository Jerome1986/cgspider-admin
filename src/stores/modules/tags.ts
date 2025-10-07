import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  aittribuleAllApi,
  aittribuleTagGetApi,
  colorTagAllApi,
  colorTagGetApi,
  searchAittribuleTagApi,
} from '@/api/tag.ts'
import type { TagAittribuleItem, TagColorItem } from '@/types/Tags'

interface Options {
  label: string
  value: string
}

export const useTagStore = defineStore(
  'cgs-tags',
  () => {
    const aittribuleTagTotal = ref(0)
    //  属性标签
    const aittributeTag = ref<TagAittribuleItem[]>([])
    // 获取属性标签
    const aittribuleTagGet = async (
      type: string,
      pageNum: number,
      pageSize: number,
    ) => {
      const res = await aittribuleTagGetApi(type, pageNum, pageSize)
      console.log('标签结果', res.data)
      aittributeTag.value = res.data.list
      aittribuleTagTotal.value = res.data.total
    }
    // 根据类型一次性获取属性标签---用于选择器

    const aittribuleOptions = ref<Options[]>([])
    const aittribuleAll = async (type: string) => {
      const res = await aittribuleAllApi(type)
      aittribuleOptions.value = res.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))
    }
    // 根据类型和标签名称搜索属性标签
    const searchAittribuleTagTotal = async (
      type: string,
      searchVal: string,
      pageNum: number,
      pageSize: number,
    ) => {
      const res = await searchAittribuleTagApi(
        type,
        searchVal,
        pageNum,
        pageSize,
      )
      aittribuleTagTotal.value = res.data.total
      aittributeTag.value = res.data.list
    }

    /**
     * ----------------------------------  颜色标签 ------------------------------
     */

    // 获取所有颜色标签
    const colorList = ref<TagColorItem[]>([])
    const colorTotal = ref(0)

    const getColorTagList = async (
      type: string,
      pageNum: number,
      pageSize: number,
    ) => {
      const res = await colorTagGetApi(type, pageNum, pageSize)
      console.log('获取', res.data)
      colorList.value = res.data.list
      colorTotal.value = res.data.total
    }

    // 根据类型一次性获取所有的颜色标签--不带分页
    const colorOptions = ref<Options[]>([])
    const colorAllGet = async (type: string) => {
      const res = await colorTagAllApi(type)
      console.log('颜色', res.data)
      colorOptions.value = res.data.map((item) => ({
        label: item.color,
        value: item.color,
      }))
    }

    return {
      aittribuleTagTotal,
      aittributeTag,
      aittribuleTagGet,
      searchAittribuleTagTotal,
      aittribuleOptions,
      aittribuleAll,
      colorList,
      colorTotal,
      getColorTagList,
      colorOptions,
      colorAllGet,
    }
  },
  {
    persist: true,
  },
)
