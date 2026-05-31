/**
 * ALMEER BOT — Plugin: statusreacttest.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'statusreacttest',
  aliases: ['teststatusreact', 'reactstatus', 'statusreact'],
  category: 'settings',
  description: 'test auto-react on the latest cached status',
  owner: true,
  async run({ reply, lastStatusSeen, lastStatusReact, reactToStatus, getRecentStatusMessages }) {
    const latest = getRecentStatusMessages(1)[0];
    if (!latest) {
      return reply(
        '⚠️ No status is cached yet.\n' +
        'Ask someone to post a new WhatsApp status while the bot is online, then run .statusreacttest again.\n\n' +
        `Last seen: ${lastStatusSeen ? new Date(lastStatusSeen.at).toLocaleString() : 'none'}\n` +
        `Last react: ${lastStatusReact?.detail || 'none'}`
      );
    }
    const ok = await reactToStatus(latest);
    return reply(
      `${ok ? '✅' : '❌'} status reaction test finished.\n` +
      `Last seen: ${lastStatusSeen ? new Date(lastStatusSeen.at).toLocaleString() : 'cached status'}\n` +
      `Result: ${lastStatusReact?.detail || 'unknown'}`
    );
  },
};
