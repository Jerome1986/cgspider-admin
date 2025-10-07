<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import { computed, onMounted, ref } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { materialAddOneApi } from '@/api/materia.ts'
import TagList from './TagList.vue'
import { menuList } from '@/conifg/menu.ts'
import { useCateStore, useMenuStore, useTagStore } from '@/stores'
import type { Category } from '@/types/Cate'

// 定义标签激活状态接口
interface OptionWithActive {
  label: string
  value: string
  isActive?: boolean
}

// 定义 stores
const menuStore = useMenuStore()
const cateStore = useCateStore()
const tagStore = useTagStore()

// 页面类型
const pageType = ref(menuStore.currentMenu)

// 类型发生改变时
const handleTypeChange = async () => {
  // 重置分类选择
  selectedTopCateId.value = ''
  selectedSubCateId.value = ''
  selectedThirdCateId.value = ''

  // 重置标签选择
  selectedTagIds.value.clear()
  tagStore.aittribuleOptions.forEach((tag) => {
    ;(tag as OptionWithActive).isActive = false
  })

  // 重新获取分类
  await getTopCateList()
}

// 分类相关
const selectedTopCateId = ref('')
const selectedSubCateId = ref('')
const selectedThirdCateId = ref('')

const allCateList = ref<Category[]>([]) // 存储所有分类

// 计算属性：筛选各级分类
const topCateList = computed(() => allCateList.value.filter((item) => item.level === 1))

const subCateList = computed(() =>
  allCateList.value.filter((item) => item.level === 2 && item.parentId === selectedTopCateId.value)
)

const thirdCateList = computed(() =>
  allCateList.value.filter((item) => item.level === 3 && item.parentId === selectedSubCateId.value)
)

// 根据页面类型获取所有分类（优化为一次性获取）
const getTopCateList = async () => {
  try {
    // 只获取一级分类
    await cateStore.topCateListGet(pageType.value, 1, 999)
    allCateList.value = [...cateStore.topCateList]

    // 批量获取所有二级和三级分类
    for (const topCate of cateStore.topCateList) {
      await cateStore.cateListGet(pageType.value, 1, 999, 2, topCate._id)
      allCateList.value.push(...cateStore.subCateList)

      // 获取三级分类
      for (const subCate of cateStore.subCateList) {
        await cateStore.cateListGet(pageType.value, 1, 999, 3, subCate._id)
        allCateList.value.push(...cateStore.thirdCateList)
      }
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类失败')
  }
}

// 分类改变处理
const handleTopCateChange = (value: string) => {
  selectedTopCateId.value = value
  selectedSubCateId.value = ''
  selectedThirdCateId.value = ''
}

const handleSubCateChange = (value: string) => {
  selectedSubCateId.value = value
  selectedThirdCateId.value = ''
}

const handleThirdCateChange = (value: string) => {
  selectedThirdCateId.value = value
}

// 标签相关
const selectedTagIds = ref<Set<string>>(new Set())

const handleTagItem = (tagId: string) => {
  // 切换标签选中状态
  if (selectedTagIds.value.has(tagId)) {
    selectedTagIds.value.delete(tagId)
  } else {
    selectedTagIds.value.add(tagId)
  }

  // 更新标签激活状态（用于UI显示）
  const tag = tagStore.aittribuleOptions.find((t) => t.value === tagId) as OptionWithActive
  if (tag) tag.isActive = !tag.isActive
}

const activeTagIds = computed(() => Array.from(selectedTagIds.value))

// 上传文件列表
const fileList = ref<
  Array<{
    uid: string
    name: string
    size: number
    raw: File
  }>
>([])

// 修改上传状态，添加进度条相关字段
const uploadStatus = ref({
  uploading: false,
  total: 0,
  current: 0,
  success: 0,
  failed: 0,
  currentFile: null as string | null,
  currentProgress: 0
})

// 结果提示信息
const resultTips = ref({
  show: false,
  type: 'success' as 'success' | 'warning' | 'error',
  uploadSuccess: 0,
  uploadFailed: 0,
  publishSuccess: 0,
  publishFailed: 0,
  totalFiles: 0,
  successFolders: [] as string[], // 成功的文件夹名
  failedFolders: [] as string[] // 失败的文件夹名
})

// 根据文件名分组
const fileGroups = computed(() => {
  const groups: Record<string, typeof fileList.value> = {}

  fileList.value.forEach((file) => {
    // 提取文件名（不含扩展名）作为分组依据
    const fileName = file.name.split('.')[0]
    if (fileName) {
      if (!groups[fileName]) {
        groups[fileName] = []
      }
      groups[fileName]?.push(file)
    }
  })

  return groups
})

// 分组后的文件列表（用于显示）
const groupedFiles = computed(() =>
  Object.entries(fileGroups.value).map(([groupName, files]) => ({
    groupName,
    files
  }))
)

// 移除整个文件夹
const handleRemoveFolder = (folderName: string) => {
  fileList.value = fileList.value.filter((file) => file.name.split('.')[0] !== folderName)
}

// 添加上传队列状态管理
interface UploadQueueItem {
  file: (typeof fileList.value)[0]
  folderName: string
  status: 'pending' | 'uploading' | 'success' | 'failed'
  result: {
    fileName: string
    folderName: string
    url?: string
    error?: string
    success: boolean
  } | null
  retries: number
}

const uploadQueue = ref<UploadQueueItem[]>([])
const failedUploads = ref<UploadQueueItem[]>([])

// 准备上传队列
const prepareUploadQueue = (folderGroups: Record<string, typeof fileList.value>) =>
  Object.entries(folderGroups).flatMap(([folderName, files]) =>
    files.map((file) => ({
      file,
      folderName,
      status: 'pending' as const,
      result: null,
      retries: 0
    }))
  )

// 上传单个文件
const uploadFile = async (
  file: (typeof fileList.value)[0],
  folderName: string,
  retryCount = 0
): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file.raw)

    // 添加分类信息
    formData.append('type', pageType.value)
    formData.append('topCate', selectedTopCateId.value)
    formData.append('subCate', selectedSubCateId.value || '')
    formData.append('folderName', folderName)

    // 设置当前正在上传的文件
    uploadStatus.value.currentFile = file.name
    uploadStatus.value.currentProgress = 0

    // 发送上传请求，添加进度监控
    const response = await axios.post(
      'https://etnrve3alw.gzg.sealos.run/material-upload-files',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadStatus.value.currentProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
        }
      }
    )

    // 上传成功
    uploadStatus.value.success++
    uploadStatus.value.currentProgress = 100
    return response.data
  } catch (error) {
    console.error('上传文件失败:', error)
    if (retryCount < 3) {
      // 最多重试3次
      console.log(`重试上传文件 ${file.name}，第 ${retryCount + 1} 次尝试`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1))) // 递增等待时间
      return uploadFile(file, folderName, retryCount + 1)
    }
    uploadStatus.value.failed++
    throw error
  } finally {
    uploadStatus.value.current++
  }
}

// 顺序上传文件
const uploadFilesSequentially = async (folderGroups: Record<string, typeof fileList.value>) => {
  // 如果上传队列为空，说明是新的上传任务
  if (uploadQueue.value.length === 0) {
    uploadQueue.value = prepareUploadQueue(folderGroups)
  }

  // 设置正确的总文件数
  const totalFiles = Object.values(folderGroups).reduce((acc, files) => acc + files.length, 0)
  uploadStatus.value.total = totalFiles || uploadQueue.value.length

  const uploadResults: Array<{
    fileName: string
    folderName: string
    url?: string
    error?: string
    success: boolean
  }> = []

  for (const item of uploadQueue.value) {
    if (item.status === 'success') {
      // 跳过已经成功的文件
      if (item.result) {
        uploadResults.push(item.result)
      }
      continue
    }

    try {
      item.status = 'uploading'
      const result = await uploadFile(item.file, item.folderName)
      item.status = 'success'
      item.result = {
        fileName: item.file.name,
        folderName: item.folderName,
        url: result,
        success: true
      }
      uploadResults.push(item.result)
    } catch (error) {
      item.status = 'failed'
      item.result = {
        fileName: item.file.name,
        folderName: item.folderName,
        error: (error as Error).message,
        success: false
      }
      uploadResults.push(item.result)
      failedUploads.value.push(item)
    }
    // 每个文件上传完成后等待一小段时间，确保UI更新
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return uploadResults
}

// 重试失败的上传
const retryFailedUploads = async () => {
  if (failedUploads.value.length === 0) {
    ElMessage.info('没有失败的上传需要重试')
    return
  }

  // 重置失败文件的状态
  failedUploads.value.forEach((item) => {
    item.status = 'pending'
    item.retries = 0
  })

  // 将失败的文件重新加入上传队列
  uploadQueue.value = failedUploads.value
  failedUploads.value = []

  // 重新开始上传
  return handleSend(true)
}

// 检查文件是否为图片
const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const lowerFileName = fileName.toLowerCase()
  return imageExtensions.some((ext) => lowerFileName.endsWith(ext))
}

// 从结果中找出最合适的封面图
const findBestCoverImage = (results: Array<{ fileName: string; url?: string; success: boolean }>) =>
  results.find((r) => r.success && isImageFile(r.fileName)) ||
  results.find((r) => r.success) ||
  results[0]

// 处理上传
const handleSend = async (isRetry = false) => {
  if (!isRetry && fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  if (!pageType.value || !selectedTopCateId.value) {
    ElMessage.warning('请选择分类')
    return
  }

  try {
    if (!isRetry) {
      await ElMessageBox.confirm(
        `确定要上传 ${fileList.value.length} 个文件吗？将自动按文件名分组创建文件夹。`,
        '上传确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    }

    // 重置上传状态
    uploadStatus.value = {
      uploading: true,
      total: isRetry ? uploadQueue.value.length : fileList.value.length,
      current: 0,
      success: 0,
      failed: 0,
      currentFile: null,
      currentProgress: 0
    }

    // 显示加载指示器
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在上传文件...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 顺序上传文件
    const uploadResults = await uploadFilesSequentially(fileGroups.value)

    // 关闭加载指示器
    loadingInstance.close()

    // 重置上传状态，但保持失败记录
    uploadStatus.value.uploading = false

    // 按文件夹分组处理发布
    const folderGroups: Record<
      string,
      {
        files: typeof uploadResults
        hasFailure: boolean
      }
    > = {}
    const failedFolders = new Set<string>() // 记录失败的文件夹

    // 先按文件夹分组
    uploadResults.forEach((result) => {
      if (!folderGroups[result.folderName]) {
        folderGroups[result.folderName] = {
          files: [],
          hasFailure: false
        }
      }
      folderGroups[result.folderName]?.files.push(result)
      if (!result.success) {
        const group = folderGroups[result.folderName]
        if (group) {
          group.hasFailure = true
        }
        failedFolders.add(result.folderName)
      }
    })

    // 处理每个文件夹的发布
    let publishSuccessCount = 0
    let publishFailCount = 0
    const successFoldersList: string[] = []
    const failedFoldersList: string[] = []

    for (const [folderName, group] of Object.entries(folderGroups)) {
      // 如果文件夹中有失败的文件，跳过发布
      if (group.hasFailure) {
        publishFailCount++
        failedFoldersList.push(folderName)
        continue
      }

      try {
        // 找出最合适的封面图
        const coverFile = findBestCoverImage(group.files)

        if (!coverFile || !coverFile.url) {
          throw new Error('未找到有效的封面图')
        }

        // 调用添加素材API
        // 接口要求必填：name, en_name, cover_url, type
        await materialAddOneApi(
          selectedTopCateId.value,
          selectedSubCateId.value || '',
          selectedThirdCateId.value || '',
          folderName, // name - 必填
          folderName, // en_name - 必填，使用文件夹名作为英文名
          coverFile.url, // cover_url - 必填
          group.files
            .filter((result) => result !== coverFile && result.success && result.url)
            .map((result) => result.url as string)
            .join(','), // files_url
          activeTagIds.value, // aittributeTags
          [], // colorTags
          pageType.value // type - 必填
        )
        publishSuccessCount++
        successFoldersList.push(folderName)
      } catch (error) {
        console.error(`文件夹 ${folderName} 发布失败:`, error)
        publishFailCount++
        failedFolders.add(folderName)
        failedFoldersList.push(folderName)
      }
    }

    // 显示最终结果
    if (uploadStatus.value.failed === 0 && publishFailCount === 0) {
      // 全部成功
      resultTips.value = {
        show: true,
        type: 'success',
        uploadSuccess: uploadStatus.value.success,
        uploadFailed: 0,
        publishSuccess: publishSuccessCount,
        publishFailed: 0,
        totalFiles: uploadStatus.value.total,
        successFolders: successFoldersList,
        failedFolders: []
      }
      ElMessage.success(`所有 ${uploadStatus.value.total} 个文件上传并发布成功！`)
      // 清空所有列表
      uploadQueue.value = []
      failedUploads.value = []
      fileList.value = []
    } else {
      // 有失败的
      resultTips.value = {
        show: true,
        type: 'warning',
        uploadSuccess: uploadStatus.value.success,
        uploadFailed: uploadStatus.value.failed,
        publishSuccess: publishSuccessCount,
        publishFailed: publishFailCount,
        totalFiles: uploadStatus.value.total,
        successFolders: successFoldersList,
        failedFolders: failedFoldersList
      }

      // 保持失败的文件在列表中
      fileList.value = fileList.value.filter((file) => {
        const folderName = file.name.split('.')[0]
        return folderName && failedFolders.has(folderName)
      })

      ElMessage.warning(
        `上传完成：成功 ${uploadStatus.value.success} 个，失败 ${uploadStatus.value.failed} 个\n` +
          `发布完成：成功 ${publishSuccessCount} 个文件夹，失败 ${publishFailCount} 个文件夹`
      )
    }
  } catch (error) {
    // 用户取消上传或其他错误
    if (error !== 'cancel') {
      ElMessage.error('上传过程中发生错误: ' + (error as Error).message)
    }
    uploadStatus.value.uploading = false
  }
}

// 继续添加
const addFile = () => {
  // 触发文件选择
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement
    const files = Array.from(target.files || [])
    files.forEach((file) => {
      // 创建文件对象
      const fileObj = {
        uid: Date.now() + Math.random().toString(36).substring(2),
        name: file.name,
        size: file.size,
        raw: file
      }
      fileList.value.push(fileObj)
    })
  }
  input.click()
}

onMounted(async () => {
  // 初始化逻辑
  await getTopCateList()
  // 标签会由 TagList 组件自动加载
})
</script>

<template>
  <page-container title="批量发布">
    <!-- 结果提示 -->
    <el-alert
      v-if="resultTips.show"
      :type="resultTips.type"
      :closable="true"
      @close="resultTips.show = false"
      style="margin-bottom: 20px"
    >
      <template #title>
        <div style="font-size: 14px; font-weight: bold">
          {{ resultTips.type === 'success' ? '✅ 批量发布完成' : '⚠️ 批量发布完成（部分失败）' }}
        </div>
      </template>
      <div style="margin-top: 8px; line-height: 1.8">
        <div>
          📊 总文件数：<strong>{{ resultTips.totalFiles }}</strong> 个
        </div>
        <div>
          📤 上传结果：
          <span style="color: #67c23a">成功 {{ resultTips.uploadSuccess }} 个</span>
          <span v-if="resultTips.uploadFailed > 0" style="color: #f56c6c; margin-left: 10px">
            失败 {{ resultTips.uploadFailed }} 个
          </span>
        </div>
        <div>
          📦 发布结果：
          <span style="color: #67c23a">成功 {{ resultTips.publishSuccess }} 个文件夹</span>
          <span v-if="resultTips.publishFailed > 0" style="color: #f56c6c; margin-left: 10px">
            失败 {{ resultTips.publishFailed }} 个文件夹
          </span>
        </div>

        <!-- 成功的文件夹列表 -->
        <div v-if="resultTips.successFolders.length > 0" style="margin-top: 12px">
          <div style="font-weight: bold; color: #67c23a; margin-bottom: 4px">✅ 成功的文件夹：</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-left: 20px">
            <el-tag
              v-for="folder in resultTips.successFolders"
              :key="folder"
              type="success"
              size="small"
            >
              {{ folder }}
            </el-tag>
          </div>
        </div>

        <!-- 失败的文件夹列表 -->
        <div v-if="resultTips.failedFolders.length > 0" style="margin-top: 12px">
          <div style="font-weight: bold; color: #f56c6c; margin-bottom: 4px">❌ 失败的文件夹：</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-left: 20px">
            <el-tag
              v-for="folder in resultTips.failedFolders"
              :key="folder"
              type="danger"
              size="small"
            >
              {{ folder }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-alert>

    <!-- 分类选择 -->
    <div class="cateSelect">
      <div class="title">所属分类</div>
      <!-- 类型选择 -->
      <el-select
        v-model="pageType"
        @change="handleTypeChange"
        placeholder="Select"
        size="default"
        style="width: 240px; margin-right: 10px"
      >
        <el-option
          v-for="(item, index) in menuList"
          :key="index"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <!-- 一级分类 -->
      <el-select
        v-model="selectedTopCateId"
        @change="handleTopCateChange"
        placeholder="选择一级分类"
        size="default"
        style="width: 240px; margin-right: 10px"
      >
        <el-option
          v-for="item in topCateList"
          :key="item._id"
          :label="item.name"
          :value="item._id"
        />
      </el-select>
      <!-- 二级分类 -->
      <el-select
        v-model="selectedSubCateId"
        @change="handleSubCateChange"
        placeholder="选择二级分类"
        size="default"
        style="width: 240px; margin-right: 10px"
      >
        <el-option
          v-for="item in subCateList"
          :key="item._id"
          :label="item.name"
          :value="item._id"
        />
      </el-select>
      <!-- 三级分类 -->
      <el-select
        v-model="selectedThirdCateId"
        @change="handleThirdCateChange"
        placeholder="选择三级分类"
        size="default"
        style="width: 240px; margin-right: 10px"
      >
        <el-option
          v-for="item in thirdCateList"
          :key="item._id"
          :label="item.name"
          :value="item._id"
        />
      </el-select>
    </div>
    <!--  提交按钮  -->
    <div class="submitBtn">
      <!--  发布上传  -->
      <el-button type="primary" @click="handleSend">发布上传</el-button>
      <!--  选择文件  -->
      <el-button @click="addFile">继续添加</el-button>
    </div>
    <!--  标签组件  -->
    <TagList :type="pageType" @click:tag-item="handleTagItem"></TagList>
    <!-- 文件显示 -->
    <div class="showFile">
      <div class="title">附件</div>
      <div class="fileContent">
        <!-- 上传进度显示 -->
        <div v-if="uploadStatus.uploading" class="upload-progress">
          <div class="progress-info">
            <span>正在上传: {{ uploadStatus.currentFile }}</span>
            <span>总进度: {{ uploadStatus.current }}/{{ uploadStatus.total }}</span>
          </div>
          <el-progress
            :percentage="uploadStatus.currentProgress"
            :status="uploadStatus.currentProgress === 100 ? 'success' : undefined"
          />
        </div>

        <!-- 失败文件重试按钮 -->
        <div v-if="!uploadStatus.uploading && failedUploads.length > 0" class="retry-failed">
          <el-alert title="部分文件上传失败" type="warning" :closable="false" show-icon>
            <template #default>
              <div class="retry-content">
                <div class="failed-files">
                  <div>失败文件列表：</div>
                  <div v-for="(file, index) in failedUploads" :key="index" class="failed-file">
                    {{ file.file.name }}
                  </div>
                </div>
                <el-button type="primary" size="small" @click="retryFailedUploads">
                  重试失败文件
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>

        <div class="fileItem" v-for="(item, index) in groupedFiles" :key="index">
          <!--   文件名   -->
          <div class="fileName">
            <div class="left">
              <img src="../../assets/fileIcon.png" alt="icon" style="width: 18px; height: 18px" />
              <div class="name">{{ item.groupName }}</div>
            </div>
            <div
              style="cursor: pointer; color: #999999"
              @click="handleRemoveFolder(item.groupName)"
            >
              删除
            </div>
          </div>
          <!--   文件内容   -->
          <div v-for="(file, fileIndex) in item.files" :key="fileIndex" class="file">
            {{ file.name }}
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="fileList.length === 0" class="empty-files">
          <el-empty description="暂无文件，请点击'继续添加'选择文件" />
        </div>
      </div>
    </div>
  </page-container>
</template>

<style scoped lang="scss">
.page-container {
  /*分类选择*/
  .cateSelect {
    display: flex;

    .title {
      margin-right: 20px;
      width: fit-content;
      height: 32px;
      line-height: 32px;
      text-align: start;
    }
  }

  /*提交上传*/
  .submitBtn {
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    width: 100%;
  }

  /*文件选择*/
  .showFile {
    display: flex;
    margin-top: 20px;

    .title {
      margin-right: 20px;
      width: 80px;
      height: fit-content;
      text-align: end;
    }

    /*文件内容*/
    .fileContent {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      flex: 1;
      padding: 16px;
      background-color: #f8f8f8;

      /*上传进度显示*/
      .upload-progress {
        width: 100%;
        padding: 16px;
        background-color: #ffffff;
        border-radius: 8px;
        margin-bottom: 16px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #606266;
          font-size: 14px;
        }
      }

      /*失败文件重试*/
      .retry-failed {
        width: 100%;
        margin-bottom: 16px;

        .retry-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 8px;

          .failed-files {
            flex: 1;
            margin-right: 16px;

            .failed-file {
              color: #f56c6c;
              margin-top: 4px;
              font-size: 13px;
            }
          }
        }
      }

      /*每一项文件*/
      .fileItem {
        padding: 16px;
        width: 300px;
        border-radius: 8px;
        background-color: #ffffff;

        /*文件名*/
        .fileName {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #303133;

          /*名字和图标*/
          .left {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        /* 文件列表项 */
        .file {
          margin-top: 8px;
          background-color: #fafafa;
          padding: 8px;
          color: #a8a8a8;
          font-size: 14px;
        }
      }

      /* 空状态 */
      .empty-files {
        width: 100%;
        padding: 40px 0;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
