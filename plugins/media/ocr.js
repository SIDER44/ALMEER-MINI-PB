/**
 * ALMEER BOT — Plugin: ocr.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fetch from 'node-fetch';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'ocr',
  aliases: ['readtext', 'scantext', 'extract'],
  category: 'media',
  description: 'extract text from an image — quote/send image then .ocr',
  async run({ sock, m, chat, reply }) {
    const quotedCtx = m.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quotedCtx?.quotedMessage;
    let targetMsg = null;
    if (quotedMsg?.imageMessage) {
      targetMsg = { key: { remoteJid: quotedCtx.remoteJid || m.key.remoteJid, id: quotedCtx.stanzaId, fromMe: false, participant: quotedCtx.participant }, message: quotedMsg };
    } else if (m.message?.imageMessage) {
      targetMsg = m;
    }
    if (!targetMsg) return reply('❌ Send or quote an image with .ocr');

    await reply('🔍 _Reading text from image..._');
    try {
      const buf = await downloadMediaMessage(targetMsg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
      const base64 = buf.toString('base64');

      const apiKey = process.env.OCR_SPACE_KEY || 'helloworld';
      const form = new URLSearchParams();
      form.append('base64Image', 'data:image/jpeg;base64,' + base64);
      form.append('language', 'eng');
      form.append('isOverlayRequired', 'false');
      form.append('scale', 'true');
      form.append('detectOrientation', 'true');

      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      const text = data?.ParsedResults?.[0]?.ParsedText?.trim();
      if (!text) return reply('⚠️ No text found in image.\n_Tip: add OCR_SPACE_KEY= in .env for better results_');
      reply(`📄 *Extracted Text*\n\n${text}`);
    } catch (e) {
      reply('⚠️ OCR failed.\n_Tip: Set OCR_SPACE_KEY in .env (free at ocr.space)\n(' + e.message + ')_');
    }
  },
};
