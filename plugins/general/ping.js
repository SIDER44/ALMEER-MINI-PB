/**
 * ALMEER BOT — Plugin: ping.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'ping',
  aliases: ['p', 'latency'],
  category: 'general',
  description: 'check bot response time',
  async run({ reply }) {
    const t = Date.now();
    await reply('🏓 Pong! ⚡ *' + (Date.now() - t) + 'ms*');
  },
};
