/**
 * ALMEER BOT — Plugin: tts.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';

const VOICES = ['Brian', 'Amy', 'Emma', 'Joanna', 'Joey', 'Justin', 'Kendra', 'Kimberly', 'Matthew', 'Nicole', 'Russell', 'Salli'];

export default {
  name: 'tts',
  aliases: ['say', 'speak', 'voice'],
  category: 'media',
  description: 'convert text to speech — .tts <text>',
  async run({ argText, args, sock, chat, m, reply }) {
    let voice = 'Brian';
    let text = argText;
    if (VOICES.map(v => v.toLowerCase()).includes(args[0]?.toLowerCase())) {
      voice = VOICES.find(v => v.toLowerCase() === args[0].toLowerCase());
      text = args.slice(1).join(' ');
    }
    if (!text) return reply(`usage: .tts <text>\n       .tts Brian Hello world\n\nvoices: ${VOICES.join(', ')}`);
    if (text.length > 300) return reply('⚠️ Text too long (max 300 characters).');
    try {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error('tts api error');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chat, { audio: buf, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
    } catch (e) {
      reply('⚠️ TTS failed. Try again.\n_(' + e.message + ')_');
    }
  },
};
