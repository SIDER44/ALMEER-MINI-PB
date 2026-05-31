/**
 * ALMEER BOT — Plugin: say.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'say',
  aliases: ['echo'],
  category: 'general',
  description: 'repeat text',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .say hello');
    return reply(argText);
  },
};
