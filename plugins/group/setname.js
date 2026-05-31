/**
 * ALMEER BOT — Plugin: setname.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'setname',
  aliases: ['rename', 'groupname'],
  category: 'group',
  description: 'change group name — .setname <new name>',
  owner: true,
  async run({ sock, chat, argText, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    if (!argText) return reply('usage: .setname New Group Name');
    try {
      await sock.groupUpdateSubject(chat, argText);
      reply(`✅ Group name changed to: *${argText}*`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
