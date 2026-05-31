/**
 * ALMEER BOT — Plugin: statusemojichanger.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'statusemojichanger',
  category: 'settings',
  description: 'allow .setemoji',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .statusemojichanger on|off\ncurrent: ' + (settings.statusEmojiChanger ? 'ON' : 'OFF'));
    settings.statusEmojiChanger = v === null ? !settings.statusEmojiChanger : v;
    saveSettings();
    if ('statusEmojiChanger' === 'alwaysOnline') startAlwaysOnline();
    return reply('statusEmojiChanger → ' + (settings.statusEmojiChanger ? 'ON 🟢' : 'OFF 🔴'));
  },
};
