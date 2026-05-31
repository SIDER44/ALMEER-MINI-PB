/**
 * ALMEER BOT — Plugin: news.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'news',
  aliases: ['headlines', 'trending'],
  category: 'info',
  description: 'latest news headlines — .news <topic>',
  async run({ argText, reply }) {
    const topic = argText || 'world';
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error('fetch failed');
      const xml = await res.text();

      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
        const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(match[1]) || /<title>(.*?)<\/title>/.exec(match[1]);
        const sourceMatch = /<source[^>]*>(.*?)<\/source>/.exec(match[1]) || /<source[^>]*><!\[CDATA\[(.*?)\]\]><\/source>/.exec(match[1]);
        if (titleMatch) items.push({ title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'), source: sourceMatch?.[1] || '' });
      }
      if (!items.length) return reply(`⚠️ No news found for "${topic}".`);
      const lines = items.map((i, n) => `*${n+1}.* ${i.title}${i.source ? `\n     _— ${i.source}_` : ''}`).join('\n\n');
      reply(`📰 *News: ${topic.toUpperCase()}*\n━━━━━━━━━━━━━━━━\n\n${lines}`);
    } catch (e) {
      reply('⚠️ News fetch failed.\n_(' + e.message + ')_');
    }
  },
};
