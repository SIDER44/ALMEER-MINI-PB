/**
 * ALMEER BOT — Plugin: antideletestatus.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'antideletestatus',
  category: 'settings',
  description: 'restore deleted statuses',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .antideletestatus on|off\ncurrent: ' + (settings.antiDeleteStatus ? 'ON' : 'OFF'));
    settings.antiDeleteStatus = v === null ? !settings.antiDeleteStatus : v;
    saveSettings();
    if ('antiDeleteStatus' === 'alwaysOnline') startAlwaysOnline();
    return reply('antiDeleteStatus → ' + (settings.antiDeleteStatus ? 'ON 🟢' : 'OFF 🔴'));
  },
};
