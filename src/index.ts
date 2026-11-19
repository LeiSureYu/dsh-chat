import { mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-session'

export const name = 'dsh-chat'

export const inject = ['workspaceRegistry']

/**
 * dsh-chat: a pure-conversation mode for DeepSeek Harness.
 *
 * Contributes two things, everything else is the official harness UI:
 *  1. The `chat` agent preset (cordis.patch.yml): persona + time-context +
 *     official web search — no coding tools, so sessions running it are
 *     plain App-style conversation. Pick it from the official mode selector.
 *  2. The dedicated `chat` workspace: sessions running the chat preset are
 *     attached here automatically, so they group under their own "chat" node
 *     in the harness sidebar tree.
 */
export async function apply(ctx: Context): Promise<void> {
  const home = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh-home')
  const chatDir = path.join(home, 'chat')
  await mkdir(chatDir, { recursive: true })
  const workspace = await ctx.workspaceRegistry.create(chatDir, 'chat')

  ctx.on('session/created', (session) => {
    if (session.header.agentPreset === 'chat') {
      void workspace.attachSession(session.id)
    }
  })
}
