/**
 * ALMEER BOT — Plugin: mutegroup.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'mute',
  aliases: ['unmute', 'lock', 'unlock'],
  category: 'group',
  description: 'mute/unmute group messages — owner/admin only',
  owner: true,
  async run({ sock, chat, cmdName, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    const muting = cmdName === 'mute' || cmdName === 'lock';
    try {
      await sock.groupSettingUpdate(chat, muting ? 'announcement' : 'not_announcement');
      reply(muting
        ? '🔇 Group muted — only admins can send messages.'
        : '🔊 Group unmuted — everyone can send messages.');
    } catch (e) {
      reply('⚠️ Failed. Make sure I am an admin.\n_(' + e.message + ')_');
    }
  },
};
