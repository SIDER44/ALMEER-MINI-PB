/**
 * ALMEER BOT — Plugin: ghost.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'ghost',
  aliases: ['ghostmode', 'invisible'],
  category: 'security',
  description: 'toggle ghost mode — appear offline, no read receipts',
  owner: true,
  async run({ sock, settings, saveSettings, reply }) {
    settings.ghostMode = !settings.ghostMode;
    saveSettings();
    if (settings.ghostMode) {
      await sock.sendPresenceUpdate('unavailable').catch(() => {});
      reply('👻 *Ghost Mode ON*\n\nBot appears offline. No read receipts will be sent.\nUse .ghost again to disable.');
    } else {
      if (settings.alwaysOnline) await sock.sendPresenceUpdate('available').catch(() => {});
      reply('✅ *Ghost Mode OFF*\n\nBot appears online again.');
    }
  },
};
