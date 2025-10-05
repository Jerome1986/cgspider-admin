<script setup lang="ts">
import {
  Coin,
  CaretBottom,
  Collection,
  Crop,
  Document,
  DocumentCopy,
  EditPen,
  ShoppingBag,
  SwitchButton,
  User,
  CollectionTag,
  PriceTag,
  Cloudy
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/index.js'
import { useRouter } from 'vue-router'
// 路由
const router = useRouter()
// 用户管理
const userStore = useUserStore()
const handleSelect = (key: string, keyPath: string) => {
  console.log(key, keyPath)
}

// 退出登录
const dialogVisible = ref(false)
const loginOut = () => {
  ElMessageBox.confirm('确定要退出吗？')
    .then(() => {
      dialogVisible.value = false
      userStore.clearUserInfo()
      router.push('/login')
    })
    .catch(() => {
      // catch error
    })
}
</script>

<template>
  <!--侧边导航-->
  <el-container class="layoutContainer">
    <el-aside width="200px" style="background-color: #1a1a1a">
      <div class="logo">
        <img class="logoPic" src="../../assets/icon.png" alt="logo" />
      </div>
      <el-menu
        active-text-color="#ffd04b"
        background-color="#1a1a1a"
        class="el-menu-vertical-demo"
        :default-active="$route.path"
        text-color="#fff"
        :router="true"
        @select="handleSelect"
      >
        <!--用户管理-->
        <el-menu-item index="/userManage">
          <el-icon>
            <User />
          </el-icon>
          <span>用户列表</span>
        </el-menu-item>
        <!--分类管理-->
        <el-sub-menu index="/cate">
          <template #title>
            <el-icon>
              <document />
            </el-icon>
            <span>分类管理</span>
          </template>
          <el-menu-item index="/cate">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            <span>一级分类</span>
          </el-menu-item>
          <el-menu-item index="/cate/subCategory">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            <span>二级分类</span>
          </el-menu-item>
          <el-menu-item index="/cate/group">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            <span>三级分类</span>
          </el-menu-item>
        </el-sub-menu>
        <!--标签管理-->
        <el-sub-menu index="/tagManage">
          <template #title>
            <el-icon>
              <CollectionTag />
            </el-icon>
            <span>标签管理</span>
          </template>
          <el-menu-item index="/tagManage/tag">
            <el-icon>
              <PriceTag />
            </el-icon>
            <span>属性标签</span>
          </el-menu-item>
          <el-menu-item index="/tagManage/color">
            <el-icon>
              <Cloudy />
            </el-icon>
            <span>颜色标签</span>
          </el-menu-item>
        </el-sub-menu>
        <!--商品管理-->
        <el-menu-item index="/material">
          <el-icon>
            <ShoppingBag />
          </el-icon>
          <span>素材管理</span>
        </el-menu-item>
        <!--会员商品-->
        <el-menu-item index="/vip">
          <el-icon>
            <Coin />
          </el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <!--订单管理-->
        <el-menu-item index="/orderManage">
          <el-icon>
            <Collection />
          </el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/watermark">
          <el-icon>
            <Collection />
          </el-icon>
          <span>水印管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--顶部栏-->
    <el-container>
      <el-header>
        <div>
          {{ userStore.userInfo.role }}：<strong>{{ userStore.userInfo.username }}</strong>
        </div>
        <el-dropdown placement="bottom-end">
          <span class="el-dropdown__box">
            <el-avatar :src="userStore.userInfo.userAvatarUrl" />
            <el-icon>
              <CaretBottom />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
              <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
              <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
              <el-dropdown-item @click="loginOut" command="logout" :icon="SwitchButton"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>CGspider ©2025 Created by 3D模型网</el-footer>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layoutContainer {
  height: 100vh;
  color: #ffffff;
  background-color: #2f2f2f;

  .logo {
    text-align: center;

    .logoPic {
      padding: 20px 0;
      width: 80px;
      height: 80px;
      border-radius: 16px;
    }
  }

  .el-menu-vertical-demo {
    border: none;
  }

  .el-header {
    background-color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #ffffff;

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}
</style>
