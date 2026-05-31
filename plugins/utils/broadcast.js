/**
 * ALMEER BOT — Plugin: broadcast.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'broadcast',
  aliases: ['bc', 'bcast'],
  category: 'utils',
  description: 'send message to all groups — .broadcast <message>',
  owner: true,
  async run({ sock, argText, reply }) {
    if (!argText) return reply('usage: .broadcast <message>\nexample: .broadcast Bot going offline for maintenance.');
    try {
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      if (!ids.length) return reply('⚠️ Bot is not in any groups.');
      let sent = 0, failed = 0;
      for (const id of ids) {
        try {
          await sock.sendMessage(id, { text: `📢 *BROADCAST*\n\n${argText}` });
          sent++;
          await new Promise(r => setTimeout(r, 1200)); // anti-spam delay
        } catch { failed++; }
      }
      reply(`✅ Broadcast sent.\n📤 Delivered: ${sent}\n❌ Failed: ${failed}`);
    } catch (e) {
      reply('⚠️ Broadcast failed.\n_(' + e.message + ')_');
    }
  },
};
