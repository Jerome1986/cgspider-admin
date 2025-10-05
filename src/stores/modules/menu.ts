import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuList } from '@/conifg/menu.ts'

export const useMenuStore = defineStore(
  'cgs-menu',
  () => {
    const currentMenu = ref(menuList[0]!.name as string)

    const setCurrentMenu = (name: string) => {
      currentMenu.value = name
    }

    return {
      currentMenu,
      setCurrentMenu
    }
  },
  {
    persist: true
  }
)
