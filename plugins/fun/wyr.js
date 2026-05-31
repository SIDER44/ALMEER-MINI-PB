/**
 * ALMEER BOT — Plugin: wyr.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const QUESTIONS = [
  "Would you rather be able to fly OR be invisible?",
  "Would you rather never use social media again OR never watch movies/TV again?",
  "Would you rather always be 10 minutes late OR always be 20 minutes early?",
  "Would you rather lose all your money OR lose all your memories?",
  "Would you rather be able to speak every language OR play every instrument?",
  "Would you rather live without music OR without the internet?",
  "Would you rather know when you'll die OR how you'll die?",
  "Would you rather have a pause button for life OR a rewind button?",
  "Would you rather always have to say what's on your mind OR never speak again?",
  "Would you rather be famous but broke OR rich but unknown?",
  "Would you rather have no phone for a month OR no food for a week?",
  "Would you rather it always be summer OR always be winter?",
  "Would you rather be the funniest person in the room OR the smartest?",
  "Would you rather have unlimited battery life on all devices OR free WiFi everywhere?",
  "Would you rather fight 100 duck-sized horses OR one horse-sized duck?",
];

export default {
  name: 'wyr',
  aliases: ['wouldyourather', 'wyrd'],
  category: 'fun',
  description: 'would you rather question',
  async run({ reply }) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    reply(`🤔 *Would You Rather?*\n\n${q}\n\nReply A or B and debate! 👇`);
  },
};
