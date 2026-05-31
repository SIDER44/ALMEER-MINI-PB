/**
 * ALMEER BOT — Plugin: setprefix.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'setprefix',
  category: 'settings',
  description: 'change command prefix',
  owner: true,
  async run({ argText, reply, settings, saveSettings }) {
    if (!argText) return reply('usage: .setprefix !\ncurrent: ' + settings.prefix);
    const p = argText.trim()[0];
    settings.prefix = p;
    saveSettings();
    return reply('prefix → ' + p);
  },
};
