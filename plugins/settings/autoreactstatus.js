/**
 * ALMEER BOT — Plugin: autoreactstatus.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
function parseOnOff(a) {
  a = (a || '').toLowerCase().trim();
  if (['on', 'enable', 'true', '1', 'yes'].includes(a)) return true;
  if (['off', 'disable', 'false', '0', 'no'].includes(a)) return false;
  return null;
}

export default {
  name: 'autoreactstatus',
  aliases: ['autostatusreact', 'autosreact', 'autoviewreact'],
  category: 'settings',
  description: 'Auto react to contacts\' statuses with an emoji',
  owner: true,
  async run({ sock, argText, reply, settings, saveSettings, lastStatusSeen, lastStatusReact }) {
    const v = parseOnOff(argText);
    if (argText && v === null) {
      return reply(
        '❓ Invalid value. Usage:\n' +
        '  .autoreactstatus on  — start auto-reacting\n' +
        '  .autoreactstatus off — stop auto-reacting\n' +
        'Current: ' + (settings.autoReactStatus ? '🟢 ON' : '🔴 OFF')
      );
    }

    settings.autoReactStatus = v === null ? !settings.autoReactStatus : v;
    saveSettings();

    // Subscribe to status updates so WhatsApp actually sends them to this session
    if (settings.autoReactStatus && sock) {
      try {
        await sock.sendPresenceUpdate('available');
        await sock.subscribePresence('status@broadcast');
      } catch { /* ignore — not all Baileys versions expose this */ }
    }

    const statusLine = settings.autoReactStatus ? '🟢 ON' : '🔴 OFF';
    const lastSeen = lastStatusSeen
      ? `${lastStatusSeen.pushName || lastStatusSeen.owner} at ${new Date(lastStatusSeen.at).toLocaleTimeString()}`
      : 'none yet';
    const lastReact = lastStatusReact?.detail || 'not attempted yet';

    return reply(
      `🔄 *Auto React Status → ${statusLine}*\n\n` +
      `📍 Last status seen: ${lastSeen}\n` +
      `⚡ Last react result: ${lastReact}\n\n` +
      (settings.autoReactStatus
        ? `✅ Bot will now auto-react to every status update.\n\n` +
          `⚠️ *Tips for it to work:*\n` +
          `• Make sure .autoviewstatus is also ON\n` +
          `• Use .setemoji to set your reaction emoji (default: ❄️)\n` +
          `• Status owner must have you in contacts`
        : '🔕 Auto-react to statuses is disabled.')
    );
  },
};
