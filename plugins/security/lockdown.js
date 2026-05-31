/**
 * ALMEER BOT — Plugin: lockdown.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'lockdown',
  aliases: ['lock', 'emergency'],
  category: 'security',
  description: 'lock bot to owner only instantly',
  owner: true,
  async run({ settings, saveSettings, reply }) {
    const wasPublic = settings.mode === 'public';
    settings.mode = wasPublic ? 'private' : 'public';
    saveSettings();
    if (wasPublic) {
      reply('🔒 *LOCKDOWN ACTIVE*\n\nBot is now restricted to owner only.\nUse .lockdown again to unlock.');
    } else {
      reply('🔓 *Lockdown lifted*\n\nBot is now public again.');
    }
  },
};
