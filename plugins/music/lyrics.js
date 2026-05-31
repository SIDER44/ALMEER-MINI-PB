/**
 * ALMEER BOT — Plugin: lyrics.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'lyrics',
  aliases: ['lyric', 'song'],
  category: 'music',
  description: 'get song lyrics — .lyrics <song name>',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .lyrics <song name>\nexample: .lyrics Bohemian Rhapsody\nexample: .lyrics Ed Sheeran Shape of You');
    try {
      // Step 1: search to get artist + title
      const searchRes = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(argText)}`, { signal: AbortSignal.timeout(8000) });
      if (!searchRes.ok) throw new Error('search failed');
      const searchData = await searchRes.json();
      const track = searchData?.data?.[0];
      if (!track) return reply(`⚠️ No song found for "${argText}". Try being more specific.`);

      const artist = track.artist.name;
      const title = track.title;

      // Step 2: fetch lyrics
      const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { signal: AbortSignal.timeout(8000) });
      const lyricsData = await lyricsRes.json();
      if (!lyricsData.lyrics) return reply(`⚠️ Lyrics not available for "${title}" by ${artist}.`);

      const lyrics = lyricsData.lyrics.trim();
      const chunk = lyrics.length > 3000 ? lyrics.substring(0, 3000) + '\n\n_...lyrics truncated (too long)_' : lyrics;
      reply(`🎵 *${title}*\n👤 ${artist}\n━━━━━━━━━━━━━━━━\n\n${chunk}`);
    } catch (e) {
      reply('⚠️ Lyrics fetch failed.\n_(' + e.message + ')_');
    }
  },
};
