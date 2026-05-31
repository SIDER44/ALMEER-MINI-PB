/**
 * ALMEER BOT — Plugin: riddle.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
const RIDDLES = [
  { q: "I speak without a mouth and hear without ears. I have no body but come alive with the wind. What am I?", a: "An echo" },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow. I have water, but no fish swim. I have roads, but no cars drive. What am I?", a: "A map" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps" },
  { q: "I'm light as a feather, but even the strongest person can't hold me for more than a few minutes. What am I?", a: "Breath" },
  { q: "What has hands but can't clap?", a: "A clock" },
  { q: "What gets wetter the more it dries?", a: "A towel" },
  { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
  { q: "I have keys but no locks. I have space but no room. You can enter but can't go inside. What am I?", a: "A keyboard" },
  { q: "What has an eye but cannot see?", a: "A needle" },
  { q: "What begins with T, ends with T, and has T in it?", a: "A teapot" },
  { q: "What runs but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?", a: "A river" },
  { q: "I'm always in front of you but can't be seen. What am I?", a: "The future" },
];

const pending = new Map(); // chat → riddle index

export default {
  name: 'riddle',
  aliases: ['puzzle', 'brain'],
  category: 'fun',
  description: 'get a riddle — reply with .answer to reveal',
  async run({ cmdName, chat, reply }) {
    if (cmdName === 'answer') {
      const idx = pending.get(chat);
      if (idx === undefined) return reply('❓ No active riddle. Send .riddle first!');
      pending.delete(chat);
      return reply(`💡 *Answer:*\n\n${RIDDLES[idx].a}`);
    }
    const idx = Math.floor(Math.random() * RIDDLES.length);
    pending.set(chat, idx);
    reply(`🧩 *Riddle*\n\n${RIDDLES[idx].q}\n\n_Reply with .answer to reveal the answer_`);
  },
};
