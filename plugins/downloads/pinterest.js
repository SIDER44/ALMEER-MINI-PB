/**
 * ALMEER BOT — Plugin: pinterest.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'pinterest',
  aliases: ['pin'],
  category: 'downloads',
  description: 'search pinterest images',
  async run({ sock, m, chat, argText, reply }) {
    if (!argText) return reply('usage: .pinterest <query>');
    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    try {
      const r = await fetch('https://api.dreaded.site/api/pinterest?query=' + encodeURIComponent(argText));
      const j = await r.json();
      const urls = (j?.result || []).slice(0, 5);
      if (!urls.length) return reply('❌ nothing found');
      for (const u of urls) {
        const link = typeof u === 'string' ? u : (u.url || u.image);
        if (link) await sock.sendMessage(chat, { image: { url: link } }, { quoted: m });
      }
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) { reply('❌ ' + e.message); }
  },
};
