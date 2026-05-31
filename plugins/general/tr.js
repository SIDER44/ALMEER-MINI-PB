/**
 * ALMEER BOT — Plugin: tr.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'tr',
  aliases: ['translate', 'trans'],
  category: 'general',
  description: 'translate text to any language',
  async run({ argText, reply }) {
    const parts = argText.trim().split(/\s+/);
    const lang = parts[0]?.toLowerCase();
    const text = parts.slice(1).join(' ');
    if (!lang || !text) {
      return reply(
        'usage: .tr <language_code> <text>\n\n' +
        'examples:\n' +
        '  .tr es Hello world   → Spanish\n' +
        '  .tr sw How are you   → Swahili\n' +
        '  .tr fr Good morning  → French\n' +
        '  .tr ar Thank you     → Arabic\n\n' +
        'codes: en es fr sw ar zh ja de ru pt it'
      );
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('api error');
      const data = await res.json();
      // Response: [[[translated, original, null, null, 1]], null, detectedLang, ...]
      const translated = data?.[0]?.map(s => s?.[0]).filter(Boolean).join('') || null;
      if (!translated) throw new Error('empty response');
      const detected = data?.[2] || 'auto';
      return reply(
        `🌐 *Translate*\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `*[${detected} → ${lang}]*\n\n` +
        `*Original:*\n${text}\n\n` +
        `*Translated:*\n${translated}`
      );
    } catch {
      return reply(
        `⚠️ translation failed for "${lang}". Try again or check the language code.\n\n` +
        'Common codes:\nes=Spanish, fr=French, sw=Swahili, ar=Arabic, zh=Chinese, ja=Japanese, de=German, ru=Russian, pt=Portuguese'
      );
    }
  },
};
