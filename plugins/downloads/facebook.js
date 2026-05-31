/**
 * ALMEER BOT — Plugin: facebook.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'downloads',
  description: 'download facebook video',
  async run({ sock, m, chat, argText, reply }) {
    const url = argText.match(/https?:\/\/\S+/)?.[0];
    if (!url) return reply('usage: .facebook <url>');
    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    try {
      const r = await fetch('https://api.dreaded.site/api/facebook?url=' + encodeURIComponent(url));
      const j = await r.json();
      const link = j?.result?.hd || j?.result?.sd || j?.result?.url;
      if (!link) return reply('❌ no video found');
      await sock.sendMessage(chat, { video: { url: link }, caption: j?.result?.title || 'facebook' }, { quoted: m });
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) { reply('❌ ' + e.message); }
  },
};
