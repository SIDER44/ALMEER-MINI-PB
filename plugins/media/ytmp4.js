/**
 * ALMEER BOT — Plugin: ytmp4.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'ytmp4',
  aliases: ['ytv', 'ytvideo', 'mp4'],
  category: 'media',
  description: 'download YouTube video — .ytmp4 <url>',
  async run({ argText, sock, chat, m, reply }) {
    if (!argText) return reply('usage: .ytmp4 <youtube url>\nexample: .ytmp4 https://youtu.be/dQw4w9WgXcQ');
    await reply('⬇️ _Downloading video..._');
    try {
      const res = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ url: argText, downloadMode: 'auto', videoQuality: '720', filenameStyle: 'pretty' }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error?.code || 'no download URL returned');

      const video = await fetch(data.url, { signal: AbortSignal.timeout(120000) });
      if (!video.ok) throw new Error('video download failed');
      const buf = Buffer.from(await video.arrayBuffer());
      if (buf.length > 64 * 1024 * 1024) return reply('⚠️ Video too large to send via WhatsApp (>64MB). Try ytmp3 instead.');
      await sock.sendMessage(chat, { video: buf, mimetype: 'video/mp4', caption: '🎬 Downloaded via ALMEER MINI' }, { quoted: m });
    } catch (e) {
      reply('⚠️ Download failed. Make sure the URL is a valid YouTube link.\n_(' + e.message + ')_');
    }
  },
};
