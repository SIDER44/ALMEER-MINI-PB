/**
 * ALMEER BOT — Plugin: setdesc.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'setdesc',
  aliases: ['setdescription', 'desc'],
  category: 'group',
  description: 'change group description — .setdesc <text>',
  owner: true,
  async run({ sock, chat, argText, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    try {
      await sock.groupUpdateDescription(chat, argText || '');
      reply(`✅ Group description ${argText ? 'updated.' : 'cleared.'}`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
