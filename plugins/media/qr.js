/**
 * ALMEER BOT — Plugin: qr.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'qr',
  aliases: ['qrcode', 'genqr'],
  category: 'media',
  description: 'generate QR code — .qr <text or URL>',
  async run({ argText, sock, chat, m, reply }) {
    if (!argText) return reply('usage: .qr <text or link>\nexample: .qr https://almeer.dev\nexample: .qr Hello World');
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(argText)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('qr api error');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chat, {
        image: buf,
        caption: `📱 *QR Code*\n_Data: ${argText.substring(0, 80)}${argText.length > 80 ? '...' : ''}_`,
      }, { quoted: m });
    } catch (e) {
      reply('⚠️ QR generation failed.\n_(' + e.message + ')_');
    }
  },
};
