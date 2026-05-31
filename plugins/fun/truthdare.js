/**
 * ALMEER BOT — Plugin: truthdare.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const TRUTHS = [
  "What is the most embarrassing thing you've ever done?",
  "Have you ever lied to get out of trouble? What was the lie?",
  "What is your biggest fear?",
  "Have you ever cheated on a test?",
  "What is the most childish thing you still do?",
  "What is your biggest regret?",
  "Have you ever stood someone up?",
  "What is a secret you've never told anyone?",
  "Have you ever pretended to be sick to avoid something?",
  "What is the most embarrassing thing in your phone right now?",
  "Have you ever talked badly about someone in this chat?",
  "What is your most irrational fear?",
  "Have you ever ghosted someone? Why?",
  "What is the worst gift you've ever received?",
  "Have you ever lied about your age?",
];

const DARES = [
  "Send the last photo in your gallery to this chat.",
  "Change your WhatsApp status to 'I love drama' for 1 hour.",
  "Voice note yourself singing the chorus of a song.",
  "Send a 10-second selfie video right now.",
  "Text your crush right now. Show the chat.",
  "Do 20 push-ups and send proof.",
  "Change your profile picture to a funny face for 30 minutes.",
  "Send a voice note saying 'I am a golden retriever'.",
  "Write a 3-sentence love letter to a random contact.",
  "Send an embarrassing autocomplete sentence (type 'I wish' and keep pressing next word).",
  "Do your best dance move and send a video.",
  "Send a voice note in a funny accent.",
  "Post a cringe caption on your WhatsApp status right now.",
  "Text your mum 'I accidentally deleted your contacts, who is this?'",
  "Send a voice note whispering your deepest secret.",
];

export default {
  name: 'truth',
  aliases: ['dare', 'td'],
  category: 'fun',
  description: 'truth or dare — .truth or .dare',
  async run({ cmdName, reply }) {
    if (cmdName === 'dare') {
      const dare = DARES[Math.floor(Math.random() * DARES.length)];
      return reply(`🎯 *DARE*\n\n${dare}`);
    }
    const truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    return reply(`🤫 *TRUTH*\n\n${truth}`);
  },
};
