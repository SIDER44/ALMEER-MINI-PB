/**
 * ALMEER BOT — Plugin: owner.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'owner',
  aliases: ['dev', 'creator', 'admin'],
  category: 'general',
  description: 'show bot owner contact',
  async run({ sock, m, chat, ownerJid, reply }) {
    if (!ownerJid) return reply('⚠️ owner not configured.');
    const num = ownerJid.split('@')[0];
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:ALMEER MINI Owner\n' +
      'ORG:ALMEER MINI;\n' +
      `TEL;type=CELL;type=VOICE;waid=${num}:+${num}\n` +
      'END:VCARD';
    await sock.sendMessage(chat, {
      contacts: {
        displayName: 'ALMEER MINI Owner',
        contacts: [{ vcard }],
      },
    }, { quoted: m });
  },
};
