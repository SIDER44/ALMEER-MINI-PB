/**
 * ALMEER BOT — Plugin: summarize.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'summarize',
  aliases: ['sum', 'tldr', 'brief'],
  category: 'ai',
  description: 'summarize a long quoted message — quote text then .summarize',
  async run({ m, argText, reply }) {
    const quotedText =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
      '';
    const input = quotedText || argText;
    if (!input) return reply('Quote a long message and send .summarize\nor: .summarize <paste text here>');
    if (input.length < 50) return reply('⚠️ Text is too short to summarize.');
    await reply('📝 _Summarizing..._');
    try {
      const prompt = encodeURIComponent(`Summarize the following text in 3-5 bullet points. Be concise and clear:\n\n"${input}"\n\nSummary:`);
      const res = await fetch(`https://text.pollinations.ai/${prompt}`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error('api error');
      const text = (await res.text()).trim();
      reply(`📋 *Summary*\n\n${text}`);
    } catch (e) {
      reply('⚠️ Summarization failed. Try again.\n_(' + e.message + ')_');
    }
  },
};
