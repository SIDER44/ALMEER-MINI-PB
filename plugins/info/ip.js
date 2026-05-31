/**
 * ALMEER BOT — Plugin: ip.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'ip',
  aliases: ['ipinfo', 'iplookup', 'ipcheck'],
  category: 'info',
  description: 'look up an IP address — .ip <address>',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .ip <ip address>\nexample: .ip 8.8.8.8');
    try {
      const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(argText)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query,mobile,proxy,hosting`, { signal: AbortSignal.timeout(8000) });
      const d = await res.json();
      if (d.status === 'fail') return reply(`⚠️ ${d.message || 'IP lookup failed'}`);
      reply(
        `╭━━〔 *🌐 IP LOOKUP* 〕━━┈⊷\n` +
        `┃ 🔍 IP        : ${d.query}\n` +
        `┃ 🌍 Country   : ${d.country}\n` +
        `┃ 📍 Region    : ${d.regionName}\n` +
        `┃ 🏙️ City      : ${d.city}\n` +
        `┃ 📮 ZIP       : ${d.zip || 'N/A'}\n` +
        `┃ 🕐 Timezone  : ${d.timezone}\n` +
        `┃ 🏢 ISP       : ${d.isp}\n` +
        `┃ 🏛️ Org       : ${d.org || 'N/A'}\n` +
        `┃ 📡 AS        : ${d.as || 'N/A'}\n` +
        `┃ 📱 Mobile    : ${d.mobile ? 'Yes' : 'No'}\n` +
        `┃ 🔒 Proxy/VPN : ${d.proxy ? 'Yes' : 'No'}\n` +
        `┃ ☁️ Hosting   : ${d.hosting ? 'Yes' : 'No'}\n` +
        `┃ 🗺️ Location  : ${d.lat}, ${d.lon}\n` +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply('⚠️ IP lookup failed.\n_(' + e.message + ')_');
    }
  },
};
