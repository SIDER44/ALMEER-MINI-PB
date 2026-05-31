/**
 * ALMEER BOT — Plugin: ytmp3.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'ytmp3',
  aliases: ['yta', 'ytaudio', 'mp3'],
  category: 'media',
  description: 'download YouTube audio — .ytmp3 <url>',
  async run({ argText, sock, chat, m, reply }) {
    if (!argText) return reply('usage: .ytmp3 <youtube url>\nexample: .ytmp3 https://youtu.be/dQw4w9WgXcQ');
    await reply('⬇️ _Downloading audio..._');
    try {
      const res = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ url: argText, downloadMode: 'audio', aFormat: 'mp3', filenameStyle: 'pretty' }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error?.code || 'no download URL returned');

      const audio = await fetch(data.url, { signal: AbortSignal.timeout(60000) });
      if (!audio.ok) throw new Error('audio download failed');
      const buf = Buffer.from(await audio.arrayBuffer());
      if (buf.length > 60 * 1024 * 1024) return reply('⚠️ File too large to send (>60MB).');
      await sock.sendMessage(chat, { audio: buf, mimetype: 'audio/mpeg', ptt: false }, { quoted: m });
    } catch (e) {
      reply('⚠️ Download failed. Make sure the URL is a valid YouTube link.\n_(' + e.message + ')_');
    }
  },
};
