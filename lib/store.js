/**
 * ALMEER BOT — store.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
// In-memory message cache for anti-delete / anti-edit / view-once unlock.
// Pre-downloads media buffers so we can re-send them after WhatsApp deletes
// the original (media keys would otherwise be unrecoverable after revoke).
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const MAX = 4000;
const cache = new Map(); // key: `${chat}|${id}` -> { ...waMessage, _mediaBuffer, _mediaType }

function key(chat, id) { return `${chat}|${id}`; }

function unwrap(message) {
  let c = message;
  for (let i = 0; i < 6; i++) {
    const inner =
      c?.ephemeralMessage?.message ||
      c?.viewOnceMessage?.message ||
      c?.viewOnceMessageV2?.message ||
      c?.viewOnceMessageV2Extension?.message ||
      c?.documentWithCaptionMessage?.message ||
      c?.editedMessage?.message;
    if (!inner) break;
    c = inner;
  }
  return c || message;
}

function detectMediaType(message) {
  const inner = unwrap(message || {});
  if (inner?.imageMessage) return 'image';
  if (inner?.videoMessage) return 'video';
  if (inner?.audioMessage) return 'audio';
  if (inner?.stickerMessage) return 'sticker';
  if (inner?.documentMessage) return 'document';
  return null;
}

// FIX: accepts sock so downloadMediaMessage can refresh expired URLs via reuploadRequest
export async function rememberMessage(msg, logger, sock) {
  if (!msg?.key?.id || !msg?.key?.remoteJid) return;
  if (!msg.message) return;
  const k = key(msg.key.remoteJid, msg.key.id);

  const entry = {
    ...msg,
    pushName: msg.pushName,
    messageTimestamp: Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000),
    _savedAt: Date.now(),
    _mediaBuffer: null,
    _mediaType: detectMediaType(msg.message),
  };
  cache.set(k, entry);
  if (cache.size > MAX) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }

  // Pre-download media so we can re-forward after delete.
  // Pass reuploadRequest so Baileys can refresh expired download URLs.
  if (entry._mediaType) {
    try {
      const inner = unwrap(msg.message);
      const fake = { ...msg, message: inner };
      const buf = await downloadMediaMessage(
        fake,
        'buffer',
        {},
        { reuploadRequest: sock?.updateMediaMessage }
      );
      entry._mediaBuffer = buf;
    } catch (e) {
      logger?.warn?.('media pre-cache failed', e?.message);
    }
  }
}

export function getMessage(chat, id) {
  return cache.get(key(chat, id));
}

export function findMessageById(id, preferredChat) {
  if (!id) return null;
  if (preferredChat) {
    const direct = getMessage(preferredChat, id);
    if (direct) return direct;
  }
  for (const msg of cache.values()) {
    if (msg?.key?.id === id) return msg;
  }
  return null;
}

export function cacheStats() {
  return { size: cache.size };
}

export function getRecentStatusMessages(limit = 5) {
  return [...cache.values()]
    .filter(m => m?.key?.remoteJid === 'status@broadcast')
    .sort((a, b) => (b._savedAt || 0) - (a._savedAt || 0))
    .slice(0, limit);
}

export function replaceMessage(chat, id, msg) {
  cache.set(key(chat, id), msg);
}

export function removeMessage(chat, id) {
  cache.delete(key(chat, id));
}
