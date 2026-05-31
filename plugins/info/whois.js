/**
 * ALMEER BOT — Plugin: whois.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'whois',
  aliases: ['domaininfo', 'domain'],
  category: 'info',
  description: 'WHOIS domain lookup — .whois <domain>',
  async run({ argText, reply }) {
    const domain = argText.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (!domain) return reply('usage: .whois <domain>\nexample: .whois google.com');
    try {
      const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error('domain not found');
      const d = await res.json();
      const registrar = d.entities?.find(e => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || 'N/A';
      const registrant = d.entities?.find(e => e.roles?.includes('registrant'))?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || 'Redacted';
      const created = d.events?.find(e => e.eventAction === 'registration')?.eventDate?.split('T')[0] || 'N/A';
      const updated = d.events?.find(e => e.eventAction === 'last changed')?.eventDate?.split('T')[0] || 'N/A';
      const expiry = d.events?.find(e => e.eventAction === 'expiration')?.eventDate?.split('T')[0] || 'N/A';
      const ns = d.nameservers?.map(n => n.ldhName).join('\n┃             ') || 'N/A';
      const status = d.status?.join(', ') || 'N/A';
      reply(
        `╭━━〔 *🔎 WHOIS* 〕━━┈⊷\n` +
        `┃ 🌐 Domain     : ${domain}\n` +
        `┃ 🏢 Registrar  : ${registrar}\n` +
        `┃ 👤 Registrant : ${registrant}\n` +
        `┃ 📅 Created    : ${created}\n` +
        `┃ 🔄 Updated    : ${updated}\n` +
        `┃ ⏰ Expires    : ${expiry}\n` +
        `┃ 📡 Nameserver : ${ns}\n` +
        `┃ 🔒 Status     : ${status}\n` +
        `╰━━━━━━━━━━━━━━━━━━┈⊷`
      );
    } catch (e) {
      reply(`⚠️ WHOIS lookup failed for "${domain}".\n_(' + e.message + ')_`);
    }
  },
};
