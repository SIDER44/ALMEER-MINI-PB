/**
 * ALMEER BOT — Plugin: dns.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import dns from 'dns/promises';

const TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];

export default {
  name: 'dns',
  aliases: ['dnslookup', 'nslookup'],
  category: 'info',
  description: 'DNS lookup — .dns <domain> [type]',
  async run({ args, reply }) {
    const domain = args[0];
    if (!domain) return reply('usage: .dns <domain> [type]\nexample: .dns google.com\nexample: .dns google.com MX\ntypes: A, AAAA, MX, NS, TXT, CNAME');
    const type = args[1]?.toUpperCase() || 'A';
    if (!TYPES.includes(type)) return reply(`invalid type. use: ${TYPES.join(', ')}`);
    try {
      let records;
      if (type === 'A') records = await dns.resolve4(domain);
      else if (type === 'AAAA') records = await dns.resolve6(domain);
      else if (type === 'MX') records = (await dns.resolveMx(domain)).map(r => `${r.priority} ${r.exchange}`);
      else if (type === 'NS') records = await dns.resolveNs(domain);
      else if (type === 'TXT') records = (await dns.resolveTxt(domain)).map(r => r.join(' '));
      else if (type === 'CNAME') records = await dns.resolveCname(domain);

      if (!records.length) return reply(`⚠️ No ${type} records found for ${domain}`);
      reply(
        `╭━━〔 *🔍 DNS LOOKUP* 〕━━┈⊷\n` +
        `┃ 🌐 Domain : ${domain}\n` +
        `┃ 📋 Type   : ${type}\n` +
        `┃━━━━━━━━━━━━━━━━━━\n` +
        records.map(r => `┃ • ${r}`).join('\n') + '\n' +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply(`⚠️ DNS lookup failed for ${domain}.\n_(' + e.message + ')_`);
    }
  },
};
