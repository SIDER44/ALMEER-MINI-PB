/**
 * ALMEER BOT — timeparser.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
/**
 * Parse time strings like "30s", "5m", "2h", "1d" into milliseconds.
 */
export function parseTimeArg(str) {
  const m = String(str || '').trim().match(/^(\d+(?:\.\d+)?)\s*(s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)$/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  const unit = m[2][0].toLowerCase();
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Math.round(val * (multipliers[unit] || 0));
}
