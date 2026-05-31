/**
 * ALMEER BOT — Plugin: currency.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'currency',
  aliases: ['convert', 'fx', 'exchange'],
  category: 'info',
  description: 'live currency conversion — .currency 100 USD KES',
  async run({ args, reply }) {
    const amount = parseFloat(args[0]);
    const from = args[1]?.toUpperCase();
    const to = args[2]?.toUpperCase();
    if (!amount || !from || !to) return reply('usage: .currency <amount> <from> <to>\nexample: .currency 100 USD KES\nexample: .currency 50 EUR GBP');
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}&amount=${amount}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('invalid currency code');
      const data = await res.json();
      const result = data.rates?.[to];
      if (!result) throw new Error('rate not available');
      reply(
        `╭━━〔 *💱 CURRENCY* 〕━━┈⊷\n` +
        `┃ 💵 ${amount} ${from}\n` +
        `┃      =\n` +
        `┃ 💵 ${result.toFixed(4)} ${to}\n` +
        `┃\n` +
        `┃ 🕐 Rate updated: today\n` +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply(`⚠️ Conversion failed. Check currency codes (e.g. USD, EUR, KES, GBP).\n_(' + e.message + ')_`);
    }
  },
};
