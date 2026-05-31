/**
 * ALMEER BOT — Plugin: caption.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'caption',
  aliases: ['describe', 'whatisthis'],
  category: 'ai',
  description: 'generate AI caption for a quoted/sent image',
  async run({ sock, m, chat, reply }) {
    const quotedCtx = m.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quotedCtx?.quotedMessage;
    let targetMsg = null;
    if (quotedMsg?.imageMessage) {
      targetMsg = {
        key: { remoteJid: quotedCtx.remoteJid || m.key.remoteJid, id: quotedCtx.stanzaId, fromMe: false, participant: quotedCtx.participant },
        message: quotedMsg,
      };
    } else if (m.message?.imageMessage) {
      targetMsg = m;
    }
    if (!targetMsg) return reply('❌ Send or quote an image with .caption');

    await reply('🔍 _Analyzing image..._');
    try {
      const buf = await downloadMediaMessage(targetMsg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
      const base64 = buf.toString('base64');
      const mimeType = targetMsg.message?.imageMessage?.mimetype || 'image/jpeg';

      // Use Pollinations OpenAI-compatible vision endpoint
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in 2-3 sentences. Be specific and vivid.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          }],
          max_tokens: 200,
        }),
        signal: AbortSignal.timeout(40000),
      });
      if (!res.ok) throw new Error('api error ' + res.status);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || 'Could not describe image.';
      reply(`🖼️ *Image Caption*\n\n${text}`);
    } catch (e) {
      reply('⚠️ Caption failed. Try again.\n_(' + e.message + ')_');
    }
  },
};
