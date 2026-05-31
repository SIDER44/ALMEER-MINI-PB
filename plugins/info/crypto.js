/**
 * ALMEER BOT — Plugin: crypto.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

const COIN_MAP = {
  btc: 'bitcoin', bitcoin: 'bitcoin',
  eth: 'ethereum', ethereum: 'ethereum',
  bnb: 'binancecoin',
  sol: 'solana', solana: 'solana',
  xrp: 'ripple', ripple: 'ripple',
  ada: 'cardano', cardano: 'cardano',
  doge: 'dogecoin', dogecoin: 'dogecoin',
  dot: 'polkadot', polkadot: 'polkadot',
  matic: 'matic-network', polygon: 'matic-network',
  ltc: 'litecoin', litecoin: 'litecoin',
  shib: 'shiba-inu',
  avax: 'avalanche-2',
};

export default {
  name: 'crypto',
  aliases: ['coin', 'price', 'btc', 'eth'],
  category: 'info',
  description: 'get live crypto price — .crypto btc',
  async run({ args, cmdName, reply }) {
    const input = (args[0] || cmdName).toLowerCase();
    const coinId = COIN_MAP[input] || input;
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,kes,eur&include_24hr_change=true&include_market_cap=true`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      if (!data[coinId]) return reply(`⚠️ Coin "${input}" not found.\nexamples: .crypto btc, .crypto eth, .crypto doge`);
      const c = data[coinId];
      const change = c.usd_24h_change?.toFixed(2);
      const arrow = c.usd_24h_change > 0 ? '📈' : '📉';
      const cap = c.usd_market_cap ? `$${(c.usd_market_cap / 1e9).toFixed(2)}B` : 'N/A';
      reply(
        `╭━━〔 *₿ CRYPTO PRICE* 〕━━┈⊷\n` +
        `┃ 💰 Coin       : ${coinId.toUpperCase()}\n` +
        `┃ 💵 USD        : $${c.usd?.toLocaleString()}\n` +
        `┃ 🇰🇪 KES        : KES ${c.kes?.toLocaleString() || 'N/A'}\n` +
        `┃ 💶 EUR        : €${c.eur?.toLocaleString()}\n` +
        `┃ ${arrow} 24h Change : ${change > 0 ? '+' : ''}${change}%\n` +
        `┃ 📊 Market Cap : ${cap}\n` +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply('⚠️ Crypto price fetch failed.\n_(' + e.message + ')_');
    }
  },
};
