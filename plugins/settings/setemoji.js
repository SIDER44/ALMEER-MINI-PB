/**
 * ALMEER BOT — Plugin: setemoji.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
export default {
  name: 'setemoji',
  category: 'settings',
  description: 'set status react emoji(s) — use multiple for random pick',
  owner: true,
  async run({ argText, reply, settings, saveSettings }) {
    if (!settings.statusEmojiChanger) return reply('statusEmojiChanger is OFF. Turn it on with .statusemojichanger on');
    if (!argText) return reply(
      'Usage: .setemoji 🔥\n' +
      'Multiple random emojis: .setemoji 🔥 ❤️ 💜 😂\n\n' +
      'Current: ' + (settings.statusEmojis?.join(' ') || settings.statusEmoji || '❄️')
    );

    // Split by whitespace and extract all emoji tokens
    const emojis = [...argText.matchAll(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu)].map(m => m[0]);

    if (!emojis.length) return reply('❌ No valid emojis found. Example: .setemoji 🔥 ❤️ 💜');

    // Store as array for multi-emoji support
    settings.statusEmojis = emojis;
    settings.statusEmoji = emojis[0]; // keep single for backward compat
    saveSettings();

    return reply(
      emojis.length === 1
        ? `✅ Status react emoji set → ${emojis[0]}`
        : `✅ Status react emojis set → ${emojis.join(' ')}\n🎲 Bot will randomly pick one per status.`
    );
  },
};
