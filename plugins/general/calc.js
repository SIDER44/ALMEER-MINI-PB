/**
 * ALMEER BOT — Plugin: calc.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'calc',
  aliases: ['calculate', 'math', '='],
  category: 'general',
  description: 'evaluate a math expression',
  async run({ argText, reply }) {
    if (!argText) return reply('usage: .calc <expression>\nexample: .calc (2 + 3) * 4\nexample: .calc 10 % 3');
    try {
      // Replace ^ with ** for exponentiation
      const expr = argText.replace(/\^/g, '**');
      // Whitelist: only digits, operators, spaces, parentheses, decimal points
      const clean = expr.replace(/\*\*/g, 'EXP');
      if (/[^0-9+\-*/.%() \tEXP]/.test(clean)) {
        return reply('⚠️ only numbers and operators (+  -  *  /  %  ^  ()) are allowed');
      }
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + expr + ')')();
      if (typeof result !== 'number' || !isFinite(result)) return reply('⚠️ invalid result (division by zero?)');
      return reply(
        '╭━━〔 *🧮 CALCULATOR* 〕━━┈⊷\n' +
        `┃ 📥 Input  : ${argText}\n` +
        `┃ 📤 Result : ${result}\n` +
        '╰━━━━━━━━━━━━━━━━━━┈⊷'
      );
    } catch (e) {
      return reply('⚠️ error: ' + e.message);
    }
  },
};
