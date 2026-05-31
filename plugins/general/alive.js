/**
 * ALMEER BOT — Plugin: alive.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'alive',
  aliases: ['online', 'bot'],
  category: 'general',
  description: 'check if bot is alive',
  async run({ reply, settings, uptimeStr }) {
    return reply(
      '╭━━〔 *ALMEER MINI* 〕━━┈⊷\n' +
      '┃ ✅ Bot is online\n' +
      `┃ ⏱️ Uptime: ${uptimeStr()}\n` +
      `┃ 🛡️ Mode: ${(settings.mode || 'private').toUpperCase()}\n` +
      `┃ ⚙️ Prefix: ${settings.prefix || '.'}\n` +
      '╰━━━━━━━━━━━━━━━━━━┈⊷'
    );
  },
};
