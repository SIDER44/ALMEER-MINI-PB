/**
 * ALMEER BOT — Plugin: play.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
// play.js — Uses yt-dlp for reliable YouTube audio download.
// yt-dlp is the gold-standard YouTube downloader (actively maintained, handles all anti-bot measures).
// On first run it auto-downloads the yt-dlp binary from GitHub — no extra npm packages needed.

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execP = promisify(exec);
const __dir = path.dirname(fileURLToPath(import.meta.url));
// Store yt-dlp binary next to the bot root (2 levels up from plugins/downloads/)
const YTDLP_PATH = path.resolve(__dir, '..', '..', 'yt-dlp');
const YTDLP_URL  = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

// Ensure yt-dlp binary exists; download it if not.
async function ensureYtDlp() {
  if (fs.existsSync(YTDLP_PATH)) return;
  // Download binary from GitHub releases
  await execP(`curl -L -o "${YTDLP_PATH}" "${YTDLP_URL}" && chmod +x "${YTDLP_PATH}"`);
  if (!fs.existsSync(YTDLP_PATH)) throw new Error('yt-dlp download failed');
}

// Download audio for a search query or URL, returns { file, title, duration, artist }
async function downloadAudio(query) {
  await ensureYtDlp();

  const tmpBase = `/tmp/ytplay_${Date.now()}`;
  const outTemplate = `${tmpBase}.%(ext)s`;

  // ytsearch1: prefix makes yt-dlp search YouTube when input is not a URL
  const isUrl = /^https?:\/\//i.test(query);
  const target = isUrl ? `"${query}"` : `"ytsearch1:${query}"`;

  // -x = extract audio, --audio-format mp3, --no-playlist, -q = quiet
  // --socket-timeout 30 to avoid hanging
  const cmd = `"${YTDLP_PATH}" -x --audio-format mp3 --audio-quality 128K \
    --no-playlist --no-warnings -q \
    --socket-timeout 30 \
    --print-json \
    -o "${outTemplate}" \
    ${target}`;

  let stdout = '';
  try {
    const result = await execP(cmd, { timeout: 120_000 });
    stdout = result.stdout?.trim();
  } catch (e) {
    throw new Error('yt-dlp error: ' + (e.stderr || e.message || 'unknown').substring(0, 200));
  }

  // yt-dlp prints JSON for the downloaded video when --print-json is used
  let meta = {};
  try { meta = JSON.parse(stdout.split('\n').filter(l => l.startsWith('{')).pop() || '{}'); } catch {}

  // Find the output file (yt-dlp converts to mp3)
  const mp3File = `${tmpBase}.mp3`;
  if (!fs.existsSync(mp3File)) {
    // Try any extension as fallback
    const dir = path.dirname(tmpBase);
    const base = path.basename(tmpBase);
    const found = fs.readdirSync(dir).find(f => f.startsWith(base));
    if (!found) throw new Error('Audio file not found after download');
    return { file: path.join(dir, found), ...parseMeta(meta) };
  }

  return { file: mp3File, ...parseMeta(meta) };
}

function parseMeta(meta) {
  const dur = meta.duration || 0;
  const mins = String(Math.floor(dur / 60)).padStart(2, '0');
  const secs = String(Math.floor(dur % 60)).padStart(2, '0');
  return {
    title: meta.title || meta.fulltitle || 'Unknown',
    artist: meta.uploader || meta.channel || '',
    durationStr: `${mins}:${secs}`,
  };
}

export default {
  name: 'play',
  aliases: ['song', 'mp3', 'ytmp3'],
  category: 'downloads',
  description: 'Download and send a song — .play faded by alan walker',
  async run({ sock, m, chat, argText, reply }) {
    if (!argText) return reply('🎵 Usage: .play <song name>\nExample: .play faded by alan walker');

    await sock.sendMessage(chat, { react: { text: '🔍', key: m.key } });
    await reply(`🔍 Searching: *${argText}*`);

    let audioInfo = null;
    try {
      await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } });
      audioInfo = await downloadAudio(argText);
    } catch (e) {
      await sock.sendMessage(chat, { react: { text: '❌', key: m.key } });
      return reply('❌ Download failed: ' + (e.message || 'unknown error'));
    }

    try {
      const buf = fs.readFileSync(audioInfo.file);

      await sock.sendMessage(chat, {
        audio: buf,
        mimetype: 'audio/mpeg',
        ptt: false,
      }, { quoted: m });

      await sock.sendMessage(chat, {
        text: `🎵 *${audioInfo.title}*\n👤 ${audioInfo.artist}\n⏱ ${audioInfo.durationStr}`,
      }, { quoted: m });

      await sock.sendMessage(chat, { react: { text: '✅', key: m.key } });
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(audioInfo.file); } catch {}
    }
  },
};
