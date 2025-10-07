import { useTagStore } from '@/stores'

const tagStore = useTagStore()

// 通过ID找对应名称
export const getTagName = (id: string) => {
  const tag = tagStore.aittribuleOptions.find((t) => t.value === id)
  return tag ? tag.label : '未知标签'
}
