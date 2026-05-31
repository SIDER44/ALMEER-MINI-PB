/**
 * ALMEER BOT — Plugin: 8ball.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const ANSWERS = [
  '✅ It is certain.', '✅ Without a doubt.', '✅ Yes, definitely.',
  '✅ You may rely on it.', '✅ As I see it, yes.', '✅ Most likely.',
  '✅ Outlook good.', '✅ Yes.', '✅ Signs point to yes.',
  '🤔 Reply hazy, try again.', '🤔 Ask again later.', '🤔 Better not tell you now.',
  '🤔 Cannot predict now.', '🤔 Concentrate and ask again.',
  '❌ Don't count on it.', '❌ My reply is no.', '❌ My sources say no.',
  '❌ Outlook not so good.', '❌ Very doubtful.',
];

export default {
  name: '8ball',
  aliases: ['ask', 'magic'],
  category: 'fun',
  description: 'ask the magic 8 ball a question',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .8ball Will I be rich?\nask any yes/no question!');
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    reply(`🎱 *Magic 8 Ball*\n\n❓ ${argText}\n\n${answer}`);
  },
};
