/**
 * ALMEER BOT — Plugin: joke.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'joke',
  aliases: ['funny', 'lol'],
  category: 'general',
  description: 'get a random joke',
  async run({ reply }) {
    try {
      const res = await fetch('https://official-joke-api.appspot.com/random_joke', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('api error');
      const { setup, punchline, type } = await res.json();
      return reply(`😂 *Joke* [${type || 'general'}]\n\n${setup}\n\n_${punchline}_`);
    } catch {
      return reply('⚠️ couldn\'t fetch a joke right now. Try again later.');
    }
  },
};
