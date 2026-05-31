/**
 * ALMEER BOT — Plugin: note.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import { readStore, writeStore } from '../../lib/datastore.js';

export default {
  name: 'note',
  aliases: ['save', 'notes', 'getnote', 'delnote', 'listnotes'],
  category: 'utils',
  description: 'save and retrieve notes — .note save <key> <text>',
  owner: true,
  async run({ cmdName, args, argText, reply }) {
    const notes = readStore('notes');
    const sub = cmdName === 'note' ? args[0]?.toLowerCase() : cmdName;

    if (sub === 'save' || sub === 'note') {
      const key = args[sub === 'note' ? 1 : 1]?.toLowerCase();
      const value = args.slice(sub === 'note' ? 2 : 2).join(' ');
      if (!key || !value) return reply('usage: .note save <key> <text>\nexample: .note save wifi Password123');
      notes[key] = { value, saved: Date.now() };
      writeStore('notes', notes);
      return reply(`✅ Note saved as "*${key}*"`);
    }

    if (sub === 'getnote' || sub === 'get') {
      const key = args[sub === 'getnote' ? 0 : 1]?.toLowerCase();
      if (!key) return reply('usage: .getnote <key>');
      const note = notes[key];
      if (!note) return reply(`⚠️ No note found for "*${key}*"\nUse .listnotes to see all saved notes.`);
      return reply(`📝 *Note: ${key}*\n\n${note.value}`);
    }

    if (sub === 'delnote' || sub === 'del' || sub === 'delete') {
      const key = args[sub === 'delnote' ? 0 : 1]?.toLowerCase();
      if (!key) return reply('usage: .delnote <key>');
      if (!notes[key]) return reply(`⚠️ No note found for "*${key}*"`);
      delete notes[key];
      writeStore('notes', notes);
      return reply(`🗑️ Note "*${key}*" deleted.`);
    }

    if (sub === 'listnotes' || sub === 'list' || sub === 'all') {
      const keys = Object.keys(notes);
      if (!keys.length) return reply('📭 No notes saved yet.\nUse .note save <key> <text> to add one.');
      return reply(`📋 *Saved Notes (${keys.length})*\n\n${keys.map(k => `• *${k}*`).join('\n')}\n\n_Use .getnote <key> to retrieve_`);
    }

    reply('usage:\n  .note save <key> <text>  — save a note\n  .getnote <key>            — retrieve a note\n  .delnote <key>            — delete a note\n  .listnotes                — list all notes');
  },
};
