/**
 * ALMEER BOT — Plugin: time.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'time',
  aliases: ['date', 'datetime'],
  category: 'general',
  description: 'show current date and time',
  async run({ reply }) {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad = n => String(n).padStart(2, '0');
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const tz = `UTC${sign}${pad(Math.floor(Math.abs(offset)/60))}:${pad(Math.abs(offset)%60)}`;
    return reply(
      '╭━━〔 *🕐 DATE & TIME* 〕━━┈⊷\n' +
      `┃ 📅 Date  : ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}\n` +
      `┃ 🕒 Time  : ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}\n` +
      `┃ 🌍 Zone  : ${tz}\n` +
      '╰━━━━━━━━━━━━━━━━━━┈⊷'
    );
  },
};
