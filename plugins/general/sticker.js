/**
 * ALMEER BOT — Plugin: sticker.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker', 'take'],
  category: 'general',
  description: 'convert image to sticker — send/quote an image then use .s',
  async run({ sock, m, chat, reply }) {
    // ── Resolve target: quoted image or the message itself
    const quotedCtx = m.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quotedCtx?.quotedMessage;

    let targetMsg = null;

    if (quotedMsg?.imageMessage) {
      targetMsg = {
        key: {
          remoteJid: quotedCtx.remoteJid || m.key.remoteJid,
          id: quotedCtx.stanzaId,
          fromMe: false,
          participant: quotedCtx.participant,
        },
        message: quotedMsg,
      };
    } else if (m.message?.imageMessage) {
      targetMsg = m;
    }

    if (!targetMsg) {
      return reply('❌ Send or quote an *image* with *.sticker*\n\nexample: send a photo with caption *.s*');
    }

    try {
      await reply('⏳ Creating sticker...');
      const buf = await downloadMediaMessage(targetMsg, 'buffer', {}, {
        reuploadRequest: sock.updateMediaMessage,
      });

      // Try to use sharp if available, otherwise send raw buffer as sticker
      let webp = buf;
      try {
        const { default: sharp } = await import('sharp');
        webp = await sharp(buf)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 80 })
          .toBuffer();
      } catch {
        // sharp not installed — send raw buffer, WhatsApp usually handles it
      }

      await sock.sendMessage(chat, { sticker: webp }, { quoted: m });
    } catch (e) {
      return reply('⚠️ sticker creation failed: ' + e.message);
    }
  },
};
