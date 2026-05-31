/**
 * ALMEER BOT — Plugin: fact.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'fact',
  aliases: ['trivia', 'didyouknow', 'dyk'],
  category: 'general',
  description: 'get a random fun fact',
  async run({ reply }) {
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('api error');
      const { text } = await res.json();
      return reply(`🧠 *Random Fact*\n\n${text.replace(/`/g, "'")}`);
    } catch {
      // fallback: cat facts
      try {
        const res2 = await fetch('https://catfact.ninja/fact', { signal: AbortSignal.timeout(5000) });
        const { fact } = await res2.json();
        return reply(`🐱 *Cat Fact*\n\n${fact}`);
      } catch {
        return reply('⚠️ couldn\'t fetch a fact right now. Try again later.');
      }
    }
  },
};
