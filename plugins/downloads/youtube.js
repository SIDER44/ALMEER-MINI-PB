/**
 * ALMEER BOT — Plugin: youtube.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

async function search(q) {
  const r = await fetch('https://api.dreaded.site/api/ytsearch?query=' + encodeURIComponent(q));
  const j = await r.json();
  return j?.result?.[0] || j?.results?.[0] || null;
}

export default {
  name: 'youtube',
  aliases: ['yt', 'video', 'ytv'],
  category: 'downloads',
  description: 'download youtube video (url or search)',
  async run({ sock, m, chat, argText, reply }) {
    if (!argText) return reply('usage: .youtube <url|query>');
    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    try {
      let url = argText.match(/https?:\/\/\S+/)?.[0];
      if (!url) {
        const hit = await search(argText);
        url = hit?.url;
        if (!url) return reply('❌ nothing found');
      }
      const r = await fetch('https://api.dreaded.site/api/ytdl/video?url=' + encodeURIComponent(url));
      const j = await r.json();
      const link = j?.result?.url || j?.result?.download_url;
      if (!link) return reply('❌ download failed');
      await sock.sendMessage(chat, { video: { url: link }, caption: j?.result?.title || 'youtube' }, { quoted: m });
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) { reply('❌ ' + e.message); }
  },
};
