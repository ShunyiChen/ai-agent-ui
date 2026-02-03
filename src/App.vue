<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, reactive, onMounted, onUnmounted } from "vue";
// import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Agent from "@/components/Agent.vue";
// import {
//   Check,
//   Delete,
//   Edit,
//   Message,
//   Search,
//   Star,
// } from '@element-plus/icons-vue'

const win = getCurrentWindow();
const isMax = ref(false);
const isDark = useDark()
// const isDark = useDark()
const toggleDark = useToggle(isDark)
// 菜单项数据
const menus = reactive([
  {
    name: "File",
    open: false,
    items: [
      { name: "New Project", shortcut: "Ctrl+N", action: () => console.log("New Project") },
      { name: "Open Project", shortcut: "Ctrl+O", action: () => console.log("Open Project") },
      { type: "separator" },
      { name: "Save", shortcut: "Ctrl+S", action: () => console.log("Save") },
      { name: "Save As...", shortcut: "Ctrl+Shift+S", action: () => console.log("Save As") },
      { type: "separator" },
      { name: "Preferences", action: () => console.log("Preferences") },
      { type: "separator" },
      { name: "Exit", action: () => close() }
    ]
  },
  {
    name: "Edit",
    open: false,
    items: [
      { name: "Undo", shortcut: "Ctrl+Z", action: () => console.log("Undo") },
      { name: "Redo", shortcut: "Ctrl+Y", action: () => console.log("Redo") },
      { type: "separator" },
      { name: "Cut", shortcut: "Ctrl+X", action: () => console.log("Cut") },
      { name: "Copy", shortcut: "Ctrl+C", action: () => console.log("Copy") },
      { name: "Paste", shortcut: "Ctrl+V", action: () => console.log("Paste") },
      { name: "Delete", shortcut: "Del", action: () => console.log("Delete") },
      { type: "separator" },
      { name: "Select All", shortcut: "Ctrl+A", action: () => console.log("Select All") }
    ]
  },
  {
    name: "Selection",
    open: false,
    items: [
      { name: "Reload", shortcut: "Ctrl+R", action: () => console.log("Reload") },
      { name: "Force Reload", shortcut: "Ctrl+Shift+R", action: () => console.log("Force Reload") },
      { type: "separator" },
      { name: "Toggle Fullscreen", shortcut: "F11", action: () => win.isFullscreen().then(v => v ? win.setFullscreen(false) : win.setFullscreen(true)) },
      { name: "Zoom In", shortcut: "Ctrl++", action: () => console.log("Zoom In") },
      { name: "Zoom Out", shortcut: "Ctrl+-", action: () => console.log("Zoom Out") },
      { name: "Reset Zoom", shortcut: "Ctrl+0", action: () => console.log("Reset Zoom") },
      { type: "separator" },
      { name: "Toggle Developer Tools", shortcut: "Ctrl+Shift+I", action: () => console.log("Toggle DevTools") }
    ]
  },
  {
    name: "View",
    open: false,
    items: [
      { name: "View Help", action: () => console.log("View Help") },
      { name: "Documentation", action: () => console.log("Documentation") },
      { type: "separator" },
      { name: "About", action: () => console.log("About") }
    ]
  }
]);

type ViewType = "explorer" | "search" | "git" | "extensions" | "settings";

const activeView = ref<ViewType>("explorer");

// 关闭所有菜单
function closeAllMenus() {
  menus.forEach(menu => menu.open = false);

  profile_menus.forEach(menu => menu.open = false);
}

// 切换菜单
function toggleMenu(index: number) {
  const wasOpen = menus[index].open;
  closeAllMenus();
  menus[index].open = !wasOpen;
}

// 处理菜单项点击
function handleMenuItemClick(menuIndex: number, itemIndex: number) {
  const item = menus[menuIndex].items[itemIndex];
  if (item.type === 'separator') return;
  if (item.action) {
    item.action();
  }
  closeAllMenus();
}

// 点击外部关闭菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.menubar')) {
    closeAllMenus();
  }
}

const minimize = () => win.minimize();
const close = () => win.close();

win.onResized(() => {
  win.isMaximized().then(v => isMax.value = v);
});

const toggleMaximize = () => {
  isMax.value ? win.unmaximize() : win.maximize();
};

// 添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const profile_menus = reactive([
  {
    name: "Profile",
    open: false,
    items: [
      { name: "Check for Updates", shortcut: "Ctrl+N", action: () => console.log("Check for Updates") },
      { type: "separator" },
      { name: "Sign Out", action: () => close() }
    ]
  }]
);

// 切换菜单
function toggleProfileMenu(index: number) {
  const wasOpen = profile_menus[index].open;
  closeAllMenus();
  profile_menus[index].open = !wasOpen;
}

// 处理菜单项点击
function handleProfileMenuItemClick(menuIndex: number, itemIndex: number) {
  const item = profile_menus[menuIndex].items[itemIndex];
  if (item.type === 'separator') return;
  if (item.action) {
    item.action();
  }
  closeAllMenus();
}

// 点击外部关闭菜单
// function handleClickOutside(event: MouseEvent) {
//   const target = event.target as HTMLElement;
//   if (!target.closest('.menubar')) {
//     closeAllMenus();
//   }
// }



</script>

<template>

  <div class="common-layout">
    <el-container>
      <el-header class="titlebar drag-region">
        <div class="titlebar-left">
          <div class="menubar">
            <!-- Logo -->
            <div class="app-logo">
              <img src="./assets/vue.svg" alt="App Logo" />
            </div>
            <!-- 菜单项 -->
            <div v-for="(menu, index) in menus" :key="menu.name" class="menu-item" :class="{ active: menu.open }"
              @click.stop="toggleMenu(index)">
              <span class="menu-name">{{ menu.name }}</span>

              <!-- 下拉菜单 -->
              <div v-if="menu.open" class="dropdown-menu">
                <div v-for="(item, itemIndex) in menu.items" :key="itemIndex" class="dropdown-item" :class="{
                  separator: item.type === 'separator',
                  disabled: false
                }" @click.stop="handleMenuItemClick(index, itemIndex)">
                  <template v-if="item.type === 'separator'">
                    <div class="separator-line"></div>
                  </template>
                  <template v-else>
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-shortcut">{{ item.shortcut }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="titlebar-center">
          <!-- 中间拖拽占位 -->
          <div class="title">AI-Agent</div>
        </div>
        <div class="titlebar-right">
          <div class="multi-toggle">
            <button class="win-toggle-btn size-default" @click="minimize">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.06 461.06 0 0 1-206.912-48.384l-175.616 58.56z">
                </path>
                <path fill="currentColor"
                  d="M512 563.2a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4m192 0a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4m-384 0a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4">
                </path>
              </svg>
            </button>
          </div>

          <el-divider direction="vertical" style="height: 12px;" />

          <div class="multi-toggle">
            <button class="win-toggle-btn size-default" @click="minimize">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256">
                </path>
              </svg>
            </button>






            <div v-for="(menu, index) in profile_menus" :key="menu.name" class="profile-menu-item"
              :class="{ active: menu.open }" @click.stop="toggleProfileMenu(index)">

              <button class="win-toggle-btn size-arrow-down">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M288 320a224 224 0 1 0 448 0 224 224 0 1 0-448 0m544 608H160a32 32 0 0 1-32-32v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 0 1-32 32z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M831.872 340.864 512 652.672 192.128 340.864a30.59 30.59 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.59 30.59 0 0 0-42.752 0z">
                  </path>
                </svg>
              </button>

              <!-- 下拉菜单 -->
              <div v-if="menu.open" class="dropdown-profile-menu">
                <div v-for="(item, itemIndex) in menu.items" :key="itemIndex" class="dropdown-item" :class="{
                  separator: item.type === 'separator',
                  disabled: false
                }" @click.stop="handleProfileMenuItemClick(index, itemIndex)">
                  <template v-if="item.type === 'separator'">
                    <div class="separator-line"></div>
                  </template>
                  <template v-else>
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-shortcut">{{ item.shortcut }}</span>
                  </template>
                </div>
              </div>
            </div>
            <!-- <button class="win-toggle-btn size-arrow-down" @click="minimize">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M288 320a224 224 0 1 0 448 0 224 224 0 1 0-448 0m544 608H160a32 32 0 0 1-32-32v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 0 1-32 32z">
                </path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M831.872 340.864 512 652.672 192.128 340.864a30.59 30.59 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.59 30.59 0 0 0-42.752 0z">
                </path>
              </svg>
            </button> -->
          </div>

          <!-- 右侧窗口按钮 -->
          <div class="window-controls">
            <!-- 最小化 -->
            <button class="win-btn normal" @click="minimize">
              <svg xmlns="http://www.w3.org/2000/svg" class="win-icon" viewBox="0 0 1024 1024">
                <path fill="currentColor" d="M128 544h768a32 32 0 1 0 0-64H128a32 32 0 0 0 0 64"></path>
              </svg>
            </button>

            <button class="win-btn normal" @click="toggleMaximize">
              <!-- 最大化 -->
              <svg v-if="!isMax" xmlns="http://www.w3.org/2000/svg" class="win-icon" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
                </path>
                <path fill="currentColor"
                  d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
                </path>
              </svg>
              <!-- 还原 -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="win-icon" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z">
                </path>
                <path fill="currentColor"
                  d="M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64">
                </path>
              </svg>
            </button>
            <!-- 关闭 -->
            <button class="win-btn close" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" class="win-icon" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                  d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </el-header>

      <el-main>
        <el-container class="activity-bar-container">
          <el-aside class="activity-bar">
            <!-- 顶部按钮组 -->
            <div class="top-buttons">
              <button class="activity-btn" :class="{ active: activeView === 'explorer' }"
                @click="activeView = 'explorer'" title="Explorer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M128 896V128h768v768zm291.712-327.296 128 102.4 180.16-201.792-47.744-42.624-139.84 156.608-128-102.4-180.16 201.792 47.744 42.624zM816 352a48 48 0 1 0-96 0 48 48 0 0 0 96 0">
                  </path>
                </svg>
              </button>

              <button class="activity-btn" :class="{ active: activeView === 'search' }" @click="activeView = 'search'"
                title="Search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704">
                  </path>
                </svg>
              </button>

              <button class="activity-btn" :class="{ active: activeView === 'git' }" @click="activeView = 'git'"
                title="Source Control">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="m679.872 348.8-301.76 188.608a127.8 127.8 0 0 1 5.12 52.16l279.936 104.96a128 128 0 1 1-22.464 59.904l-279.872-104.96a128 128 0 1 1-16.64-166.272l301.696-188.608a128 128 0 1 1 33.92 54.272z">
                  </path>
                </svg>
              </button>

              <button class="activity-btn" :class="{ active: activeView === 'extensions' }"
                @click="activeView = 'extensions'" title="Extensions">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M160 448a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32zm448 0a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32zM160 896a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32zm448 0a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32z">
                  </path>
                </svg>
              </button>
            </div>

            <!-- 底部按钮 -->
            <div class="bottom-buttons">
              <button class="activity-btn" :class="{ active: activeView === 'settings' }"
                @click="activeView = 'settings'" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256">
                  </path>
                </svg>
              </button>
            </div>
          </el-aside>
          <el-main>
            <el-container>
              <el-aside width="200px">Explorer</el-aside>
              <el-main>
                <div v-if="activeView === 'explorer'">
                  <h2>Explorer</h2>
                  <p>这里是文件资源管理器</p>
                  <el-button @click="toggleDark()">Main
                    <i inline-block align-middle i="dark:carbon-moon carbon-sun" />
                    <span class="ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>
                  </el-button>
                </div>

                <div v-else-if="activeView === 'search'">
                  <h2>Search</h2>
                  <p>这里是搜索视图</p>
                </div>

                <div v-else-if="activeView === 'git'">
                  <h2>Source Control</h2>
                  <p>这里是 Git 面板</p>
                </div>

                <div v-else-if="activeView === 'extensions'">
                  <h2>Extensions</h2>
                  <p>这里是插件市场</p>
                </div>

                <div v-else-if="activeView === 'settings'">
                  <h2>settings</h2>
                  <p>settingsddd</p>
                </div>
              </el-main>
            </el-container>
          </el-main>
          <el-aside width="200px">
            <Agent />
          </el-aside>
        </el-container>
      </el-main>
      <el-footer class="custom-footer">
        <div class="footer-content">
          Footer
        </div>
      </el-footer>

    </el-container>
  </div>
</template>
<style scoped>
.common-layout {
  height: 100%;
  /* 占满 #app 高度 */
  width: 100%;
  /* 占满 #app 宽度 */
  display: flex;
  flex-direction: column;
  /*background-color: var(--bg-color, #f6f6f6);  可以配合主题 */
  overflow: hidden;
}

/* ===== 标题栏 ===== */
.titlebar {
  height: 32px;
  display: flex;
  align-items: center;
  color: #ccc;
  user-select: none;
  border-bottom: 1px solid #333;
  position: relative;
  z-index: 1000;
  padding-left: 8px;
  padding-right: 0;
}

/* 左侧区域 - 菜单 */
.titlebar-left {
  flex: 1;
  /* 占1/3 */
  display: flex;
  align-items: center;
  height: 100%;
}

/* 中间区域 - 标题（可拖拽） */
.titlebar-center {
  flex: 1;
  /* 占1/3 */
  -webkit-app-region: drag;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧区域 - 窗口控制 */
.titlebar-right {
  flex: 1;
  /* 占1/3 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

/* ⭐ 只有这里可拖拽 */
.drag-region {
  /* flex: 1; */
  -webkit-app-region: drag;
}

/* Logo 样式 */
.app-logo {
  display: flex;
  align-items: start;
  justify-content: start;
  width: 20px;
  height: 20px;
  -webkit-app-region: no-drag;
  margin-right: 7px;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: invert(1) brightness(0.8);
  opacity: 0.9;
}

/* 左侧菜单栏（包含logo） */
.menubar {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}

/* 菜单项 - 减小间距 */
.menu-item {
  border-radius: 4px;
  height: 70%;
  position: relative;
  display: flex;
  /* align-items: center;
  justify-items: center; */
  padding: 0 6px;
  /* 减小左右内边距 */
  cursor: default;
  font-size: 13px;
  /* 稍微调小字体 */
  transition: background-color 0.2s;
  font-family: "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol";
}

.menu-item:hover {
  background-color: rgba(255, 1, 33, 0.5);
  transition: background-color 0.2s;
}

.menu-item.active {
  background-color: rgba(122, 112, 33, 0.65);
}

.menu-name {
  padding: 0 2px;
  /* 减小文字内边距 */
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  padding: 4px 4px;
  min-width: 180px;
  border-radius: 5px;
  background-color: #2d2d2d;
  border: 1px solid #555;
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  animation: fadeIn 0.15s ease-out;
}

/* 个人资料菜单 */
.profile-menu-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 6px;
  /* 减小左右内边距 */
  cursor: default;
  font-size: 13px;
  /* 稍微调小字体 */
  transition: background-color 0.2s;
  font-family: "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol";
}

/* 个人资料下拉菜单 */
.dropdown-profile-menu {
  position: absolute;
  top: 102%;
  left: 0;
  padding: 4px 4px;
  width: 180px;
  border-radius: 5px;
  /* min-width: 30px; */
  background-color: #2d2d2d;
  border: 1px solid #555;
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单项 */
.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 30px;
  color: #ddd;
  font-size: 11px;
  cursor: default;
  transition: background-color 0.1s;
  white-space: nowrap;
  border-radius: 3px;
}

.dropdown-item:hover:not(.separator):not(.disabled) {
  background-color: rgba(0, 120, 212, 0.9);
  color: white;
}

.dropdown-item.disabled {
  color: #666;
  cursor: not-allowed;
}

.dropdown-item.separator {
  padding: 2px 0;
  cursor: default;
}

.separator-line {
  height: 1px;
  background-color: #555;
  margin: 1px 0;
  width: 100%;
}

.item-name {
  flex: 1;
}

.item-shortcut {
  color: #999;
  font-size: 10px;
  margin-left: 20px;
}

.dropdown-item:hover:not(.separator):not(.disabled) .item-shortcut {
  color: #ccc;
}

/* 中间占位（用于拖拽） */
.title {
  flex: 1;
  -webkit-app-region: drag;
  text-align: center;
  font-size: 12px;
  /* 稍微调小字体 */
  transition: background-color 0.2s;
  font-family: "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol";
}

/* 所有可点元素禁止拖拽 */
.window-controls button,
.menu-item,
.app-logo {
  -webkit-app-region: no-drag;
}

/* 右侧窗口按钮 */
.window-controls {
  display: flex;
  height: 100%;
  margin-left: 4px;
}

/* 窗口控制按钮 - 移除圆角 */
.window-controls button {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  color: #ccc;
  font-size: 12px;
  border-radius: 0 !important;
  transition: background-color 0.2s;
}

.window-controls .close:hover {
  background: #e81123 !important;
  color: #fff;
}

.window-controls .normal:hover {
  background: #c5b8b9 !important;
  color: #fff;
}

/* 按钮本体 */
.win-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cccccc;
  cursor: default;
  transition: background-color 0.15s;
}

.win-icon {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  stroke-width: 1;
  fill: none;
  /* 🔥 关键：禁用插值 */
  shape-rendering: crispEdges;
  /* 防止子像素缩放 */
  transform: translateZ(0);
}

.multi-toggle {
  display: flex;
  /* 添加水平方向的间隙 */
  /* gap: 2px; */
}

.win-toggle-btn {
  border-radius: 5px;
  border: 0px solid black;
  /* 去掉 fill 属性，使用 background 和 color 控制样式 */
  background: transparent;
  /* 透明背景 */
  color: inherit;
  /* 继承父元素颜色或使用具体颜色 */
  display: inline-flex;
  /* 使用 flex 布局让图标居中 */
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  /* 添加悬停动画 */
  cursor: pointer;
  /* 鼠标指针变为手形 */
}

/* 特定尺寸的按钮 */
.win-toggle-btn.size-arrow-down {
  height: 22px;
  width: 36px;
  /* 添加水平方向的间隙 */
  gap: 4px;
  /* 调整这个值来控制间距 */
}

/* 默认尺寸 */
.win-toggle-btn.size-default {
  height: 22px;
  width: 22px;
}

/* 悬停效果 */
.win-toggle-btn:hover {
  background-color: rgba(172, 168, 168);
  /* 浅灰色背景 */
}

/* 移除 SVG 的 fill 并设置图标颜色 */
.win-toggle-btn svg {
  fill: currentColor;
  /* 继承按钮的文字颜色 */
  /* 使用 transform 放大图标 */
  transform: scale(1.5);
  /* 放大1.2倍 */
}



.activity-bar-container {
  height: 100%;
}

/* ===== 左侧 Activity Bar ===== */
.activity-bar {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  justify-content: space-between;
  /* background-color: darkslategray; */
}

.top-buttons {
  display: flex;
  flex-direction: column;
  gap: 11px;
  /* 按钮间距 */
}

.bottom-buttons {
  margin-top: auto;
  /* 自动将元素推到容器底部 */
  margin-bottom: 5px;
}

/* 按钮 */
.activity-btn {
  padding: 5px 5px;
  /* margin: 5px 0px; */
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #c5c5c5;
  font-size: 18px;
  cursor: default;
  transition: background-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.activity-btn:hover {
  background: #1e1e1e;
}

.activity-btn.active {
  background: #373737;
  color: #ffffff;
  /* border-left: 2px solid #007acc; */
}

:deep(.el-main) {
  padding: 0 !important;
}

.custom-footer {
  height: 20px !important;
  /* 设置固定高度为25px */
  padding: 0 !important;
  /* 移除内边距 */
  line-height: 25px;
  /* 垂直居中文本 */
}

.footer-content {
  /* background-color: darkcyan; */
  border-top: 1px solid gray;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>