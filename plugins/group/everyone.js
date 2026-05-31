/**
 * ALMEER BOT — Plugin: everyone.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'everyone',
  aliases: ['tagall', 'all', 'mention'],
  category: 'group',
  description: 'tag all group members — groups only',
  owner: false,
  async run({ sock, m, chat, argText, reply }) {
    if (!chat.endsWith('@g.us')) return reply('❌ This command only works in groups.');
    const meta = await sock.groupMetadata(chat);
    const members = meta.participants.map(p => p.id);
    if (!members.length) return reply('❌ No members found.');
    const text = (argText || '📢 *Attention everyone!*') + '\n\n' + members.map(j => `@${j.split('@')[0]}`).join(' ');
    await sock.sendMessage(chat, { text, mentions: members }, { quoted: m });
  },
};
