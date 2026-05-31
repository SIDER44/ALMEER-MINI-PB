/**
 * ALMEER BOT — Plugin: spam.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'spam',
  aliases: ['repeat', 'multi'],
  category: 'utils',
  description: 'send message multiple times — .spam <n> <text>',
  owner: true,
  async run({ sock, chat, args, reply }) {
    const count = parseInt(args[0]);
    const message = args.slice(1).join(' ');
    if (!count || count < 1 || !message) return reply('usage: .spam <count> <message>\nexample: .spam 5 Hello!');
    if (count > 20) return reply('⚠️ Max 20 messages per spam command.');
    for (let i = 0; i < count; i++) {
      await sock.sendMessage(chat, { text: message });
      await new Promise(r => setTimeout(r, 500));
    }
  },
};
