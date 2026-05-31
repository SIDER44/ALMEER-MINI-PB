/**
 * ALMEER BOT — Plugin: clearall.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import fs from 'fs';
import path from 'path';

export default {
  name: 'clearall',
  aliases: ['clearcache', 'reset'],
  category: 'utils',
  description: 'clear all bot data and cache',
  owner: true,
  async run({ reply }) {
    try {
      const dataDir = path.resolve('data');
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir).filter(f => f !== 'settings.json');
        for (const f of files) {
          try { fs.unlinkSync(path.join(dataDir, f)); } catch {}
        }
      }
      reply('🗑️ Cache and data cleared.\n_(settings.json preserved)_');
    } catch (e) {
      reply('⚠️ Clear failed.\n_(' + e.message + ')_');
    }
  },
};
