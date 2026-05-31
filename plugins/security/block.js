/**
 * ALMEER BOT — Plugin: block.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'block',
  aliases: ['blacklist'],
  category: 'security',
  description: 'block a contact — .block @user or .block number',
  owner: true,
  async run({ sock, m, args, reply }) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let jid = mentions[0] || null;
    if (!jid && args[0]) {
      const num = args[0].replace(/[^0-9]/g, '');
      if (num) jid = `${num}@s.whatsapp.net`;
    }
    if (!jid) return reply('usage: .block @user\nor .block 254700000000');
    try {
      await sock.updateBlockStatus(jid, 'block');
      reply(`🚫 *${jid.split('@')[0]}* has been blocked.`);
    } catch (e) {
      reply('⚠️ Block failed.\n_(' + e.message + ')_');
    }
  },
};
