/**
 * ALMEER BOT – Brand Lock
 * © 2026 ALMEER / SIDER44. All rights reserved.
 *
 * This module enforces ALMEER brand identity at runtime.
 * Tampering with this file violates the license.
 */

// ── hardcoded brand identity ─────────────────────────────────────
const BRAND = {
  name:    'ALMEER',
  creator: 'SIDER44',
  github:  'https://github.com/SIDER44',
  contact: 'ALMEER Bot — github.com/SIDER44',
};

// Required strings that MUST appear in the bot's environment/config.
// If someone renames the bot and removes ALMEER references, the bot
// sends an alert to the real owner and shuts the session down.
const REQUIRED_BRAND_STRINGS = ['ALMEER', 'almeer'];

// ── startup watermark (printed to Railway logs always) ────────────
export function printBrandBanner(chalk) {
  const c = chalk || { cyan: s=>s, magenta: s=>s, gray: s=>s, bold: s=>s };
  console.log(c.cyan('╔══════════════════════════════════════════╗'));
  console.log(c.cyan('║') + c.magenta.bold('          ██████╗  ██╗                   ') + c.cyan('║'));
  console.log(c.cyan('║') + c.magenta.bold('         ██╔══██╗ ██║                   ') + c.cyan('║'));
  console.log(c.cyan('║') + c.magenta.bold('         ███████║ ██║                   ') + c.cyan('║'));
  console.log(c.cyan('║') + c.magenta.bold('         ██╔══██║ ██║                   ') + c.cyan('║'));
  console.log(c.cyan('║') + c.magenta.bold('  ALMEER ██║  ██║ ███████╗ BOT          ') + c.cyan('║'));
  console.log(c.cyan('║') + c.magenta.bold('         ╚═╝  ╚═╝ ╚══════╝             ') + c.cyan('║'));
  console.log(c.cyan('║') + c.gray('     © 2026 ALMEER / github.com/SIDER44   ') + c.cyan('║'));
  console.log(c.cyan('╚══════════════════════════════════════════╝'));
}

// ── runtime brand check ───────────────────────────────────────────
/**
 * Call this after the socket is connected.
 * @param {object} sock   - Baileys socket
 * @param {string} ownerJid - the connected owner JID
 * @param {object} log    - your chalk logger
 */
export async function enforceBrandLock(sock, ownerJid, log) {
  const botName = process.env.BOT_NAME || '';

  // Check if someone wiped the ALMEER name from BOT_NAME
  const brandPresent = REQUIRED_BRAND_STRINGS.some(s =>
    botName.toUpperCase().includes(s.toUpperCase())
  ) || botName === ''; // blank name is allowed (defaults to ALMEER in menus)

  if (!brandPresent) {
    log?.warn?.('⚠  BRAND LOCK TRIGGERED: BOT_NAME does not contain ALMEER');

    try {
      // Notify the real owner in chat
      await sock.sendMessage(ownerJid, {
        text:
          `⚠ *ALMEER BRAND LOCK*\n\n` +
          `An unauthorized copy of ALMEER Bot is running under the name *"${botName}"*.\n\n` +
          `This bot is protected software by *SIDER44*.\n` +
          `Original: github.com/SIDER44\n\n` +
          `_Session will now terminate._`,
      });
    } catch (_) {}

    log?.err?.('Brand lock: shutting down unauthorized copy.');
    setTimeout(() => process.exit(1), 3000);
    return false;
  }

  log?.ok?.(`Brand lock OK — ${BRAND.name} by ${BRAND.creator}`);
  return true;
}

// ── message watermark injector ────────────────────────────────────
// Appends a subtle footer to any outgoing text message.
// Import and use this in your sendMessage wrapper if you want it.
export function withBrandFooter(text, show = true) {
  if (!show) return text;
  return `${text}\n\n_Powered by ALMEER Bot · github.com/SIDER44_`;
}

export { BRAND };
