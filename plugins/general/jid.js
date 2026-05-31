/**
 * ALMEER BOT — Plugin: jid.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'jid',
  aliases: ['id', 'chatid'],
  category: 'general',
  description: 'show current chat and sender IDs',
  async run({ m, reply }) {
    const chat = m.key.remoteJid || 'unknown';
    const sender = m.key.participant || m.key.remoteJid || 'unknown';
    return reply(
      '╭━ JID INFO ━╮\n' +
      `Chat: ${chat}\n` +
      `Sender: ${sender}\n` +
      `Message ID: ${m.key.id || 'unknown'}`
    );
  },
};
