/**
 * ALMEER BOT — Plugin: status.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'status',
  aliases: ['ping', 'uptime'],
  category: 'general',
  description: 'bot status & uptime',
  async run({ reply, settings, ownerJid, uptimeStr, webServerStarted, PORT }) {
    return reply(
      '╭━ STATUS ━╮\n' +
      `uptime: ${uptimeStr()}\n` +
      `owner : ${ownerJid?.split('@')[0] || 'unknown'}\n` +
      `mode  : ${settings.mode}\n` +
      `web   : ${webServerStarted ? `:${PORT}` : 'cli mode'}\n` +
      `online: ${settings.alwaysOnline ? 'always' : 'idle'}`
    );
  },
};
