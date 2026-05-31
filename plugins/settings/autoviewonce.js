/**
 * ALMEER BOT — Plugin: autoviewonce.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'autoviewonce',
  category: 'settings',
  description: 'auto-forward view-once media to owner on receipt',
  owner: true,
  async run({ argText, reply, settings, saveSettings }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .autoviewonce on|off\ncurrent: ' + (settings.autoViewOnce ? 'ON' : 'OFF'));
    settings.autoViewOnce = v === null ? !settings.autoViewOnce : v;
    saveSettings();
    return reply('autoViewOnce → ' + (settings.autoViewOnce ? 'ON 🟢' : 'OFF 🔴'));
  },
};
