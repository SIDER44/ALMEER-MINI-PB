/**
 * ALMEER BOT — Plugin: schedule.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { parseTimeArg } from '../../lib/timeparser.js';

export default {
  name: 'schedule',
  aliases: ['sched', 'later'],
  category: 'utils',
  description: 'schedule a message — .schedule 10m <text>',
  owner: true,
  async run({ sock, chat, argText, reply }) {
    const parts = argText.trim().split(/\s+/);
    const timeStr = parts[0];
    const message = parts.slice(1).join(' ');
    if (!timeStr || !message) return reply('usage: .schedule <time> <message>\nexample: .schedule 10m Good morning!\nexample: .schedule 2h Meeting starts now\n\nformats: 30s, 5m, 2h, 1d');
    const ms = parseTimeArg(timeStr);
    if (!ms) return reply('⚠️ Invalid time format.\nexamples: 30s, 5m, 2h, 1d');
    if (ms > 86400000) return reply('⚠️ Max schedule time is 24 hours.');
    reply(`✅ Scheduled! Message will send in *${timeStr}*`);
    setTimeout(async () => {
      try { await sock.sendMessage(chat, { text: `⏰ *Scheduled Message*\n\n${message}` }); } catch {}
    }, ms);
  },
};
