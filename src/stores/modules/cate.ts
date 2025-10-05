import { defineStore } from 'pinia'
import { ref } from 'vue'
import { cateAllGetApi, cateListGetApi, searchCateApi } from '@/api/cate.ts'
import type { CateEditForm, Category, CategoryPageResult } from '@/types/Cate.ts'

export const useCateStore = defineStore(
  'cgs-cate',
  () => {
    const total = ref(0) // 一级总数
    const subTotal = ref(0) // 二级总数
    const thirdTotal = ref(0) // 三级总数

    const cateList = ref<CateEditForm[]>([]) // 一级分类
    const subCateList = ref<Category[]>([]) // 二级分类
    const thirdCateList = ref<Category[]>([]) // 三级分类

    // 根据等级来赋值分类
    const levelGet = (level: number, result: CategoryPageResult) => {
      switch (level) {
        case 1:
          cateList.value = result.list
          total.value = result.total
          break
        case 2:
          subCateList.value = result.list
          subTotal.value = result.total
          break
        case 3:
          thirdCateList.value = result.list
          thirdTotal.value = result.total
          break
      }
    }

    // 获取当前页面的分类--根据上级id获取分类
    const cateListGet = async (
      type: string,
      pageNum: number,
      pageSize: number,
      level: number = 1,
      parentId: string | null = null
    ) => {
      const res = await cateListGetApi(type, pageNum, pageSize, parentId)
      console.log('子级分类', res.data, level)
      levelGet(level, res.data)
    }
    // 当前页面的父级分类
    const topCateList = ref<Category[]>([])
    const topCateCurrentId = ref('')
    const setTopCurrentId = (id: string) => {
      topCateCurrentId.value = id
    }

    // 根据层级获取所有上级分类
    const topCateListGet = async (
      type: string,
      pageNum: number,
      pageSize: number,
      level: number = 1
    ) => {
      console.log('类型', type)
      try {
        // 统一处理参数
        const res = await cateAllGetApi(type, level)
        const list = res.data || []

        console.log('分类', list)

        // 更新状态
        topCateList.value = list
        if (!list.length) return

        // 取第一个分类作为当前分类
        topCateCurrentId.value = list[0]!._id
      } catch (error) {
        console.error('获取父级分类失败:', error)
      }
    }

    // 搜索分类
    const searchCateListGet = async (
      type: string,
      searchVal: string,
      pageNum: number,
      pageSize: number,
      parentId: string | null = null,
      level: number = 1
    ) => {
      const res = await searchCateApi(type, searchVal, pageNum, pageSize, parentId)
      levelGet(level, res.data)
    }

    return {
      cateList,
      subCateList,
      thirdCateList,
      cateListGet,
      total,
      subTotal,
      thirdTotal,
      topCateList,
      topCateCurrentId,
      setTopCurrentId,
      topCateListGet,
      searchCateListGet
    }
  },
  {
    persist: true
  }
)
