/**
 * ALMEER BOT — Plugin: ai.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'ai',
  aliases: ['ask', 'gpt', 'claude', 'bot'],
  category: 'ai',
  description: 'ask AI anything — .ai <question>',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .ai <question>\nexample: .ai explain quantum computing simply');
    await reply('🤖 _Thinking..._');
    try {
      const prompt = encodeURIComponent(
        `You are ALMEER AI, a helpful assistant inside WhatsApp. Answer concisely and clearly.\n\nUser: ${argText}\n\nAssistant:`
      );
      const res = await fetch(`https://text.pollinations.ai/${prompt}`, {
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error('api error');
      const text = (await res.text()).trim();
      if (!text) throw new Error('empty response');
      reply(`🤖 *ALMEER AI*\n\n${text}`);
    } catch (e) {
      reply('⚠️ AI is unavailable right now. Try again later.\n_(' + e.message + ')_');
    }
  },
};
