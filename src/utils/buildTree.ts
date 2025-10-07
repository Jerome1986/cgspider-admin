import type { Category } from '@/types/Cate'

export interface CategoryNode extends Category {
  children?: CategoryNode[]
  label?: string
  value?: string
}

/**
 * 扁平分类数组转为树形结构
 */
export function buildTree(list: Category[]): CategoryNode[] {
  const map: Record<string, CategoryNode> = {}
  const tree: CategoryNode[] = []

  // 构建映射表
  list.forEach((item) => {
    map[item._id] = {
      ...item,
      value: item._id,
      label: item.name
    }
  })

  // 构建层级关系
  list.forEach((item) => {
    const node = map[item._id]
    if (!node) return // 安全防护：node 不存在就跳过

    if (item.parentId) {
      const parent = map[item.parentId]
      if (parent) {
        if (!parent.children) parent.children = [] // 只有有子时才创建
        parent.children!.push(node)
      } else {
        // parentId 无效的项，直接放顶层
        tree.push(node)
      }
    } else {
      // 没有 parentId 的就是顶级分类
      tree.push(node)
    }
  })

  return tree
}
