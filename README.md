# dsh-chat

[![license](https://img.shields.io/github/license/LeiSureYu/dsh-chat)](./LICENSE)
![dsh](https://img.shields.io/badge/DSH-0.2.x-0078D4)

简体中文 · [English](./README.en.md)

> 给 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai)装一个**纯对话模式**:
> 零编码工具、独立 chat 工作区自动归组、联网走官方 tool-web、中英文跟随用户语言。
> **对话界面全部由 harness 官方 UI 呈现，插件本身不渲染任何界面。**

## 安装

克隆仓库后按路径安装，装完重启 DSH:

```bash
git clone https://github.com/LeiSureYu/dsh-chat.git
dsh plugin --profile web add /path/to/dsh-chat
dsh web --profile web
```

新会话界面里、工作区选择器旁的官方模式选择器（agent preset chip）选 **对话模式 · Chat** → 发消息。

想让新会话默认进对话模式，在 profile 的 cordis.patch.yml 里加一行:

```yaml
- id: agent-preset-registry
  name: '@deepseek-ai/dsh-agent-preset-registry'
  config:
    selectedDefault: chat
```

## 快速开始

**日常对话** —— 官方对话视图、流式渲染、思考链、引用、重命名、归档，全走官方路径:

```
你: 用一句话回答：天空为什么是蓝色的？
chat: 阳光中的蓝光比红光波长更短，在大气中更容易被空气分子散射（瑞利散射），因此我们看到的天空呈蓝色。
```

**切回工作模式** —— 同一个选择器里选标准 / PTC / 极简 / 创造，工具边界即时切换:

```
对话模式 · Chat  →  web_search / web_fetch / working_directory（3 个）
标准模式         →  edit / pwsh / read / glob / grep / subagent / workflow …（30 个）
```

**联网查新鲜事** —— `tool-web` 内置，凭据按 harness 搜索设置:

```
你: 用 web_search 搜索一下今天有什么科技新闻
chat: web_search 调用失败（HTTP 401,搜索凭据无效）……我先用 web_fetch 抓新闻站点:
      Microsoft is killing its great tasks app — The Verge,1 小时前,[链接]
```

失败显式写明原因，绝不静默降级;搜索凭据缺失时自动回退 `web_fetch` 直取网页。

## 功能一览

| 功能 | 说明 |
| --- | --- |
| 零编码工具 | preset 只挂 persona + time-context + tool-web，无 bash/fs/编辑器/终端 |
| 独立 chat 工作区 | 启动时幂等创建（`~/.dsh-home/chat`），chat 会话自动归组到侧栏单独节点 |
| 会话自动归组 | 服务端监听 `session/created`，preset 为 `chat` 即挂到 chat 工作区 |
| 中英双语显示 | preset 名称/描述双语发布，任何 UI 语言下完整可读 |
| 跟随用户语言 | persona 双语声明 + 明确的语言跟随规则，混用中英文时跟随主要语言 |
| 联网搜索 | 官方 `tool-web`（搜索 + 网页获取），凭据按 harness 搜索设置 |
| 深度思考 | 官方模型选择器的 effort 档位，模型跟随机内选择器 |

## 工作原理

```
dsh plugin add dsh-chat
  │ 1. bundle patch 声明: chat preset(persona + time-context + tool-web) + 服务行
  │ 2. 服务行启动: ensureWorkspace(~/.dsh-home/chat, 幂等)
  │ 3. session/created: header.agentPreset === 'chat' → attachSession(chat 工作区)
  ▼
官方 UI: preset chip 选「对话模式 · Chat」→ 发消息 → 会话落侧栏 chat 节点
```

工具边界完全由 preset 声明决定，绝不静默放行工具;服务端只做工作区归组，不碰会话内容。

## 兼容性

| 项目 | 要求 |
| --- | --- |
| Node.js | ≥ 24.9 |
| DSH | 0.2.x（`>=0.2.0 <0.3.0`） |

## 常见问题

- **会话怎么不混进工作区？** 工作区选择器决定归属，preset 为 `chat` 的会话由服务端自动挂到 chat 节点；工作模式会话落在当时选中的工作区。
- **web_search 报 401？** harness 搜索凭据未配置或失效，检查 profile 里 `web-deepseek-api` 的 `searchBaseURL` / `searchApiKeyEnv`；`web_fetch` 不受影响。
- **显示名为什么带英文？** 用户声明的 preset 不走官方 locale 字典（声明即原文，永不翻译），双语写在 `name` / `description` 里保证两种 UI 语言都完整。
- **新会话想默认对话模式？** profile patch 加 `selectedDefault: chat`（见安装节）。
- **和官方标准模式差在哪？** 只差工具清单与 persona——界面、会话管理、模型选择全走官方路径。

## 开发

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm build       # 输出 lib/
```

dev patch（`cordis.dev.patch.yml`）指向本机 checkout 的绝对路径，按机器各自维护，不入库 —— 参考 `cordis.patch.yml` 写一份本地版（服务行 `name` 指向本仓库 `lib/index.js`），然后:

```bash
npx @deepseek-ai/dsh web --patch ./cordis.dev.patch.yml --no-open
```

Rebuild 后重启 dsh 生效。本地测试模型用 llama.cpp 即可（llama-server 起在 `127.0.0.1:8081`，profile 里挂 `@deepseek-ai/dsh-llm-pi-ai` 指过去，严禁指向任何反代/官方 API 端点）。

## 许可

- 本插件代码：[MIT](./LICENSE)

## 声明

本项目为**社区维护的第三方插件**，非官方项目，与 DeepSeek AI 及其关联公司无隶属关系，也未获其背书或赞助。插件名称中的 "dsh" 仅用于说明兼容性。
