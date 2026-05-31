/**
 * ALMEER BOT — Plugin: kick.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'kick',
  aliases: ['remove', 'ban'],
  category: 'group',
  description: 'remove a member from group — .kick @user',
  owner: true,
  async run({ sock, m, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentions.length) return reply('usage: .kick @user\nTag the member to remove.');
    try {
      await sock.groupParticipantsUpdate(chat, mentions, 'remove');
      reply(`✅ Removed *${mentions.length}* member(s) from the group.`);
    } catch (e) {
      reply('⚠️ Failed to remove. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
