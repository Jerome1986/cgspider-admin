# cgspider-admin 与 cgs-api 对接

本轮仅修改 `cgspider-admin`；不覆盖相邻旧后台 `cgs`，不修改 Electron 封面加载策略，不修改数据库或执行生产写入。`cgs-api` 保留前一轮已有改动。

## 运行与部署

- `pnpm dev` 使用 `.env.development`，API 为 `http://localhost:3000`，需先启动本地 cgs-api。
- `pnpm build` 使用 `.env.production`，API 为 `https://api.topcg.top`，产物位于 `dist/`。
- Vite 资源和 history 路由保留 `/cgs/` 基路径。部署静态站点时需为 `/cgs/` 子路由配置回退到 `/cgs/index.html`，不要将接口请求重写为HTML。
- API根地址不附加 `/api`，接口函数声明完整路径；没有依赖旧 Sealos 域名的请求或上传。
- 登录使用独立管理员账号表；业务用户的 `admin` 角色不等同于后台管理员权限。服务端空管理员表的首次初始化遵循 cgs-api 现有实现，不在客户端伪造权限。
- 后台存储裸JWT，请求时加 `Authorization: Bearer …`。401仅清理发出该请求时的当前身份，网络异常不退出新登录身份。

## 契约映射

| 功能 | 当前接口 | 客户端处理 |
| --- | --- | --- |
| 管理员登录 / 会话恢复 | POST `/api/admin/login`、GET `/api/admin/me` | 将 token、userInfo.id 和 ADMIN 映射为现有界面状态；恢复页面重新核验 |
| 用户列表 / 搜索 | GET `/api/user-get` | pagesNum、pagesSize、keyword，数字id转字符串，endDate映射到到期时间 |
| 用户新增 / 编辑 / 状态 / 删除 | POST `/api/user-add`、PUT `/api/user-editInfo`、PUT `/api/user-status-update`、DELETE `/api/user-deleted` | 白名单字段，余额变更携带表单打开时的 expectedCoins；状态单独提交 |
| 分类列表 / 选择器 | GET `/api/categories/tree?type=…` | 完整树扁平化，转换id、enName和父级字段；按直属父级与关键词筛选后分页，不截取前100条冒充全部 |
| 分类写入 | POST `/api/categories`、PATCH / DELETE `/api/categories/:id` | 父级传数字，层级由后端计算；编辑保留sort，禁止隐式移动类型或父级 |
| 属性 / 颜色标签 | `/api/attributeTag-*`、`/api/colorTag-*` | 字典读取data.list；新增POST、修改PUT、删除DELETE，编号为_id，不发送旧type字段 |
| 素材列表 / 搜索 | GET `/api/material-get` | materialType、pagesNum、pagesSize、searchValue，使用管理员列表投影 |
| 素材写入 | POST `/api/material-add`、PUT `/api/material-update`、DELETE `/api/material-deleted` | 属性ID转换名称，颜色为色值；编辑保留完整files_url数组，删除用Query material_id |
| 上传 | POST `/api/material-upload-cover`、`/api/material-upload-files` | 带管理员令牌，multipart仅发送file，接收直接JSON字符串URL，上传不设客户端超时 |
| 商品 | GET `/api/admin/products`，POST `/api/products-add`，PUT `/api/products-update`，DELETE `/api/products-delete` | 后台逐页取全量，包含下架商品；金额与额度转数字，中文展示枚举转回原始值，保留isActive |
| 订单 | GET `/api/user-order-get` | page、pageSize、searchValue合并分页查询，不将旧搜索数组当分页对象 |
| 水印 | `/api/watermark-*` | 列表pagesNum/pagesSize，上传复用管理员图片上传接口 |

## 业务边界

- 标签和颜色是全局共享字典，当前后端不按素材类型区分。标签页已展示说明，旧类型参数仅保留调用兼容，不发送给服务端。
- 分类可维护三级，但素材只关联一级、二级；素材选择器与批量发布不提供三级关联。当前后端不保存独立keywords，素材表单已禁用该字段，搜索使用中文和英文名称。
- 素材上传不接受SVG封面。单个编辑控件仍展示第一个素材文件，未替换上传时保留原完整文件数组。
- 批量发布按去掉最后扩展名后的文件名分组；图片走封面接口，非图片文件走素材包接口。文件地址保持数组，成功组从队列移除，失败组保留。
- 上传成功但发布失败可能留下未引用资源；不自动删除服务端文件。网络超时造成发布结果未知时，应先核对列表，不能将重试视为跨请求幂等创建。
- 用户资料与启禁用由两个已有接口分别写入，不是跨接口原子事务；极端情况下可能部分成功，需要刷新核对。新增业务用户不创建后台管理员凭据，也不会自行生成客户端登录密码。
- 页面现有基础布局与通用弹窗结构保留，本轮没有扩大为整站UI重构。

## 已执行验证

- 客户端应用类型检查、改动文件 ESLint、Vite生产构建。
- `node --test tests/api-contract.test.cjs`：6项，覆盖管理员响应、分类排序、完整文件数组、标签映射、余额原值、下架商品、上传认证和迟到401。
- `cgs-api` 相关9个隔离测试套件：137项通过；未写入生产库。
- `tests/browser-integration.cjs`：用构建后的静态站点和隔离模拟API，在隐藏Electron浏览器中测试登录、用户编辑余额提交及8个业务页面；28次请求、无运行时错误。结果写入 `.integration-result.json`，不代表线上写入验收。

未执行真实管理员生产登录、线上CRUD、真实文件/COS大文件上传、生产部署或数据库迁移。请使用测试账号和独立测试数据验证这些流程后再发布。模拟测试不使用生产账号数据。
