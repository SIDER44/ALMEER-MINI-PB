/**
 * ALMEER BOT — Plugin: roast.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const ROASTS = [
  "You're the human version of a participation trophy.",
  "I'd roast you harder but my mum said I'm not allowed to burn trash.",
  "Your WiFi signal has more personality than you.",
  "You're proof that even evolution takes a day off.",
  "Some day you'll go far — and I really hope you stay there.",
  "You're like a cloud. When you disappear it's a beautiful day.",
  "I'd agree with you but then we'd both be wrong.",
  "You have your entire life to be an idiot. Take the day off.",
  "I'm not insulting you. I'm describing you.",
  "You're not stupid — you just have bad luck thinking.",
  "The last time I saw something like you, I flushed it.",
  "Somewhere out there a tree is tirelessly producing oxygen for you. You owe it an apology.",
  "If laughter is the best medicine your face must be curing diseases.",
  "Keep rolling your eyes — maybe you'll find a brain back there.",
  "You're a pizza without cheese. Technically food, but why?",
];

export default {
  name: 'roast',
  aliases: ['burn', 'savage'],
  category: 'fun',
  description: 'roast someone — .roast @user or .roast Name',
  async run({ argText, m, reply }) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentions.length > 0
      ? mentions[0].split('@')[0]
      : argText || 'you';
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    reply(`🔥 *ROAST: ${target}* 🔥\n\n${roast}`);
  },
};
