/**
 * ALMEER BOT — Plugin: antiedit.js
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
  name: 'antiedit',
  aliases: ['antiedits', 'antiedited'],
  category: 'settings',
  description: 'Expose edited messages — bot notifies you when someone edits a message',
  owner: true,
  async run({ argText, reply, settings, saveSettings }) {
    const v = parseOnOff(argText);
    if (argText && v === null) {
      return reply(
        '❓ Invalid value. Usage:\n' +
        '  .antiedit on  — start catching edits\n' +
        '  .antiedit off — stop catching edits\n' +
        'Current: ' + (settings.antiEdit ? '🟢 ON' : '🔴 OFF')
      );
    }
    settings.antiEdit = v === null ? !settings.antiEdit : v;
    saveSettings();
    return reply(
      '✏️ Anti-Edit → ' + (settings.antiEdit ? '🟢 ON\n\nBot will now notify you whenever someone edits a message.' : '🔴 OFF\n\nEdit detection disabled.')
    );
  },
};
