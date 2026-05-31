/**
 * ALMEER BOT — Plugin: tiktok.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'tiktok',
  aliases: ['tt', 'tiktokdl'],
  category: 'downloads',
  description: 'download tiktok video (no watermark)',
  async run({ sock, m, chat, argText, reply }) {
    const url = argText.match(/https?:\/\/\S+/)?.[0];
    if (!url) return reply('usage: .tiktok <url>');
    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    try {
      const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url));
      const j = await r.json();
      if (!j?.data) return reply('❌ tiktok api error');
      const video = j.data.play || j.data.wmplay;
      const caption = `🎵 *${j.data.title || 'tiktok'}*\n👤 ${j.data.author?.unique_id || ''}`;
      await sock.sendMessage(chat, { video: { url: video }, caption }, { quoted: m });
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
      reply('❌ ' + e.message);
    }
  },
};
