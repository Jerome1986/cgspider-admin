import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    // 用户管理
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/userManage',
      children: [
        { path: '/userManage', component: () => import('@/views/userManage/UserManage.vue') },
        // 分类--一共有三级分类
        {
          path: '/cate',
          redirect: '/cate/category',
          component: () => import('@/views/cate/CatePage.vue'),
          children: [
            {
              path: '/cate/category',
              component: () => import('@/views/cate/Category/CategoryPage.vue')
            },
            {
              path: '/cate/subCategory',
              component: () => import('@/views/cate/SubCategory/SubCategory.vue')
            },
            { path: '/cate/group', component: () => import('@/views/cate/Group/GroupPage.vue') }
          ]
        },
        //   标签
        {
          path: '/tag',
          redirect: '/tag/attribute',
          component: () => import('@/views/tag/TagPage.vue'),
          children: [
            {
              path: '/tag/attribute',
              component: () => import('@/views/tag/attributeTags/AttributeTags.vue')
            },
            {
              path: '/tag/color',
              component: () => import('@/views/tag/colorTags/ColorTags.vue')
            }
          ]
        },
        //  素材
        { path: '/material', component: () => import('@/views/material/MaterialPage.vue') },
        //  批量发布
        { path: '/many', component: () => import('@/views/manySend/ManySend.vue') },
        // 水印
        {
          path: '/watermark',
          component: () => import('@/views/watermarkManage/WatermarkManage.vue')
        },
        { path: '/order', component: () => import('@/views/orderManage/OrderManage.vue') }
      ]
    }
  ]
})

// 路由守卫 未登录时 拦截到登录页
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.userInfo.token && to.path !== '/login' && userStore.userInfo.role !== 'admin')
    return '/login'
})

export default router
