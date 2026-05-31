/**
 * ALMEER BOT — Plugin: toimg.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'toimg',
  aliases: ['unpkg', 'stickertoimg', 'stk2img'],
  category: 'general',
  description: 'convert sticker to image — quote a sticker then use .toimg',
  async run({ sock, m, chat, reply }) {
    const quotedCtx = m.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quotedCtx?.quotedMessage;

    let targetMsg = null;

    if (quotedMsg?.stickerMessage) {
      targetMsg = {
        key: {
          remoteJid: quotedCtx.remoteJid || m.key.remoteJid,
          id: quotedCtx.stanzaId,
          fromMe: false,
          participant: quotedCtx.participant,
        },
        message: quotedMsg,
      };
    } else if (m.message?.stickerMessage) {
      targetMsg = m;
    }

    if (!targetMsg) {
      return reply('❌ Quote a *sticker* with *.toimg*');
    }

    try {
      const buf = await downloadMediaMessage(targetMsg, 'buffer', {}, {
        reuploadRequest: sock.updateMediaMessage,
      });

      // Try sharp for conversion, fallback to raw webp as image
      let img = buf;
      let mimetype = 'image/webp';
      try {
        const { default: sharp } = await import('sharp');
        img = await sharp(buf).png().toBuffer();
        mimetype = 'image/png';
      } catch {
        // sharp not installed, send as webp image
      }

      await sock.sendMessage(chat, {
        image: img,
        mimetype,
        caption: '✅ Sticker → Image',
      }, { quoted: m });
    } catch (e) {
      return reply('⚠️ conversion failed: ' + e.message);
    }
  },
};
