<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/VipPro'
import { addProduct, updateProduct } from '@/api/vipPro.ts'

// 表单
const formRef = ref()
const dialogVisible = ref(false)

// 准备数据和校验规则
const formModel = ref<Product>({
  _id: '',
  dailyDownloadLimit: '',
  description: '',
  en_description: '',
  en_name: '',
  en_productType: '',
  goldCoinsAmount: 0,
  membershipType: '',
  price: 0,
  productName: '',
  productType: ''
})

// 商品类型菜单
const optionsTypes = ref([
  { label: '金币充值', value: 'gold' },
  { label: '购买会员', value: 'membership' }
])

// 会员类型菜单
const membershipTypes = ref([
  { label: '年费会员', value: 'annual' },
  { label: '永久会员', value: 'permanent' }
])

// 表单规则
const rules = ref({
  productType: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }]
})

// 提交表单
const emit = defineEmits(['success'])
const onSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    if (formModel.value._id) {
      // 编辑更新
      await updateProduct(formModel.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await addProduct(formModel.value)
      ElMessage.success('添加成功')
    }

    // 关闭弹窗
    dialogVisible.value = false
    // 提交成功通知父组件刷新列表
    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 打开弹窗时根据添加/编辑来重置/回显数据
const open = (row: Product) => {
  dialogVisible.value = true

  // 设置表单数据
  formModel.value = {
    _id: row._id,
    dailyDownloadLimit: row.dailyDownloadLimit,
    description: row.description,
    en_description: row.en_description,
    en_name: row.en_name,
    en_productType: row.en_productType,
    goldCoinsAmount: row.goldCoinsAmount,
    membershipType: row.membershipType,
    price: row.price,
    productName: row.productName,
    productType: row.productType
  }
}

// 将弹窗打开的方法暴露给父组件
defineExpose({
  open
})
</script>

<template>
  <div class="channelAdd">
    <el-dialog v-model="dialogVisible" :title="formModel._id ? '编辑用户' : '添加用户'" width="30%">
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-width="100px"
        style="padding-right: 30px"
      >
        <el-form-item label="商品类型" prop="productType" required>
          <el-select
            v-model="formModel.productType"
            placeholder="请选择商品的类型"
            style="width: 240px"
          >
            <el-option
              v-for="item in optionsTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="productName" required>
          <el-input v-model="formModel.productName"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="en_name">
          <el-input v-model="formModel.en_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="price" required>
          <el-input v-model.number="formModel.price" type="number" />
        </el-form-item>
        <el-form-item
          label="金币数量"
          prop="goldCoinsAmount"
          v-if="formModel.productType === 'gold'"
        >
          <el-input v-model.number="formModel.goldCoinsAmount" type="number" />
        </el-form-item>
        <el-form-item
          label="会员类型"
          prop="membershipType"
          v-if="formModel.productType === 'membership'"
        >
          <el-select
            v-model="formModel.membershipType"
            placeholder="请选择会员的类型"
            style="width: 240px"
          >
            <el-option
              v-for="item in membershipTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="下载额度"
          prop="dailyDownloadLimit"
          v-if="formModel.productType === 'membership'"
        >
          <el-input v-model.number="formModel.dailyDownloadLimit" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description" required>
          <el-input v-model.number="formModel.description" />
        </el-form-item>
        <el-form-item label="英文描述" prop="en_description">
          <el-input v-model.number="formModel.en_description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
