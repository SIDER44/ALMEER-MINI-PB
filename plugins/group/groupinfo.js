/**
 * ALMEER BOT — Plugin: groupinfo.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'groupinfo',
  aliases: ['ginfo', 'gc', 'groupdata'],
  category: 'group',
  description: 'show group information',
  async run({ sock, chat, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ Groups only.');
    try {
      const meta = await sock.groupMetadata(chat);
      const admins = meta.participants.filter(p => p.admin).map(p => `• +${p.id.split('@')[0]}`).join('\n') || 'none';
      const created = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : 'unknown';
      reply(
        `╭━━〔 *GROUP INFO* 〕━━┈⊷\n` +
        `┃ 📌 Name     : ${meta.subject || 'N/A'}\n` +
        `┃ 👥 Members  : ${meta.participants.length}\n` +
        `┃ 👑 Admins   : ${meta.participants.filter(p => p.admin).length}\n` +
        `┃ 📅 Created  : ${created}\n` +
        `┃ 🆔 ID       : ${chat.split('@')[0]}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 📝 Desc: ${meta.desc || 'No description'}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        `┃ 👑 Admin list:\n${admins}\n` +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply('⚠️ Failed to fetch group info.\n_(' + e.message + ')_');
    }
  },
};
