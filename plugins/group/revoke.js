/**
 * ALMEER BOT — Plugin: revoke.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'revoke',
  aliases: ['resetlink', 'newlink'],
  category: 'group',
  description: 'reset group invite link',
  owner: true,
  async run({ sock, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    try {
      const code = await sock.groupRevokeInvite(chat);
      reply(`✅ Invite link revoked.\n🔗 New link:\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
