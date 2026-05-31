/**
 * ALMEER BOT — Plugin: antidelete.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'antidelete',
  category: 'settings',
  description: 'restore deleted chat messages',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .antidelete on|off\ncurrent: ' + (settings.antiDelete ? 'ON' : 'OFF'));
    settings.antiDelete = v === null ? !settings.antiDelete : v;
    saveSettings();
    if ('antiDelete' === 'alwaysOnline') startAlwaysOnline();
    return reply('antiDelete → ' + (settings.antiDelete ? 'ON 🟢' : 'OFF 🔴'));
  },
};
