const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
test('批量发布显示木纹下的三级分类，切换父级后清空旧选择', async () => {
  const source = fs.readFileSync(path.join(root, 'src/views/manySend/ManySend.vue'), 'utf8')
    .split('<script setup lang="ts">')[1].split('</script>')[0]
  const code = ts.transpileModule(source + '\nexport { getTopCateList, thirdCateList, selectedThirdCateId, handleTopCateChange, handleSubCateChange }', {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText
  let calls = 0
  const imports = {
    '@/utils/request': {}, '@/api/materia.ts': {}, '@/conifg/menu.ts': {},
    vue: { ref: (value) => ({ value }), computed: (get) => ({ get value() { return get() } }), onMounted: () => {} },
    'element-plus': { ElMessage: { error: (message) => { throw Error(message) } } },
    '@/stores': { useMenuStore: () => ({ currentMenu: '材质' }), useTagStore: () => ({}) },
    '@/api/cate': { cateAllApi: async () => {
      calls++
      return { data: [
        { _id: '1', name: '木材', level: 1, parentId: null },
        { _id: '2', name: '木纹', level: 2, parentId: '1' },
        { _id: '3', name: '橡木', level: 3, parentId: '2' },
        { _id: '4', name: '其他', level: 3, parentId: '99' }
      ] }
    } }
  }
  const exports = {}
  vm.runInNewContext(code, { exports, console, require: (name) => {
    if (!(name in imports)) throw Error('Unexpected import: ' + name)
    return imports[name]
  } })
  await exports.getTopCateList()
  assert.equal(calls, 1)
  exports.handleTopCateChange('1')
  exports.handleSubCateChange('2')
  assert.equal(exports.thirdCateList.value.length, 1)
  assert.equal(exports.thirdCateList.value[0].name, '橡木')
  exports.selectedThirdCateId.value = '3'
  exports.handleSubCateChange('99')
  assert.equal(exports.selectedThirdCateId.value, '')
  assert.equal(exports.thirdCateList.value[0]._id, '4')
  exports.handleTopCateChange('1')
  assert.equal(exports.thirdCateList.value.length, 0)
})
function load(file, imports) {
  const source = fs.readFileSync(path.join(root, file), 'utf8').replace('import.meta.env.VITE_API_BASE_URL', "'http://localhost:3000'")
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(code, { module, exports: module.exports, console, FormData, Map, URL,
    require: (name) => Object.hasOwn(imports, name) ? imports[name] : require(name) })
  return module.exports
}

test('管理员登录使用独立管理员接口并映射嵌套userInfo', async () => {
  const calls = []
  const api = load('src/api/login.ts', {
    '@/utils/request': { request: async (q) => { calls.push(q); return { code: 200, data: { token: 'jwt', userInfo: { id: 9, username: 'admin01', role: 'ADMIN', userAvatarUrl: '' } } } } },
    '@/utils/BaseInfo': { createDefaultUserInfo: () => ({}) }
  })
  const res = await api.loginApi('admin01', 'password')
  assert.equal(calls[0].url, '/api/admin/login')
  assert.equal(res.data._id, '9')
  assert.equal(res.data.role, 'admin')
  assert.equal(res.data.token, 'jwt')
})

test('分类树映射字符串ID、按父级分页，编辑保留排序，禁止隐式换父级', async () => {
  const calls = []
  const child = { id: 2, parentId: 1, name: '二级', enName: 'Child', type: '模型', level: 2, sort: 8, children: [] }
  const top = { id: 1, parentId: null, name: '一级', enName: 'Top', type: '模型', level: 1, sort: 9, children: [child] }
  const api = load('src/api/cate.ts', { '@/utils/request': { request: async (q) => { calls.push(q); return { code: 200, data: [top] } } } })
  const result = await api.cateListGetApi('模型', 1, 10, '1')
  assert.equal(result.data.list[0]._id, '2')
  assert.equal(result.data.total, 1)
  await api.cateEditApi('2', '新的二级', 'New', null, '1')
  assert.equal(calls.at(-1).method, 'PATCH')
  assert.equal(calls.at(-1).data.sort, 8)
  assert.throws(() => api.cateEditApi('2', 'x', 'X', null, null), /不支持/)
  await api.addCateApi('子级', 'Child', '模型', '1', '父级', 2)
  assert.equal(calls.at(-1).data.parentId, 1)
  assert.equal(calls.at(-1).data.level, undefined)
  await api.addCateApi('三级', 'Third', '模型', '2', '', 3, 12)
  assert.equal(calls.at(-1).data.sort, 12)
  await api.cateEditApi('2', '二级', 'Child', null, '1', 3)
  assert.equal(calls.at(-1).data.sort, 3)
})

test('素材编辑保留全部文件、将属性ID转换名称，新增不拼接文件地址', async () => {
  const calls = []
  const api = load('src/api/materia.ts', {
    './tag': { aittribuleAllApi: async () => ({ data: [{ _id: '5', name: '现代' }] }) },
    '@/utils/request': { request: async (q) => { calls.push(q); return { code: 200, data: { total: 1, list: [{ _id: '2', type: '模型', name: '沙发', en_name: 'Sofa', cover_url: 'https://example.com/c.png', top_id: '1', files_url: ['https://example.com/a.zip', 'https://example.com/b.zip'], tags: ['现代'], colors: ['#FFFFFF'] }] } } } }
  })
  const page = await api.materiaGetApi('模型', 1, 10)
  assert.equal(page.data.list[0].aittributeTags[0], '5')
  await api.materialUpdateApi(page.data.list[0])
  const body = calls.at(-1).data
  assert.deepEqual(Array.from(body.files_url), ['https://example.com/a.zip', 'https://example.com/b.zip'])
  assert.deepEqual(Array.from(body.tags), ['现代'])
  assert.equal(body.keywords, undefined)
  assert.equal(body.aittributeTags, undefined)
  assert.equal(calls.at(-1).method, 'PUT')
  await api.materialAddOneApi('1', '2', '3', 'x', 'X', 'https://example.com/c.png', ['https://example.com/a.zip'], [], [], '模型')
  assert.equal(calls.at(-1).data.third_id, '3')
  await api.materialUpdateApi({ ...page.data.list[0], sub_id: '2', third_id: '3' })
  assert.equal(calls.at(-1).data.third_id, '3')
})

test('余额调整带原值，启禁用独立调用，缺失原值拒绝写入', async () => {
  const calls = []
  const api = load('src/api/user.ts', { '@/utils/request': { request: async (q) => { calls.push(q); return { code: 200, data: {} } } } })
  await assert.rejects(api.userUpdateAPi('1', 'user', 'tester1', 20, 1), /原始余额/)
  assert.equal(calls.length, 0)
  await api.userUpdateAPi('1', 'user', 'tester1', 20, 0, 30)
  assert.equal(calls[0].data.id, 1)
  assert.equal(calls[0].data.expectedCoins, 30)
  assert.equal(calls[0].data.coins, 20)
  assert.equal(calls[0].data.status, undefined)
  assert.equal(calls[1].url, '/api/user-status-update')
})

test('商品从后台分页读取含下架商品，编辑不丢isActive；标签按新方法写入', async () => {
  const calls = []
  const request = async (q) => { calls.push(q); return { code: 200, data: { list: [{ _id: '1', isActive: false }], total: 1 } } }
  const api = load('src/api/vipPro.ts', { '@/utils/request': { request } })
  await api.productsGetApi()
  assert.equal(calls[0].url, '/api/admin/products')
  await api.updateProduct({ _id: '1', productType: '购买会员', membershipType: '永久会员', productName: '会员', price: 10, dailyDownloadLimit: '20', description: '会员', isActive: false })
  assert.equal(calls.at(-1).data.productType, 'membership')
  assert.equal(calls.at(-1).data.membershipType, 'permanent')
  assert.equal(calls.at(-1).data.dailyDownloadLimit, 20)
  assert.equal(calls.at(-1).data.isActive, false)
  assert.equal(calls.at(-1).data.en_productType, undefined)
  const tags = load('src/api/tag.ts', { '@/utils/request': { request } })
  await tags.updateColorTagApi('4', '#FFFFFF', '模型')
  assert.equal(calls.at(-1).method, 'PUT')
  assert.equal(calls.at(-1).data.type, undefined)
  assert.equal(calls.at(-1).data._id, '4')
})

test('上传携带管理员令牌且仅发送file；迟到401不退出新账号', async () => {
  const calls = [], user = { userInfo: { token: 'old' }, clearUserInfo: () => { user.userInfo.token = '' } }
  let rejectRequest
  const api = load('src/utils/request.ts', {
    '@/stores': { useUserStore: () => user },
    '@/router': { currentRoute: { value: { path: '/' } }, replace: async () => {} },
    'element-plus': { ElMessage: Object.assign(() => {}, { error: () => {} }) },
    axios: { isAxiosError: (e) => e.isAxiosError, request: async (q) => {
      calls.push(q)
      if (q.url.includes('upload')) return { data: 'https://example.com/image.png' }
      return new Promise((_, reject) => { rejectRequest = reject })
    } }
  })
  const url = await api.uploadAsset(new File(['test'], 'image.png'), true)
  assert.equal(url, 'https://example.com/image.png')
  assert.equal(calls[0].headers.Authorization, 'Bearer old')
  assert.deepEqual(Array.from(calls[0].data.keys()), ['file'])
  const pending = api.request({ url: '/api/admin/me' })
  user.userInfo.token = 'new'
  rejectRequest({ isAxiosError: true, response: { status: 401, data: { message: ['请登录'] } } })
  await assert.rejects(pending)
  assert.equal(user.userInfo.token, 'new')
})
