/**
 * ALMEER BOT — Plugin: promote.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'promote',
  aliases: ['op', 'admin'],
  category: 'group',
  description: 'promote member to admin — .promote @user',
  owner: true,
  async run({ sock, m, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentions.length) return reply('usage: .promote @user');
    try {
      await sock.groupParticipantsUpdate(chat, mentions, 'promote');
      reply(`✅ Promoted *${mentions.length}* member(s) to admin.`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
