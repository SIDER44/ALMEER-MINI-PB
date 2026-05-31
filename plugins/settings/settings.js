/**
 * ALMEER BOT — Plugin: settings.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'settings',
  category: 'settings',
  description: 'show all toggles',
  owner: true,
  async run({ reply, settings, TOGGLE_KEYS }) {
    const lines = TOGGLE_KEYS.map(k => `${settings[k] ? '🟢 ON ' : '🔴 OFF'}  ${k}`);
    lines.push(`🎯  statusEmoji = ${settings.statusEmoji}`);
    lines.push(`🛡️  mode = ${settings.mode}`);
    lines.push(`⌨️  prefix = ${settings.prefix}`);
    return reply('╭━ SETTINGS ━╮\n' + lines.join('\n'));
  },
};
