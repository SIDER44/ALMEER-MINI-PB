/**
 * ALMEER BOT — Plugin: genius.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'genius',
  aliases: ['songinfo', 'track', 'musicsearch'],
  category: 'music',
  description: 'search song info — .genius <song name>',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .genius <song name>\nexample: .genius Blinding Lights The Weeknd');
    try {
      const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(argText)}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('search failed');
      const data = await res.json();
      const tracks = data?.data?.slice(0, 5);
      if (!tracks?.length) return reply(`⚠️ No results for "${argText}".`);
      const lines = tracks.map((t, i) =>
        `*${i + 1}.* ${t.title}\n    👤 ${t.artist.name}\n    💿 ${t.album?.title || 'Unknown Album'}`
      ).join('\n\n');
      reply(`🎵 *Search Results: ${argText}*\n━━━━━━━━━━━━━━━━\n\n${lines}\n\n_Use .lyrics <song name> to get lyrics_`);
    } catch (e) {
      reply('⚠️ Song search failed.\n_(' + e.message + ')_');
    }
  },
};
