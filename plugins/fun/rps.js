/**
 * ALMEER BOT — Plugin: rps.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
const WINS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export default {
  name: 'rps',
  aliases: ['rockpaperscissors'],
  category: 'fun',
  description: 'play rock paper scissors — .rps rock/paper/scissors',
  async run({ args, reply }) {
    const player = args[0]?.toLowerCase();
    if (!CHOICES.includes(player)) return reply('usage: .rps rock\n       .rps paper\n       .rps scissors');
    const bot = CHOICES[Math.floor(Math.random() * 3)];
    const pe = EMOJI[player], be = EMOJI[bot];
    let result;
    if (player === bot) result = "🤝 It's a *TIE!*";
    else if (WINS[player] === bot) result = '🏆 You *WIN!*';
    else result = '💀 Bot *WINS!*';
    reply(`✊ *Rock Paper Scissors*\n\nYou: ${pe} ${player}\nBot: ${be} ${bot}\n\n${result}`);
  },
};
