/**
 * ALMEER BOT — Plugin: quote.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

const FALLBACK = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { content: "The mind is everything. What you think you become.", author: "Buddha" },
];

export default {
  name: 'quote',
  aliases: ['inspire', 'motivation', 'qod'],
  category: 'fun',
  description: 'get a random motivational quote',
  async run({ reply }) {
    try {
      const res = await fetch('https://api.quotable.io/random', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const { content, author } = await res.json();
      return reply(`💬 *Quote*\n\n_"${content}"_\n\n— *${author}*`);
    } catch {
      const q = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      return reply(`💬 *Quote*\n\n_"${q.content}"_\n\n— *${q.author}*`);
    }
  },
};
