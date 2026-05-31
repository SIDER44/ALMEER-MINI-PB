/**
 * ALMEER BOT — Plugin: rewrite.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

const MODES = {
  formal: 'Rewrite the following text in a formal, professional tone:',
  casual: 'Rewrite the following text in a casual, friendly, conversational tone:',
  funny: 'Rewrite the following text in a funny and humorous way:',
  short: 'Rewrite the following text as short and concise as possible:',
  clear: 'Rewrite the following text to be clearer and easier to understand:',
};

export default {
  name: 'rewrite',
  aliases: ['rephrase', 'improve'],
  category: 'ai',
  description: 'rewrite text — .rewrite formal/casual/funny/short/clear <text>',
  async run({ args, m, reply }) {
    const mode = args[0]?.toLowerCase();
    const quotedText =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
      '';
    const input = quotedText || args.slice(mode && MODES[mode] ? 1 : 0).join(' ');
    if (!input) return reply('usage: .rewrite formal <text>\nor quote a message and use: .rewrite casual\n\nmodes: formal, casual, funny, short, clear');
    const instruction = MODES[mode] || MODES.clear;
    await reply('✍️ _Rewriting..._');
    try {
      const prompt = encodeURIComponent(`${instruction}\n\n"${input}"\n\nRewritten:`);
      const res = await fetch(`https://text.pollinations.ai/${prompt}`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error('api error');
      const text = (await res.text()).trim();
      reply(`✍️ *Rewritten (${mode || 'clear'})*\n\n${text}`);
    } catch (e) {
      reply('⚠️ Rewrite failed. Try again.\n_(' + e.message + ')_');
    }
  },
};
