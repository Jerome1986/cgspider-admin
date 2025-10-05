// formatTime.js

/**
 * 格式化时间
 * @param  date - 需要格式化的日期对象、时间字符串或时间戳
 * @param  format - 格式化字符串，默认是 'YYYY-MM-DD HH:mm:ss'
 */
export function formatTime(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '无'
  // 如果 date 是字符串或数字，先转换为 Date 对象
  if (typeof date === 'string') {
    date = new Date(date)
  }

  // 检查是否是有效的 Date 对象
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
