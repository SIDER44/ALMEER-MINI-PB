/**
 * ALMEER BOT — Plugin: mode.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'mode',
  category: 'settings',
  description: 'public | private',
  owner: true,
  async run({ argText, reply, settings, saveSettings }) {
    const v = argText.toLowerCase().trim();
    if (!v) return reply(`current mode: *${settings.mode}*\nusage: .mode public | .mode private`);
    if (v !== 'public' && v !== 'private') return reply('mode must be: public OR private');
    settings.mode = v;
    saveSettings();
    return reply(`✅ mode → *${v}*\n${v === 'public' ? 'everyone can use commands' : 'only owner can use commands'}`);
  },
};
