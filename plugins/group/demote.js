/**
 * ALMEER BOT — Plugin: demote.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'demote',
  aliases: ['deop', 'unadmin'],
  category: 'group',
  description: 'demote admin to member — .demote @user',
  owner: true,
  async run({ sock, m, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentions.length) return reply('usage: .demote @user');
    try {
      await sock.groupParticipantsUpdate(chat, mentions, 'demote');
      reply(`✅ Demoted *${mentions.length}* member(s) from admin.`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
