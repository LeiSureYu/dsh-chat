# dsh-chat

[![license](https://img.shields.io/github/license/LeiSureYu/dsh-chat)](./LICENSE)
![dsh](https://img.shields.io/badge/DSH-0.2.x-0078D4)

[简体中文](./README.md) · English

> A **pure-conversation mode** for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai):
> zero coding tools, a dedicated chat workspace with automatic grouping, web access via the
> official tool-web, and replies that follow the user's language.
> **The entire conversation UI is the official harness UI — this plugin renders nothing itself.**

## Install

**Official plugin manager** — sidebar **Plugins → Add plugin**, paste the package name or the
repo URL, restart DSH:

```
@leisureyu/dsh-chat
```

The npm package installs as-is (no build step); a GitHub repo URL works too — git installs
build automatically via the `prepare` script, and the first install asks you to approve the
package's build script.

**Command line**:

```bash
dsh plugin --profile web add @leisureyu/dsh-chat    # npm package
# or
git clone https://github.com/LeiSureYu/dsh-chat.git
dsh plugin --profile web add /path/to/dsh-chat       # local path (same as tarball install)
```

On the new-session screen, pick **对话模式 · Chat** in the official mode selector
(the agent-preset chip next to the workspace picker) and start chatting.

To make chat the default for new sessions, add to your profile's cordis.patch.yml:

```yaml
- id: agent-preset-registry
  name: '@deepseek-ai/dsh-agent-preset-registry'
  config:
    selectedDefault: chat
```

## Quick start

**Everyday conversation** — the official conversation view, streaming, thinking chains,
quotes, rename and archive all go through the official paths.

**Back to work mode** — the same selector switches to Standard / PTC / Minimal / Creator,
and the tool boundary flips immediately:

```
对话模式 · Chat  →  web_search / web_fetch / working_directory (3 tools)
Standard mode    →  edit / pwsh / read / glob / grep / subagent / workflow … (30 tools)
```

**Fresh web content** — `tool-web` is built in; credentials follow the harness search settings.
Failures are always reported with their reason — no silent degradation; when search credentials
are missing the model falls back to `web_fetch` on its own.

## Features

| Feature | Notes |
| --- | --- |
| Zero coding tools | the preset mounts persona + time-context + tool-web only — no shell/fs/editor/terminal |
| Dedicated chat workspace | created idempotently at startup (`~/.dsh-home/chat`) |
| Automatic grouping | the server watches `session/created` and attaches `chat`-preset sessions to the chat workspace |
| Bilingual display copy | the preset name/description are published in Chinese and English, readable under any UI locale |
| Language following | a bilingual persona with an explicit rule: replies follow the user's language |
| Web access | official `tool-web` (search + fetch), credentials per harness search settings |
| Thinking effort | the official model selector's effort levels; model selection follows the in-app picker |

## How it works

```
dsh plugin add dsh-chat
  │ 1. bundle patch declares: chat preset (persona + time-context + tool-web) + service row
  │ 2. service startup: ensureWorkspace(~/.dsh-home/chat, idempotent)
  │ 3. session/created: header.agentPreset === 'chat' → attachSession(chat workspace)
  ▼
Official UI: preset chip → 对话模式 · Chat → send → session lands under the chat node
```

The tool boundary is decided entirely by the preset declaration — tools are never silently
admitted; the server only groups sessions and never touches conversation content.

## Compatibility

| Item | Requirement |
| --- | --- |
| Node.js | ≥ 24.9 |
| DSH | 0.2.x (`>=0.2.0 <0.3.0`) |

## FAQ

- **Why did my session land elsewhere?** The workspace picker decides ownership; `chat`-preset
  sessions are auto-attached to the chat node by the server, work-mode sessions land in the
  workspace selected at send time.
- **web_search returns 401?** The harness search credentials are missing or invalid — check
  `web-deepseek-api`'s `searchBaseURL` / `searchApiKeyEnv` in the profile. `web_fetch` is unaffected.
- **Why is the display name bilingual?** User-declared presets never go through the official
  locale dictionaries (declared copy is used verbatim), so both languages ship in
  `name` / `description`.
- **Default new sessions to chat?** Add `selectedDefault: chat` to the profile patch (see Install).
- **How is this different from the official Standard mode?** Only the tool list and persona —
  UI, session management, and model selection all go through official paths.

## Development

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm build       # outputs lib/
```

The dev patch (`cordis.dev.patch.yml`) points at this checkout by absolute path and is
machine-local by design (not committed). Write your own based on `cordis.patch.yml` — the
service row's `name` points at this repo's `lib/index.js` — then:

```bash
npx @deepseek-ai/dsh web --patch ./cordis.dev.patch.yml --no-open
```

Rebuild and restart dsh to pick up changes. For a local test model, llama.cpp works fine
(llama-server on `127.0.0.1:8081`, wired through `@deepseek-ai/dsh-llm-pi-ai` in the profile;
never point it at any reverse proxy or official API endpoint).

## License

- This plugin's code: [MIT](./LICENSE)

## Disclaimer

This is a **community-maintained third-party plugin**, not an official project. It is not
affiliated with, endorsed, or sponsored by DeepSeek AI or its affiliates. The "dsh" in the
name only indicates compatibility.
