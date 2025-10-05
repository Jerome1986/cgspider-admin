// 角色转换
export const formatStatus = (status: number) => {
  switch (status) {
    case 0:
      return '禁用'
    case 1:
      return '正常'
  }
}
