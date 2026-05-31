/**
 * ALMEER BOT — Plugin: autoviewstatus.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'autoviewstatus',
  category: 'settings',
  description: 'auto view statuses',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .autoviewstatus on|off\ncurrent: ' + (settings.autoViewStatus ? 'ON' : 'OFF'));
    settings.autoViewStatus = v === null ? !settings.autoViewStatus : v;
    saveSettings();
    if ('autoViewStatus' === 'alwaysOnline') startAlwaysOnline();
    return reply('autoViewStatus → ' + (settings.autoViewStatus ? 'ON 🟢' : 'OFF 🔴'));
  },
};
