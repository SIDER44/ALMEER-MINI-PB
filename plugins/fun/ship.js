/**
 * ALMEER BOT — Plugin: ship.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'ship',
  aliases: ['love', 'lovemeter'],
  category: 'fun',
  description: 'check love compatibility between two people',
  async run({ args, argText, m, reply }) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let names = [];
    if (mentions.length >= 2) {
      names = mentions.slice(0, 2).map(j => j.split('@')[0]);
    } else {
      const parts = argText.split(/\s+vs\s+|,|\s{2,}/i).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) names = parts.slice(0, 2);
      else if (args.length >= 2) {
        const mid = Math.ceil(args.length / 2);
        names = [args.slice(0, mid).join(' '), args.slice(mid).join(' ')];
      }
    }
    if (names.length < 2) return reply('usage: .ship Name1 Name2\nor tag two people: .ship @user1 @user2');

    // Deterministic "random" based on names
    const seed = [...(names[0] + names[1]).toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
    const pct = ((seed * 9301 + 49297) % 233280) / 233280;
    const score = Math.round(pct * 100);

    const bars = Math.round(score / 10);
    const bar = '❤️'.repeat(bars) + '🖤'.repeat(10 - bars);

    const msg =
      score >= 90 ? '💍 Soulmates! Perfect match!' :
      score >= 70 ? '🥰 Strong connection!' :
      score >= 50 ? '💕 Pretty good chemistry!' :
      score >= 30 ? '😬 Needs some work...' :
      '💔 Not a great match.';

    reply(
      `💘 *LOVE METER* 💘\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 ${names[0]}\n` +
      `💞 ${bar}\n` +
      `👤 ${names[1]}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `❤️ Score: *${score}%*\n` +
      `${msg}`
    );
  },
};
