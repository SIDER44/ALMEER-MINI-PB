/**
 * ALMEER BOT — Plugin: ss.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'ss',
  aliases: ['screenshot', 'snap', 'webshot'],
  category: 'media',
  description: 'take a screenshot of any website — .ss <url>',
  async run({ argText, sock, chat, m, reply }) {
    let url = argText.trim();
    if (!url) return reply('usage: .ss <url>\nexample: .ss https://google.com');
    if (!url.startsWith('http')) url = 'https://' + url;
    await reply('📸 _Taking screenshot..._');
    try {
      const ssUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(url)}`;
      const res = await fetch(ssUrl, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error('screenshot api error');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chat, {
        image: buf,
        caption: `📸 *Screenshot*\n🔗 ${url}`,
      }, { quoted: m });
    } catch (e) {
      reply('⚠️ Screenshot failed. Check the URL.\n_(' + e.message + ')_');
    }
  },
};
