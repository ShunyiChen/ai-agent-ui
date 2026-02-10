# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's Take Over mode by following these steps:

1. Run `Extensions: Show Built-in Extensions` from VS Code's command palette, look for `TypeScript and JavaScript Language Features`, then right click and select `Disable (Workspace)`. By default, Take Over mode will enable itself if the default TypeScript extension is disabled.
2. Reload the VS Code window by running `Developer: Reload Window` from the command palette.

You can learn more about Take Over mode [here](https://github.com/johnsoncodehk/volar/discussions/471).



一句话总览架构（先给你全景）

┌──────────────┐
│   Tauri UI   │   ← 桌面客户端 / 用户入口
│  (WebView)   │
└──────┬───────┘
       │ WebSocket / SSE / HTTP
       ▼
┌──────────────────────────────┐
│   Agent Gateway API          │  ← 对外统一入口
│ (FastAPI / Starlette)        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│   LangGraph Agent Runtime    │
│   - State Graph              │
│   - Tool Router              │
│   - Memory                   │
└──────┬───────────────┬───────┘
       │ MCP           │ MCP
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│ MySQL MCP    │  │ K8s MCP      │
│ (Pod)        │  │ (Pod)        │
└──────────────┘  └──────────────┘


二、核心设计原则（这一步非常重要）
1️⃣ Agent 永远在云端

不要把 LangGraph / MCP / LLM 放在 Tauri 里
原因：

MCP 本身就是远程工具协议

桌面端升级、热修复困难

K8S / DB 权限不能下发到客户端

👉 Tauri = Chat UI + Auth + Session 管理

2️⃣ LangGraph 只做“决策与编排”

不要把业务逻辑写死在 Graph 里。

LangGraph 负责：

状态管理（State）

工具调用决策

多步 reasoning

MCP 负责：

MySQL 查询

K8s 操作

未来加 Redis / ES / 云 API

3️⃣ MCP Server 是“基础设施级能力”

MCP Server = 云原生工具箱

一个 MCP Server ≈ 一个能力域

Agent 永远只通过 MCP 访问资源

Agent 不直连 DB / K8s


三、云端 Agent 设计（重点）
1️⃣ Agent Gateway（必不可少）

这是你整个系统的 北向接口

作用

给 Tauri 提供统一 API

管理 session / user / auth

隔离 LangGraph 细节

推荐技术
FastAPI + WebSocket / SSE


五、Tauri 客户端设计（别写重）
1️⃣ Tauri 的职责

✅ 聊天 UI
✅ 登录 / Token 管理
✅ WebSocket 连接
❌ 不跑 Agent
❌ 不跑 LangGraph

2️⃣ 通信方式（强烈推荐）
场景	    推荐
普通聊天	WebSocket
流式回复	SSE / WS
命令执行	WS