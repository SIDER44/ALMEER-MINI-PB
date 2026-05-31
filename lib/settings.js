/**
 * ALMEER BOT — settings.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULTS = {
  autoViewStatus: true,
  autoReactStatus: true,
  statusEmojiChanger: true,
  antiDeleteStatus: true,
  antiDelete: true,
  antiEdit: true,
  viewOnceUnlock: true,
  autoViewOnce: true, // auto-forward view-once media to owner on receipt (no reaction needed)
  alwaysOnline: true,
  statusEmoji: '❄️',
  mode: 'private', // 'private' = owner only, 'public' = everyone
  prefix: '.',
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadSettings() {
  ensureDir();
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULTS, null, 2));
      return { ...DEFAULTS };
    }
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s) {
  ensureDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
}

export const TOGGLE_KEYS = [
  'autoViewStatus',
  'autoReactStatus',
  'statusEmojiChanger',
  'antiDeleteStatus',
  'antiDelete',
  'antiEdit',
  'viewOnceUnlock',
  'autoViewOnce',
  'alwaysOnline',
];
