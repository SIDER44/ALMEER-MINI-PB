/**
 * ALMEER BOT — Plugin: unblock.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'unblock',
  aliases: ['whitelist'],
  category: 'security',
  description: 'unblock a contact — .unblock @user',
  owner: true,
  async run({ sock, m, args, reply }) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let jid = mentions[0] || null;
    if (!jid && args[0]) {
      const num = args[0].replace(/[^0-9]/g, '');
      if (num) jid = `${num}@s.whatsapp.net`;
    }
    if (!jid) return reply('usage: .unblock @user\nor .unblock 254700000000');
    try {
      await sock.updateBlockStatus(jid, 'unblock');
      reply(`✅ *${jid.split('@')[0]}* has been unblocked.`);
    } catch (e) {
      reply('⚠️ Unblock failed.\n_(' + e.message + ')_');
    }
  },
};
