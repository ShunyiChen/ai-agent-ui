<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, reactive, onMounted, onUnmounted } from "vue";
// import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import Agent from "@/components/Agent.vue";
import {
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
import { Document, Folder, FolderOpened } from '@element-plus/icons-vue'
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
const windowHeight = ref(window.innerHeight);
const isDark = useDark()
// const isDark = useDark()
const toggleDark = useToggle(isDark)
// 菜单项数据


type ViewType = "database" | "k8s" | "add" | "settings";

const activeView = ref<ViewType>("database");

// 关闭所有菜单

// 递归读取目录
const loadDirectory = async (path: string): Promise<Tree[]> => {
  try {
    const entries = await readDir(path);
    const nodes: Tree[] = [];

    // 简单的路径拼接，兼容 Windows
    const separator = path.includes('\\') ? '\\' : '/';

    for (const entry of entries) {
      // if (entry.name.startsWith('.')) continue; // 跳过隐藏文件

      const fullPath = path.endsWith(separator) ? `${path}${entry.name}` : `${path}${separator}${entry.name}`;

      const node: Tree = {
        id: fullPath,
        label: entry.name,
      };

      if (entry.isDirectory) {
        node.children = await loadDirectory(fullPath);
      }
      nodes.push(node);
    }

    // 排序：文件夹在前，文件在后
    nodes.sort((a, b) => {
      const aIsDir = a.children !== undefined;
      const bIsDir = b.children !== undefined;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.label.localeCompare(b.label);
    });

    return nodes;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

const handleOpenFolder = async () => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected && typeof selected === 'string') {
      console.log('Opening folder:', selected);
      // 切换视图到 database (Explorer)
      activeView.value = 'database';
      const treeData = await loadDirectory(selected);
      data.value = treeData;
    }
  } catch (err) {
    console.error('Failed to open folder:', err);
  }
};

// 菜单项数据
const menus = reactive([
  {
    name: "File",
    open: false,
    items: [
      { name: "Open Folder...", shortcut: "Ctrl+O", action: handleOpenFolder },
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
      { name: "View Help", action: () => isCollapse.value = !isCollapse.value },
      { name: "Documentation", action: () => console.log("Documentation") },
      { type: "separator" },
      { name: "About", action: () => console.log("About") }
    ]
  }
]);

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

const minimize = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  win.minimize();
};
const close = () => win.close();

win.onResized(() => {
  win.isMaximized().then(v => isMax.value = v);
});

const toggleMaximize = () => {
  isMax.value ? win.unmaximize() : win.maximize();
};

const treeHeight = ref(0);

// 更新窗口高度
const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight - 183;
  treeHeight.value = window.innerHeight - 88;
  console.log('windowHeight.value=', windowHeight.value);
};

// 添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateWindowHeight);
  updateWindowHeight(); // 初始化高度
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateWindowHeight);
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


// 拖拽相关逻辑
const agentWidth = ref(300); // 初始宽度
const isResizing = ref(false);

const startResize = () => {
  isResizing.value = true;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none'; // 防止拖拽过程中选中文字
};

const resize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  // 计算新宽度：窗口总宽度 - 鼠标当前X坐标
  // 注意：这里假设 Agent 在最右侧
  const newWidth = window.innerWidth - e.clientX;

  // 设置最小和最大宽度限制
  if (newWidth > 200 && newWidth < 800) {
    agentWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = 'default';
  document.body.style.userSelect = '';
};

// Explorer 拖拽相关逻辑
const explorerWidth = ref(250); // 初始宽度
const isExplorerResizing = ref(false);

const startExplorerResize = () => {
  isExplorerResizing.value = true;
  document.addEventListener('mousemove', explorerResize);
  document.addEventListener('mouseup', stopExplorerResize);
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
};

const explorerResize = (e: MouseEvent) => {
  if (!isExplorerResizing.value) return;
  // 计算新宽度：鼠标当前X坐标 - ActivityBar宽度(约44px)
  const activityBarWidth = 44;
  const newWidth = e.clientX - activityBarWidth;

  if (newWidth > 150 && newWidth < 600) {
    explorerWidth.value = newWidth;
  }
};

const stopExplorerResize = () => {
  isExplorerResizing.value = false;
  document.removeEventListener('mousemove', explorerResize);
  document.removeEventListener('mouseup', stopExplorerResize);
  document.body.style.cursor = 'default';
  document.body.style.userSelect = '';
};

const isCollapse = ref(false)

interface Tree {
  id: string
  label: string
  children?: Tree[]
}



const props = {
  value: 'id',
  label: 'label',
  children: 'children',
}
const data = ref<Tree[]>([])

</script>

<template>

  <div class="common-layout">
    <el-container style="height: 100%">
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
                  d="M160 826.88 273.536 736H800a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H224a64 64 0 0 0-64 64zM296 800 147.968 918.4A32 32 0 0 1 96 893.44V256a128 128 0 0 1 128-128h576a128 128 0 0 1 128 128v416a128 128 0 0 1-128 128z">
                </path>
                <path fill="currentColor"
                  d="M352 512h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m0-192h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32">
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
              <button class="activity-btn" :class="{ active: activeView === 'database' }"
                @click="activeView = 'database'" title="Database">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="m161.92 580.736 29.888 58.88C171.328 659.776 160 681.728 160 704c0 82.304 155.328 160 352 160s352-77.696 352-160c0-22.272-11.392-44.16-31.808-64.32l30.464-58.432C903.936 615.808 928 657.664 928 704c0 129.728-188.544 224-416 224S96 833.728 96 704c0-46.592 24.32-88.576 65.92-123.264">
                  </path>
                  <path fill="currentColor"
                    d="m161.92 388.736 29.888 58.88C171.328 467.84 160 489.792 160 512c0 82.304 155.328 160 352 160s352-77.696 352-160c0-22.272-11.392-44.16-31.808-64.32l30.464-58.432C903.936 423.808 928 465.664 928 512c0 129.728-188.544 224-416 224S96 641.728 96 512c0-46.592 24.32-88.576 65.92-123.264">
                  </path>
                  <path fill="currentColor"
                    d="M512 544c-227.456 0-416-94.272-416-224S284.544 96 512 96s416 94.272 416 224-188.544 224-416 224m0-64c196.672 0 352-77.696 352-160S708.672 160 512 160s-352 77.696-352 160 155.328 160 352 160">
                  </path>
                </svg>
              </button>

              <button class="activity-btn" :class="{ active: activeView === 'k8s' }" @click="activeView = 'k8s'"
                title="Kubernetes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M320 256a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h384a64 64 0 0 0 64-64V320a64 64 0 0 0-64-64zm0-64h384a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H320a128 128 0 0 1-128-128V320a128 128 0 0 1 128-128">
                  </path>
                  <path fill="currentColor"
                    d="M512 64a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m-320 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 896a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m160 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m-320 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32M64 512a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0-160a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0 320a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m896-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0 320a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32">
                  </path>
                </svg>
              </button>

              <button class="activity-btn" :class="{ active: activeView === 'add' }" @click="activeView = 'add'"
                title="Add Server">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor"
                    d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-38.4 409.6H326.4a38.4 38.4 0 1 0 0 76.8h147.2v147.2a38.4 38.4 0 0 0 76.8 0V550.4h147.2a38.4 38.4 0 0 0 0-76.8H550.4V326.4a38.4 38.4 0 1 0-76.8 0z">
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
              <!-- Explorer 侧边栏 - 根据 activeView 显示不同内容 -->
              <el-aside class="explorer-sidebar" :width="explorerWidth + 'px'">
                <div class="explorer-resize-handle" @mousedown="startExplorerResize"></div>
                <div class="explorer-header">
                  <span class="explorer-title">Explorer</span>
                </div>

                <!-- Database AIOps 内容 -->
                <div v-if="activeView === 'database'" class="explorer-content">
                  <el-tree-v2 style="max-width: 600px" :data="data" :props="props" :height="treeHeight">
                    <template #default="{ node }">
                      <el-icon class="node-icon" :class="{ 'is-leaf': node.isLeaf }">
                        <Document v-if="node.isLeaf" />
                        <Folder v-else-if="!node.expanded" />
                        <FolderOpened v-else />
                      </el-icon>
                      <span>{{ node.label }}</span>
                    </template>
                  </el-tree-v2>
                </div>

                <!-- Kubernetes AIOps 内容 -->
                <div v-else-if="activeView === 'k8s'" class="explorer-content">

                </div>

                <!-- Add Server 内容 -->
                <div v-else-if="activeView === 'add'" class="explorer-content">
                </div>

                <!-- Settings 内容 -->
                <div v-else-if="activeView === 'settings'" class="explorer-content">

                </div>
              </el-aside>

              <el-main class="main-content-area">
                <div v-if="activeView === 'database'" class="view-container">
                  <h2>Database AIOps Dashboard</h2>
                  <p>智能数据库运维管理中心</p>
                  <el-button @click="toggleDark()">
                    <i inline-block align-middle i="dark:carbon-moon carbon-sun" />
                    <span class="ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>
                  </el-button>
                </div>

                <div v-else-if="activeView === 'k8s'" class="view-container">
                  <h2>Kubernetes AIOps Dashboard</h2>
                  <p>智能容器编排运维管理中心</p>
                </div>

                <div v-else-if="activeView === 'add'" class="view-container">
                  <h2>Add New Server</h2>
                  <p>添加新的数据源或 Kubernetes 集群</p>
                </div>

                <div v-else-if="activeView === 'settings'" class="view-container">
                  <h2>Settings</h2>
                  <p>应用程序设置</p>
                </div>
              </el-main>
            </el-container>
          </el-main>
          <el-aside :width="agentWidth + 'px'" class="agent-aside">
            <div class="resize-handle" @mousedown="startResize"></div>
            <Agent :height="windowHeight" />
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
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  overflow: hidden;
}

/* ===== 标题栏 ===== */
.titlebar {
  height: 32px;
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
  user-select: none;
  border-top: 1px solid var(--el-border-color-darker);
  border-bottom: 1px solid var(--el-border-color-darker);
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
  color: var(--el-text-color-primary);
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
}

.menu-item:hover {
  background-color: var(--el-fill-color);
  transition: background-color 0.2s;
}

.menu-item.active {
  background-color: var(--el-fill-color-dark);
  color: var(--el-color-primary);
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
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-dark);
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
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-dark);
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
  color: var(--el-text-color-regular);
  font-size: 11px;
  cursor: default;
  transition: background-color 0.1s;
  white-space: nowrap;
  border-radius: 3px;
}

.dropdown-item:hover:not(.separator):not(.disabled) {
  background-color: var(--el-color-primary);
  color: #ffffff;
}

.dropdown-item.disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.dropdown-item.separator {
  padding: 2px 0;
  cursor: default;
}

.separator-line {
  height: 1px;
  background-color: var(--el-border-color);
  margin: 1px 0;
  width: 100%;
}

.item-name {
  flex: 1;
}

.item-shortcut {
  color: var(--el-text-color-secondary);
  font-size: 10px;
  margin-left: 20px;
}

.dropdown-item:hover:not(.separator):not(.disabled) .item-shortcut {
  color: #eee;
}

/* 中间占位（用于拖拽） */
.title {
  flex: 1;
  -webkit-app-region: drag;
  text-align: center;
  font-size: 12px;
  /* 稍微调小字体 */
  transition: background-color 0.2s;
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
  color: var(--el-text-color-regular);
  font-size: 12px;
  border-radius: 0 !important;
  transition: background-color 0.2s;
}

.window-controls .close:hover {
  background: var(--el-color-danger) !important;
  color: #fff;
}

.window-controls .normal:hover {
  background: var(--el-fill-color) !important;
  color: var(--el-text-color-primary);
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
  color: var(--el-text-color-regular);
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
  background-color: var(--el-fill-color);
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
  color: var(--el-text-color-secondary);
  font-size: 18px;
  cursor: default;
  transition: background-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.activity-btn:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.activity-btn.active {
  background: var(--el-fill-color-dark);
  color: var(--el-color-primary);
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
  border-top: 1px solid var(--el-border-color-dark);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Agent 侧边栏样式 */
.agent-aside {
  position: relative;
  border-left: 1px solid var(--el-border-color-darker);
  /* 默认边框 */
  overflow: hidden;
  /* 隐藏溢出内容，确保子元素可以正确滚动 */
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 拖拽手柄 */
.resize-handle {
  position: absolute;
  left: -2px;
  /* 向左微调，使其覆盖边框区域，便于点击 */
  top: 0;
  bottom: 0;
  width: 4px;
  /* 热区宽度 */
  cursor: ew-resize;
  z-index: 100;
  transition: background-color 0.2s;
}

/* 悬停或拖拽时高亮手柄 */
.resize-handle:hover,
body[style*="ew-resize"] .resize-handle {
  background-color: var(--el-color-primary);
  /* 蓝色高亮 */
}

/* ===== Explorer 侧边栏样式 ===== */
.explorer-sidebar {
  position: relative;
  border-right: 1px solid var(--el-border-color-darker);
  height: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.explorer-header {
  height: 35px;
  min-height: 35px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  /* text-transform: uppercase; */
  /* color: var(--el-text-color-secondary); */
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.explorer-title {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.explorer-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  z-index: 100;
  transition: background-color 0.2s;
}

.explorer-resize-handle:hover,
body[style*="ew-resize"] .explorer-resize-handle {
  background-color: var(--el-color-primary);
}

.explorer-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0px 0;
}

.explorer-content :deep(.el-tree) {
  background-color: transparent;
}


.badge {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 600;
}

.section-items {
  padding-left: 12px;
}

.explorer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: background-color 0.15s;
  border-radius: 4px;
  margin: 2px 4px;
}

.explorer-item:hover {
  background-color: var(--el-fill-color);
}

.explorer-item.highlight {
  color: var(--el-color-primary);
  font-weight: 500;
}

/* 状态图标 */
.item-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-icon.online,
.item-icon.running {
  background-color: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.5);
}

.item-icon.offline {
  background-color: #909399;
}

.item-icon.pending {
  background-color: #e6a23c;
  animation: pulse 1.5s infinite;
}

.item-icon.error {
  background-color: #f56c6c;
  animation: pulse 1s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 主内容区域 */
.main-content-area {
  background-color: var(--el-bg-color-page);
  padding: 20px !important;
  overflow: hidden;
}

.view-container {
  height: 100%;
}

.view-container h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.view-container p {
  margin: 0 0 16px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}


.node-icon {
  margin-right: 5px;
  color: var(--el-color-warning);
}
</style>
<style>
:root {
  --el-font-family: "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol";
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol";
}
</style>