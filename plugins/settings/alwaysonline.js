/**
 * ALMEER BOT — Plugin: alwaysonline.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a){a=(a||'').toLowerCase().trim();if(['on','enable','true','1','yes'].includes(a))return true;if(['off','disable','false','0','no'].includes(a))return false;return null;}
export default {
  name: 'alwaysonline',
  category: 'settings',
  description: 'keep WhatsApp online',
  owner: true,
  async run({ argText, reply, settings, saveSettings, startAlwaysOnline }) {
    const v = parseOnOff(argText);
    if (argText && v === null) return reply('usage: .alwaysonline on|off\ncurrent: ' + (settings.alwaysOnline ? 'ON' : 'OFF'));
    settings.alwaysOnline = v === null ? !settings.alwaysOnline : v;
    saveSettings();
    if ('alwaysOnline' === 'alwaysOnline') startAlwaysOnline();
    return reply('alwaysOnline → ' + (settings.alwaysOnline ? 'ON 🟢' : 'OFF 🔴'));
  },
};
