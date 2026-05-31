/**
 * ALMEER BOT — Plugin: afk.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { readStore, writeStore } from '../../lib/datastore.js';

export default {
  name: 'afk',
  aliases: ['away', 'afkoff', 'back', 'return'],
  category: 'utils',
  description: 'set away mode — auto-replies when messaged',
  owner: true,
  async run({ cmdName, argText, reply }) {
    const afk = readStore('afk');

    if (cmdName === 'afkoff' || cmdName === 'back' || cmdName === 'return' || argText.toLowerCase() === 'off') {
      if (!afk.active) return reply('ℹ️ AFK mode is not active.');
      writeStore('afk', { active: false });
      return reply('✅ AFK mode disabled. Welcome back!');
    }

    writeStore('afk', { active: true, reason: argText || 'No reason given', since: Date.now() });
    reply(`😴 *AFK mode enabled*\n📝 Reason: ${argText || 'No reason given'}\n\n_Auto-replies will be sent to DMs while you\'re away. Use .afkoff to disable._`);
  },
};
