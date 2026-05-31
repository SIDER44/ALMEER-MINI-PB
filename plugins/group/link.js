/**
 * ALMEER BOT — Plugin: link.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'link',
  aliases: ['invite', 'invitelink'],
  category: 'group',
  description: 'get group invite link',
  owner: true,
  async run({ sock, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    try {
      const code = await sock.groupInviteCode(chat);
      reply(`🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
