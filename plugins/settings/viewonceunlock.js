/**
 * ALMEER BOT — Plugin: viewonceunlock.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'viewonceunlock',
  category: 'settings',
  description: 'unlock view-once via reaction',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .viewonceunlock on|off\ncurrent: ' + (settings.viewOnceUnlock ? 'ON' : 'OFF'));
    settings.viewOnceUnlock = v === null ? !settings.viewOnceUnlock : v;
    saveSettings();
    if ('viewOnceUnlock' === 'alwaysOnline') startAlwaysOnline();
    return reply('viewOnceUnlock → ' + (settings.viewOnceUnlock ? 'ON 🟢' : 'OFF 🔴'));
  },
};
