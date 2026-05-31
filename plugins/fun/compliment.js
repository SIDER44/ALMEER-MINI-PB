/**
 * ALMEER BOT — Plugin: compliment.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const COMPLIMENTS = [
  "You make the world a more beautiful place just by being in it. 🌸",
  "Your energy is absolutely infectious — in the best way possible. ✨",
  "You have the kind of smile that makes everyone around you feel at ease. 😊",
  "Honestly? You're one of the rare ones. Keep being yourself. 💎",
  "You handle hard things with a grace that most people only dream of. 🙌",
  "The world needs more people with your kind of heart. ❤️",
  "You're more capable than you give yourself credit for. 💪",
  "Everything you touch tends to get better — that's a rare gift. 🌟",
  "Your presence genuinely makes a difference, even when you don't realize it. 🕊️",
  "You're not just smart — you're the kind of smart that solves real problems. 🧠",
  "Your laugh is literally contagious. Never stop. 😄",
  "You've got a rare combination of kind AND cool. 🔥",
];

export default {
  name: 'compliment',
  aliases: ['nice', 'hype'],
  category: 'fun',
  description: 'get a random compliment',
  async run({ argText, m, reply }) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentions.length > 0
      ? mentions[0].split('@')[0]
      : argText || null;
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    reply(target ? `💌 *For ${target}:*\n\n${c}` : `💌 *Compliment:*\n\n${c}`);
  },
};
