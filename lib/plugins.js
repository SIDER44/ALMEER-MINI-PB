/**
 * ALMEER BOT — plugins.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
// Tiny plugin loader. Recursively scans ./plugins for .js files.
// Each plugin file must `export default { name, aliases?, category, description?, owner?, run(ctx) }`
// or `export const command = {...}`.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const PLUGINS_DIR = path.resolve('plugins');
const registry = new Map();   // name -> plugin
const aliasMap = new Map();   // alias -> name

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

export async function loadPlugins(log) {
  registry.clear();
  aliasMap.clear();
  const files = walk(PLUGINS_DIR);
  for (const f of files) {
    try {
      const mod = await import(pathToFileURL(f).href + `?t=${Date.now()}`);
      const plugin = mod.default || mod.command;
      if (!plugin || !plugin.name || typeof plugin.run !== 'function') {
        log?.warn?.(`plugin ${path.relative(PLUGINS_DIR, f)} missing name/run — skipped`);
        continue;
      }
      plugin.category = plugin.category || path.basename(path.dirname(f));
      plugin.file = f;
      registry.set(plugin.name.toLowerCase(), plugin);
      for (const a of plugin.aliases || []) aliasMap.set(a.toLowerCase(), plugin.name.toLowerCase());
    } catch (e) {
      log?.err?.(`plugin load fail ${f}:`, e?.message);
    }
  }
  log?.ok?.(`loaded ${registry.size} plugin(s) from ${files.length} file(s)`);
}

export function getCommand(name) {
  const k = String(name || '').toLowerCase();
  return registry.get(k) || registry.get(aliasMap.get(k));
}

export function allCommands() {
  return [...registry.values()];
}

export function commandsByCategory() {
  const map = {};
  for (const c of registry.values()) {
    (map[c.category] = map[c.category] || []).push(c);
  }
  for (const k of Object.keys(map)) map[k].sort((a, b) => a.name.localeCompare(b.name));
  return map;
}
