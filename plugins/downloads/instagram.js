/**
 * ALMEER BOT — Plugin: instagram.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
// instagram.js — Uses yt-dlp for reliable Instagram downloads (same approach as RIOT2).
// yt-dlp is auto-downloaded by play.js on first use; reuses the same binary.

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execP = promisify(exec);
const __dir = path.dirname(fileURLToPath(import.meta.url));
const YTDLP_PATH = path.resolve(__dir, '..', '..', 'yt-dlp');
const YTDLP_URL  = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const TMP_DIR    = '/tmp/almeer_ig';

async function ensureYtDlp() {
  if (fs.existsSync(YTDLP_PATH)) return;
  await execP(`curl -L -o "${YTDLP_PATH}" "${YTDLP_URL}" && chmod +x "${YTDLP_PATH}"`);
  if (!fs.existsSync(YTDLP_PATH)) throw new Error('yt-dlp download failed');
}

export default {
  name: 'instagram',
  aliases: ['ig', 'igdl', 'insta'],
  category: 'downloads',
  description: 'Download Instagram reel, post or story',
  async run({ sock, m, chat, argText, reply }) {
    const url = argText?.match(/https?:\/\/(www\.)?instagram\.com\/\S+/)?.[0];
    if (!url) return reply('📸 Usage: .instagram <Instagram post/reel URL>');

    await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
    await reply('📸 Downloading from Instagram...');

    try {
      await ensureYtDlp();
      if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

      const id  = Date.now();
      const out = `${TMP_DIR}/${id}.%(ext)s`;

      // Download with yt-dlp — supports reels, posts, carousels
      const { stderr } = await execP(
        `"${YTDLP_PATH}" -o "${out}" --no-playlist -q "${url}"`,
        { timeout: 90_000 }
      ).catch(e => { throw new Error(e.stderr || e.message); });

      // Find downloaded file(s)
      const files = fs.readdirSync(TMP_DIR)
        .filter(f => f.startsWith(String(id)))
        .map(f => path.join(TMP_DIR, f));

      if (!files.length) throw new Error('No file downloaded — post may be private or unavailable');

      let sent = 0;
      for (const file of files.slice(0, 5)) {
        const buf     = fs.readFileSync(file);
        const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(file);
        try {
          await sock.sendMessage(
            chat,
            isVideo
              ? { video: buf, caption: sent === 0 ? '📸 *Instagram Download*' : '', mimetype: 'video/mp4' }
              : { image: buf, caption: sent === 0 ? '📸 *Instagram Download*' : '' },
            { quoted: m }
          );
          sent++;
        } catch { /* skip failed item */ }
        // Clean up
        try { fs.unlinkSync(file); } catch {}
      }

      if (!sent) throw new Error('Could not send any media');
      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
      await sock.sendMessage(chat, { react: { text: '❌', key: m.key } });
      const msg = (e.message || '').toLowerCase();
      if (msg.includes('private') || msg.includes('login') || msg.includes('cookie')) {
        reply('❌ This post is private or requires login to download.');
      } else {
        reply('❌ Instagram download failed: ' + (e.message || 'unknown error').substring(0, 150));
      }
    }
  },
};
