# dsh-chat

DeepSeek Harness 的**纯对话模式**插件：一个零编码工具的 agent preset（`chat`）+ 一个独立的 **chat 工作区**。会话树、对话界面、流式渲染、思考链、附件、模型选择——**全部由 harness 官方 UI 呈现**，插件本身不提供任何界面。

## 它做什么

1. **`chat` agent preset**（cordis.patch.yml 声明）：persona + time-context + 官方 `tool-web`（联网搜索）。没有任何编码工具（bash/fs/...），因此会话是纯粹的 App 式对话。
2. **`chat` 工作区**：插件启动时创建（幂等，`~/.dsh-home/chat` 目录），并把所有 chat preset 会话自动归组进去——侧栏树里单独一个 "chat" 节点，不与 agent 工作区混排。

## 使用

```sh
dsh plugin --profile web add /path/to/dsh-chat
dsh web --profile web
```

新会话界面里、工作区选择器旁的官方模式选择器（agent preset chip）选 **对话模式 · Chat** → 发消息。会话自动出现在侧栏 "chat" 工作区下；在官方对话视图里正常流式、引用、重命名、归档。切回工作模式（标准/PTC/极简/创造）也在同一个选择器里完成。preset 显示文案为中英文双语（用户声明的 preset 不走官方 locale 字典，声明即原文）；persona 双语声明并跟随用户语言。

- 模型：跟随机内的模型/工作区选择器（官方路径）
- 联网搜索：preset 内置官方 `tool-web`，凭据按 harness 搜索设置
- 深度思考：官方模型选择器的 effort 档位

## 结构

```
cordis.patch.yml   # preset-chat 定义 + dsh-chat 服务行（bundle patch）
src/index.ts       # ensureWorkspace + session/created → attachSession（~40 行）
```

## 开发

```sh
pnpm install && pnpm build
```

dev patch（`cordis.dev.patch.yml`）指向本机 checkout 的绝对路径，按机器各自维护，不入库 —— 参考 `cordis.patch.yml` 写一份本地版（服务行 `name` 指向本仓库 `lib/index.js`），然后：

```sh
npx @deepseek-ai/dsh web --patch ./cordis.dev.patch.yml --no-open
```

Rebuild 后重启 dsh 生效。

本地测试 provider（llama.cpp 示例）写入 profile 的 cordis.patch.yml：

```yaml
- id: llm-pi-ai
  name: '@deepseek-ai/dsh-llm-pi-ai'
  config:
    providers:
      bonsai2:
        displayName: 本地 Bonsai2 27B
        apiKeyEnv: QWEN_API_KEY        # 占位 key（credentials: sk-local）
        api: openai-completions
        baseURL: http://127.0.0.1:8081/v1
        models:
          - id: bonsai2-27b
            name: Bonsai2 27B (256K)
            contextWindow: 262144
            input: [text]
- id: agent-default-model
  name: '@deepseek-ai/dsh-agent-default-model'
  config:
    provider: bonsai2
    model: bonsai2-27b
```

注意：provider model id 避免含反斜杠的路径（YAML/loader 会吃掉）；llama-server 不校验 model 名。

## 许可

MIT
