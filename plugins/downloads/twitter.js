/**
 * ALMEER BOT — Plugin: twitter.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'twitter',
  aliases: ['x', 'xdl', 'twitterdl'],
  category: 'downloads',
  description: 'download twitter / x video',
  async run({ sock, m, chat, argText, reply }) {
    const url = argText.match(/https?:\/\/\S+/)?.[0];
    if (!url) return reply('usage: .twitter <url>');
    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    try {
      const r = await fetch('https://api.dreaded.site/api/twitter?url=' + encodeURIComponent(url));
      const j = await r.json();
      const link = j?.result?.video || j?.result?.url || j?.result?.HD;
      if (!link) return reply('❌ no video found');
      await sock.sendMessage(chat, { video: { url: link } }, { quoted: m });
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) { reply('❌ ' + e.message); }
  },
};
