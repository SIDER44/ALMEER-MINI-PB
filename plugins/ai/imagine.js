/**
 * ALMEER BOT — Plugin: imagine.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

export default {
  name: 'imagine',
  aliases: ['img', 'generate', 'draw', 'dalle'],
  category: 'ai',
  description: 'generate an AI image from a text prompt',
  async run({ argText, sock, chat, m, reply }) {
    if (!argText) return reply('usage: .imagine <description>\nexample: .imagine cyberpunk city at night neon lights');
    await reply('🎨 _Generating image, please wait..._');
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(argText)}?width=768&height=768&nologo=true&enhance=true&seed=${Date.now()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!res.ok) throw new Error('generation failed');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chat, {
        image: buf,
        caption: `🎨 *AI Image*\n_Prompt: ${argText}_`,
      }, { quoted: m });
    } catch (e) {
      reply('⚠️ Image generation failed. Try a simpler prompt.\n_(' + e.message + ')_');
    }
  },
};
