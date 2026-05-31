/**
 * ALMEER BOT — Plugin: reminder.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { parseTimeArg } from '../../lib/timeparser.js';

export default {
  name: 'reminder',
  aliases: ['remind', 'remindme'],
  category: 'utils',
  description: 'set a personal reminder — .reminder 30m Check the oven',
  async run({ sock, chat, m, argText, reply, ownerJid, isOwner }) {
    const parts = argText.trim().split(/\s+/);
    const timeStr = parts[0];
    const message = parts.slice(1).join(' ');
    if (!timeStr || !message) return reply('usage: .reminder <time> <reminder text>\nexample: .reminder 30m Take medicine\nexample: .reminder 2h Meeting with team\n\nformats: 30s, 5m, 2h, 1d');
    const ms = parseTimeArg(timeStr);
    if (!ms) return reply('⚠️ Invalid time. examples: 30s, 5m, 2h, 1d');
    if (ms > 7 * 86400000) return reply('⚠️ Max reminder is 7 days.');
    const sender = m.key.participant || m.key.remoteJid;
    reply(`✅ Reminder set! I'll remind you in *${timeStr}*\n📝 _${message}_`);
    setTimeout(async () => {
      try {
        const dest = isOwner ? ownerJid : sender;
        await sock.sendMessage(dest || chat, {
          text: `⏰ *REMINDER*\n\n${message}`,
        });
      } catch {}
    }, ms);
  },
};
