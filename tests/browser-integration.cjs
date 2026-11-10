// 构建产物页面测试：HTTP静态站点 + 隔离Electron浏览器会话 + 内存模拟API。
const { app, BrowserWindow, session } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..'), calls = [], errors = [], scenarios = []
const output = path.join(root, '.integration-result.json')
app.setPath('userData', path.join(root, '.integration-profile-' + Date.now()))
let win, server
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const js = (code) => win.webContents.executeJavaScript(code)
async function until(code) {
  for (let i = 0; i < 100; i++) { if (await js(code)) return; await pause(100) }
  throw new Error('UI condition timed out: ' + code)
}
const profile = { id: 1, username: 'admin01', role: 'ADMIN', displayName: '管理员', userAvatarUrl: '' }
const category = { id: 11, parentId: null, name: '分类', enName: 'Category', type: '模型', level: 1, sort: 2,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', children: [] }
app.whenReady().then(async () => {
  server = http.createServer((req, res) => {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/cgs\/?/, '')
    let file = path.resolve(root, 'dist', relative)
    const dist = path.join(root, 'dist')
    if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(dist, 'index.html')
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' }
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res)
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = 'http://127.0.0.1:' + server.address().port + '/cgs'
  const ses = session.fromPartition('admin-contract-' + Date.now())
  ses.protocol.handle('https', async (req) => {
    const url = new URL(req.url)
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' } })
    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await req.json() : undefined
    calls.push({ path: url.pathname, method: req.method, query: Object.fromEntries(url.searchParams), body,
      authenticated: req.headers.get('authorization') === 'Bearer admin-test-token' })
    let data
    switch (url.pathname) {
      case '/api/admin/login': data = { token: 'admin-test-token', userInfo: profile }; break
      case '/api/admin/me': data = profile; break
      case '/api/user-get': data = { list: [{ id: 2, username: 'testeruser', role: 'user', coins: 10, status: 1, createdAt: '2026-01-01T00:00:00.000Z', endDate: null }], total: 1 }; break
      case '/api/user-editInfo': case '/api/user-status-update': data = { acknowledged: true, matchedCount: 1 }; break
      case '/api/categories/tree': data = [{ ...category, type: url.searchParams.get('type') || '模型' }]; break
      case '/api/attributeTag-get': data = { list: [{ _id: '31', name: '现代', en_name: 'Modern' }], total: 1 }; break
      case '/api/colorTag-get': data = { list: [{ _id: '41', color: '#FFFFFF' }], total: 1 }; break
      case '/api/material-get': data = { list: [{ _id: '21', name: '沙发', en_name: 'Sofa', type: '模型', top_id: '11', sub_id: '', cover_url: '', files_url: ['https://example.com/a.zip','https://example.com/b.zip'], tags: ['现代'], colors: ['#FFFFFF'] }], total: 1 }; break
      case '/api/admin/products': data = { list: [{ _id: '51', productType: 'gold', productName: '下架金币商品', en_name: '', price: 10, goldCoinsAmount: 50, membershipType: '', dailyDownloadLimit: 0, description: '说明', en_description: '', isActive: false }], total: 1 }; break
      case '/api/user-order-get': data = { list: [], total: 0 }; break
      case '/api/watermark-get': data = { list: [], total: 0 }; break
      default: errors.push('Unknown API: ' + url.pathname); return new Response('Unknown route', { status: 404 })
    }
    return new Response(JSON.stringify({ code: 200, message: 'success', data }), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })
  })
  win = new BrowserWindow({ show: false, width: 1440, height: 1000, webPreferences: { session: ses, backgroundThrottling: false } })
  win.webContents.on('console-message', (event) => { if (event.level === 'error') errors.push(event.message) })
  await win.loadURL(base + '/login')
  await until("document.querySelectorAll('input').length>=2")
  await js(`(() => {const inputs=document.querySelectorAll('input');for(const [n,value] of ['admin01','password1'].entries()){inputs[n].value=value;inputs[n].dispatchEvent(new Event('input',{bubbles:true}))};[...document.querySelectorAll('button')].find(e=>e.textContent.includes('登录')).click()})()`)
  await until("document.body.textContent.includes('testeruser')")
  scenarios.push('管理员登录、会话恢复和用户列表')
  await js("document.querySelector('.el-table__body-wrapper button').click()")
  await until("document.querySelector('.el-dialog input') !== null")
  await js(`(() => {const item=[...document.querySelectorAll('.el-dialog .el-form-item')].find(e=>e.textContent.includes('金币'));const input=item.querySelector('input');input.value='20';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));[...document.querySelectorAll('.el-dialog button')].find(e=>e.textContent.includes('确认')).click()})()`)
  for(let n=0;n<100&&!calls.some(c=>c.path==='/api/user-editInfo');n++)await pause(100)
  const update=calls.find(c=>c.path==='/api/user-editInfo')
  assert.ok(update)
  assert.equal(update.body.id,2)
  assert.equal(update.body.coins,20)
  assert.equal(update.body.expectedCoins,10)
  scenarios.push('用户编辑提交原始余额并通过新接口写入模拟数据')
  for (const [route, endpoint] of [['/cate/category','/api/categories/tree'], ['/tag/attribute','/api/attributeTag-get'], ['/tag/color','/api/colorTag-get'], ['/material','/api/material-get'], ['/many','/api/categories/tree'], ['/vip','/api/admin/products'], ['/order','/api/user-order-get'], ['/watermark','/api/watermark-get']]) {
    const previous = calls.length
    await win.loadURL(base + route)
    for (let n = 0; n < 80 && !calls.slice(previous).some((c) => c.path === endpoint); n++) await pause(100)
    assert.ok(calls.slice(previous).some((c) => c.path === endpoint), 'Missing request for ' + route)
    await pause(200)
    scenarios.push(route)
  }
  // 两个标签页在宽窄窗口均不得遮挡提示、重叠按钮或溢出卡片头部。
  const layouts = []
  const screenshots = path.join(root, '.integration-layout')
  fs.mkdirSync(screenshots, { recursive: true })
  for (const route of ['/tag/attribute', '/tag/color']) {
    await win.loadURL(base + route)
    await until("document.querySelector('.tag-actions .item') !== null")
    for (const width of [1440, 1000, 760]) {
      win.setContentSize(width, 900)
      await pause(250)
      const bounds = await js(`(() => {
        const rect = (selector) => { const r=document.querySelector(selector).getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom} };
        const items=[...document.querySelectorAll('.tag-actions .item')];const last=items.at(-1).getBoundingClientRect();
        const button=rect('.tag-actions > button'), header=rect('.el-card__header');
        return {notice:rect('.tag-notice'),card:rect('.page-container'),header,button,
          separated:button.top>=last.bottom+12 || button.left>=last.right+12,
          fits:button.right<=header.right && button.left>=header.left,
          overflow:document.documentElement.scrollWidth>innerWidth};
      })()`)
      assert.ok(bounds.card.top >= bounds.notice.bottom + 15)
      assert.ok(bounds.separated, JSON.stringify(bounds))
      assert.ok(bounds.fits)
      assert.equal(bounds.overflow, false)
      layouts.push({ route, width, ...bounds })
      const picture=await win.webContents.capturePage()
      fs.writeFileSync(path.join(screenshots, route.endsWith('color') ? 'color-'+width+'.png' : 'attribute-'+width+'.png'),picture.toPNG())
    }
  }
  scenarios.push('属性与颜色标签在1440、1000、760像素窗口下布局无重叠')
  assert.ok(calls.filter((c) => c.path !== '/api/admin/login').every((c) => c.authenticated))
  assert.equal(errors.length, 0, errors.join('\n'))
  fs.writeFileSync(output, JSON.stringify({ passed: true, scenarios, requests: calls.length, calls, errors, layouts }, null, 2))
  win.destroy(); server.close(); app.quit()
}).catch((error) => {
  fs.writeFileSync(output, JSON.stringify({ passed: false, error: error.stack, scenarios, calls, errors }, null, 2))
  server?.close(); app.exit(1)
})
setTimeout(() => { fs.writeFileSync(output, JSON.stringify({ passed: false, error: 'deadline', calls, errors })); app.exit(2) }, 60000).unref()
