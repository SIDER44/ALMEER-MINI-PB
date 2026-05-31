/**
 * ALMEER BOT — index.js
 * © 2026 ALMEER / SIDER44 (github.com/SIDER44). All rights reserved.
 * Unauthorized redistribution or rebranding is prohibited. See LICENSE.
 */
import {
  default as makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadMediaMessage,
  jidNormalizedUser,
  proto,
} from '@whiskeysockets/baileys';
import { randomBytes } from 'crypto';
function genMsgId() { return '3EB0' + randomBytes(8).toString('hex').toUpperCase(); }
import pino from 'pino';
import chalk from 'chalk';
import express from 'express';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { loadSettings, saveSettings, TOGGLE_KEYS } from './lib/settings.js';
import { rememberMessage, getMessage as getCachedMessage, findMessageById, replaceMessage, getRecentStatusMessages } from './lib/store.js';
import { loadPlugins, getCommand, commandsByCategory } from './lib/plugins.js';
import { readStore } from './lib/datastore.js';
import { printBrandBanner, enforceBrandLock } from './lib/brandlock.js';

// ─── load .env BEFORE reading any process.env
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
} catch {}

const log = {
  info: (...a) => console.log(chalk.cyan('[i]'), ...a),
  conn: (...a) => console.log(chalk.magenta('[~]'), ...a),
  warn: (...a) => console.log(chalk.yellow('[!]'), ...a),
  err:  (...a) => console.log(chalk.red('[x]'), ...a),
  ok:   (...a) => console.log(chalk.green('[+]'), ...a),
};
const logger = pino({ level: 'silent' });

let sock = null;
let settings = loadSettings();
let ownerJid = null;
const startedAt = Date.now();
printBrandBanner(chalk); // ALMEER brand lock — do not remove
let reconnectAttempt = 0;
let alwaysOnlineTimer = null;
let lastStatusSeen = null;
let lastStatusReact = { ok: false, at: 0, detail: 'not attempted yet' };

const AUTH_DIR = path.resolve('auth_info');
const LOGO_PATH = path.resolve('public', 'logo.jpg');

// ─── express pairing UI (optional)
const app = express();
app.use(express.json());
app.use(express.static(path.resolve('public')));

const WEB_PASSWORD = process.env.WEB_PASSWORD || 'almeer';
const OWNER_NUMBER_ENV = String(process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, '');

app.post('/auth', (req, res) => {
  const { password } = req.body || {};
  if (password === WEB_PASSWORD) return res.json({ ok: true });
  return res.status(401).json({ ok: false });
});

app.post('/pair', async (req, res) => {
  try {
    const { number, password } = req.body || {};
    if (password && password !== WEB_PASSWORD) return res.status(401).json({ ok:false, error:'unauthorized' });
    const num = String(number || '').replace(/[^0-9]/g, '');
    if (!num) return res.status(400).json({ ok:false, error:'number required' });
    if (!sock) return res.status(503).json({ ok:false, error:'socket not ready' });
    if (sock.authState?.creds?.registered) return res.status(400).json({ ok:false, error:'already paired — delete auth_info to re-pair' });
    await new Promise(r => setTimeout(r, 3000));
    const code = await sock.requestPairingCode(num);
    log.ok('Pairing code for', num, '→', chalk.magenta.bold(code));
    return res.json({ ok:true, code });
  } catch (e) {
    log.err('pair error', e?.message || e);
    return res.status(500).json({ ok:false, error: e?.message || 'failed' });
  }
});

app.get('/health', (_req, res) => res.json({ ok:true, paired: !!sock?.authState?.creds?.registered, uptime: Date.now()-startedAt }));

const PORT = Number(process.env.PORT) || 0;
let webServerStarted = false;
function startWebServer() {
  return new Promise((resolve) => {
    if (!PORT) { log.info('PORT not set — skipping web UI, using CLI pairing.'); return resolve(false); }
    const server = app.listen(PORT, () => {
      webServerStarted = true;
      log.ok(`Web UI listening on :${PORT} (password: ${WEB_PASSWORD})`);
      resolve(true);
    });
    server.on('error', (err) => { log.warn('Web UI unavailable:', err.code || err.message); resolve(false); });
  });
}

async function askNumberCLI() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(chalk.magenta('\n➤ Enter WhatsApp number (with country code, no +): '), (ans) => {
      rl.close();
      resolve(String(ans || '').replace(/[^0-9]/g, ''));
    });
  });
}

async function getMessage(key) {
  const m = getCachedMessage(key.remoteJid, key.id);
  if (m?.message) return m.message;
  return proto.Message.fromObject({});
}

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  log.conn('Baileys version', version.join('.'));

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: settings.alwaysOnline,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    shouldIgnoreJid: () => false,
    getMessage,
  });

  if (!sock.authState.creds.registered) {
    if (OWNER_NUMBER_ENV) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(OWNER_NUMBER_ENV);
          console.log('\n' + chalk.magenta('═'.repeat(50)));
          console.log(chalk.cyan.bold('  PAIRING CODE for ') + chalk.yellow(OWNER_NUMBER_ENV));
          console.log(chalk.magenta('═'.repeat(50)));
          console.log('  ' + chalk.green.bold(code.match(/.{1,4}/g)?.join('-') || code));
          console.log(chalk.magenta('═'.repeat(50)));
          console.log(chalk.cyan('  Open WhatsApp → Linked Devices → Link with phone number'));
          console.log(chalk.magenta('═'.repeat(50)) + '\n');
        } catch (e) { log.err('pair error', e?.message); }
      }, 3000);
    } else {
      if (webServerStarted) log.info('Tip: you can also pair via the web UI at /');
      const num = await askNumberCLI();
      if (num) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const code = await sock.requestPairingCode(num);
          console.log('\n' + chalk.magenta('═'.repeat(50)));
          console.log(chalk.cyan.bold('  PAIRING CODE'));
          console.log(chalk.magenta('═'.repeat(50)));
          console.log('  ' + chalk.green.bold(code.match(/.{1,4}/g)?.join('-') || code));
          console.log(chalk.magenta('═'.repeat(50)) + '\n');
        } catch (e) { log.err('pair error', e?.message); }
      }
    }
  }

  sock.ev.on('connection.update', (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr) log.warn('QR ignored — using pairing code flow.');
    if (connection === 'connecting') log.conn('connecting...');
    if (connection === 'open') {
      reconnectAttempt = 0;
      const me = sock.authState.creds?.me?.id;
      if (me) ownerJid = jidNormalizedUser(me);
      await enforceBrandLock(sock, ownerJid, log); // ALMEER brand protection
      log.ok('Connected as', chalk.green(ownerJid || 'unknown'));
      startAlwaysOnline();
      if (ownerJid) {
        sock.sendMessage(ownerJid, {
          text:
            '╭━━ ALMEER MINI ━━╮\n' +
            '│ status: online\n' +
            `│ owner: ${ownerJid.split('@')[0]}\n` +
            '│ type .menu for commands\n' +
            '╰━━━━━━━━━━━━━━━╯',
        }).catch(()=>{});
      }
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      log.warn('connection closed', code);
      stopAlwaysOnline();
      if (code === DisconnectReason.loggedOut) {
        log.err('Logged out — clearing auth_info.');
        try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch {}
        process.exit(0);
      }
      reconnectAttempt++;
      const delay = Math.min(60_000, 2_000 * Math.pow(2, reconnectAttempt));
      log.conn(`reconnecting in ${Math.round(delay/1000)}s (attempt ${reconnectAttempt})`);
      setTimeout(() => startSock().catch(e => log.err('restart error', e?.message)), delay);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const m of messages) {
      try { await handleMessage(m, type); } catch (e) { log.err('handler error', e?.message); }
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    for (const upd of updates) {
      try {
        const u = upd.update || {};
        const msg = u.message;

        // ── Delete detection (three Baileys paths)
        const isRevoke =
          u.messageStubType === 68 || u.messageStubType === 2 ||
          (msg === null) ||
          (msg && msg.protocolMessage && msg.protocolMessage.type === 0);

        if (isRevoke) {
          const targetKey = (msg?.protocolMessage?.key)
            ? {
                remoteJid: msg.protocolMessage.key.remoteJid || upd.key.remoteJid,
                id: msg.protocolMessage.key.id,
                fromMe: msg.protocolMessage.key.fromMe,
                participant: msg.protocolMessage.key.participant || upd.key.participant,
              }
            : upd.key;
          await handleDeletedKey(targetKey, upd.key.participant);
          continue;
        }

        // ── Edit detection (protocolMessage type 14 = EDIT)
        if (msg && (msg.editedMessage || msg.protocolMessage?.editedMessage || msg.protocolMessage?.type === 14)) {
          await handleEdit(upd, msg);
        }
      } catch (e) { log.err('update handler', e?.message); }
    }
  });

  // Baileys 6.7+ emits messages.delete for some delete events
  // (supplement to messages.update type=revoke detection above)
  sock.ev.on('messages.delete', async (item) => {
    try {
      // item is either { keys: MessageKey[] } or a single MessageKey
      const keys = Array.isArray(item?.keys) ? item.keys : (item?.key ? [item.key] : [item].filter(i => i?.id));
      for (const key of keys) {
        if (key?.id) await handleDeletedKey(key, key.participant);
      }
    } catch (e) { log.err('messages.delete handler', e?.message); }
  });
}

// ─── always-online presence loop
function startAlwaysOnline() {
  stopAlwaysOnline();
  if (!settings.alwaysOnline || !sock) return;
  const tick = () => { try { sock.sendPresenceUpdate('available'); } catch {} };
  tick();
  alwaysOnlineTimer = setInterval(tick, 10_000);
}
function stopAlwaysOnline() {
  if (alwaysOnlineTimer) { clearInterval(alwaysOnlineTimer); alwaysOnlineTimer = null; }
  if (!settings.alwaysOnline && sock) { try { sock.sendPresenceUpdate('unavailable'); } catch {} }
}

// ─── helpers
function isOwner(jid) {
  if (!ownerJid || !jid) return false;
  return jidNormalizedUser(jid) === ownerJid;
}
function getText(m) {
  return extractTextFromContent(m.message);
}
function uptimeStr() {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}
function fmtTime(unixOrMs) {
  const ms = unixOrMs > 1e12 ? unixOrMs : unixOrMs * 1000;
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function shortJid(j) { return (j || '').split('@')[0] || '—'; }
function uniqueList(items) { return [...new Set(items.filter(Boolean).map(j => jidNormalizedUser(String(j))))]; }
function uniqueRawList(items) { return [...new Set(items.filter(Boolean).map(j => String(j)))]; }
function ownJidCandidates() {
  return uniqueRawList([
    sock?.user?.id,
    sock?.user?.lid,
    sock?.authState?.creds?.me?.id,
    sock?.authState?.creds?.me?.lid,
    ownerJid,
  ]);
}

function isLidJid(j) {
  return /@lid\b/.test(String(j || ''));
}
async function resolvePhoneJid(jid, msg) {
  const candidates = [
    msg?.key?.participantAlt,
    msg?.key?.remoteJidAlt,
    msg?.participantAlt,
    msg?.remoteJidAlt,
    msg?.message?.protocolMessage?.key?.participantAlt,
  ].filter(Boolean);
  for (const c of candidates) {
    if (/@s\.whatsapp\.net\b/.test(String(c))) return jidNormalizedUser(c);
  }
  const normalized = jid ? jidNormalizedUser(jid) : '';
  if (/@s\.whatsapp\.net\b/.test(normalized) || !isLidJid(normalized)) return normalized;
  try {
    const pn = await sock?.signalRepository?.lidMapping?.getPNForLID?.(normalized);
    if (pn) return jidNormalizedUser(pn);
  } catch {}
  return normalized;
}
async function displayNumber(jid, msg) {
  const pn = await resolvePhoneJid(jid, msg);
  return shortJid(pn);
}
function unwrapMessageContent(message) {
  let content = message;
  for (let i = 0; i < 6; i++) {
    const inner =
      content?.ephemeralMessage?.message ||
      content?.viewOnceMessage?.message ||
      content?.viewOnceMessageV2?.message ||
      content?.viewOnceMessageV2Extension?.message ||
      content?.documentWithCaptionMessage?.message ||
      content?.editedMessage?.message;
    if (!inner) break;
    content = inner;
  }
  return content || message;
}
function extractTextFromContent(msg) {
  const inner = unwrapMessageContent(msg || {});
  return (
    inner?.conversation ||
    inner?.extendedTextMessage?.text ||
    inner?.imageMessage?.caption ||
    inner?.videoMessage?.caption ||
    inner?.documentMessage?.caption ||
    ''
  );
}
function getMessageCategory(msg) {
  const inner = unwrapMessageContent(msg || {});
  if (inner?.imageMessage) return 'image';
  if (inner?.videoMessage) return 'video';
  if (inner?.audioMessage) return inner.audioMessage.ptt ? 'voice note' : 'audio';
  if (inner?.stickerMessage) return 'sticker';
  if (inner?.documentMessage) return 'document';
  if (inner?.conversation || inner?.extendedTextMessage?.text) return 'text';
  return 'message';
}
function isViewOnceContent(message) {
  const inner = unwrapMessageContent(message);
  return !!(
    message?.viewOnceMessage ||
    message?.viewOnceMessageV2 ||
    message?.viewOnceMessageV2Extension ||
    message?.ephemeralMessage?.message?.viewOnceMessage ||
    message?.ephemeralMessage?.message?.viewOnceMessageV2 ||
    message?.ephemeralMessage?.message?.viewOnceMessageV2Extension ||
    inner?.imageMessage?.viewOnce ||
    inner?.videoMessage?.viewOnce ||
    inner?.audioMessage?.viewOnce
  );
}

async function sendToOwner(content) {
  if (!ownerJid) return;
  try { await sock.sendMessage(ownerJid, content); } catch (e) { log.err('owner send', e?.message); }
}

/**
 * Build a mention-formatted sender line.
 * Returns { text: '@number', mentionJid: 'number@s.whatsapp.net' }
 * so the number is tappable (opens the chat) in WhatsApp.
 */
function mentionLine(jid) {
  if (!jid) return { text: 'unknown', mentionJid: null };
  // Prefer phone JID; LID JIDs are fine too — WA client resolves them.
  const num = jid.split('@')[0];
  return { text: `@${num}`, mentionJid: jid };
}

async function sendNotification(lines, mentionJids = []) {
  if (!ownerJid) return;
  const text = lines.join('\n');
  const mentions = [...new Set(mentionJids.filter(Boolean))];
  try {
    await sock.sendMessage(ownerJid, mentions.length ? { text, mentions } : { text });
  } catch (e) { log.err('owner send', e?.message); }
}


async function reactToStatus(statusMsg) {
  // Support multiple emojis (set via .setemoji 🔥 ❤️ 💜) — pick one randomly each time
  const emojiList = settings.statusEmojis?.length ? settings.statusEmojis
    : settings.statusEmoji ? [settings.statusEmoji]
    : ['❄️'];
  const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

  // Use the sender's direct JID (phone number) — RIOT2 proven working pattern.
  // Send to sender's personal JID, NOT to status@broadcast.
  // The react key still references status@broadcast so WhatsApp links it to the status.
  const sender = statusMsg.key.participant || statusMsg.participant || statusMsg.key.remoteJid || '';

  if (!sender || sender === 'status@broadcast') {
    lastStatusReact = { ok: false, at: Date.now(), detail: 'could not determine sender JID' };
    log.err('autoreactstatus ✗', lastStatusReact.detail);
    return false;
  }

  try {
    // RIOT2 formula: send react to sender's direct JID, key references the status message
    await sock.sendMessage(sender, {
      react: {
        text: emoji,
        key: {
          remoteJid: 'status@broadcast',
          id: statusMsg.key.id,
          participant: sender,
          fromMe: false,
        },
      },
    });
    lastStatusReact = { ok: true, at: Date.now(), detail: `${emoji} → ${sender}` };
    log.ok('autoreactstatus ✓', lastStatusReact.detail);
    return true;
  } catch (e) {
    lastStatusReact = { ok: false, at: Date.now(), detail: e?.message || String(e) };
    log.err('autoreactstatus ✗', lastStatusReact.detail);
    return false;
  }
}

// ─── core message handler
async function handleMessage(m) {
  if (!m.message) return;

  const chat = m.key.remoteJid;
  const sender = m.key.participant || m.key.remoteJid;
  const fromMe = !!m.key.fromMe;

  // ── STATUS BROADCAST handling
  if (chat === 'status@broadcast') {
    await rememberMessage(m, log, sock); // FIX: pass sock for reuploadRequest
    const statusOwner = m.key.participant || sender;

    // CRITICAL ORDER: react FIRST, then mark as read.
    // If readMessages fires first, WhatsApp treats the subsequent reaction as a
    // chat-bubble reply (showing the generic message icon) instead of an emoji reaction.
    if (settings.autoReactStatus && !fromMe) {
      await reactToStatus(m);
    }

    if (settings.autoViewStatus) {
      try { await sock.readMessages([m.key]); } catch (e) { log.err('autoview', e?.message); }
    }
    lastStatusSeen = { key: { ...m.key }, at: Date.now(), owner: statusOwner, pushName: m.pushName || '' };
    log.info('status seen from', await displayNumber(statusOwner, m), '| autoreact:', settings.autoReactStatus ? 'ON' : 'OFF');

    if (settings.autoViewOnce && isViewOnceContent(m.message)) {
      try { await forwardViewOnce(m, { auto: true }); } catch (e) { log.err('autoviewonce status', e?.message); }
    }
    return;
  }

  // ── Edit protocol message detection (Baileys may deliver edits via messages.upsert)
  // Must run BEFORE the 30-second stale filter because the protocol message
  // carries the ORIGINAL message's timestamp, which would wrongly trigger the filter.
  if (m.message?.protocolMessage?.type === 14) {
    await handleEdit({ key: m.key }, m.message);
    await rememberMessage(m, log, sock);
    return;
  }

  // ── AFK auto-reply (DMs only, not from self)
  if (!fromMe && !chat.endsWith('@g.us')) {
    const afk = readStore('afk');
    if (afk.active) {
      const elapsed = afk.since ? Math.round((Date.now() - afk.since) / 60000) : 0;
      await sock.sendMessage(chat, {
        text:
          `😴 *Owner is AFK* (Away From Keyboard)
` +
          `📝 Reason: ${afk.reason || 'No reason given'}
` +
          `⏰ Away for: ${elapsed < 1 ? 'just now' : elapsed + ' minute(s)'}`,
      }).catch(() => {});
    }
  }

  // Cache everything (for antidelete / antiedit / view-once) — always, regardless of message age
  await rememberMessage(m, log, sock); // FIX: pass sock for reuploadRequest

  // ── Auto view-once forwarding
  if (settings.autoViewOnce && !fromMe && isViewOnceContent(m.message)) {
    try { await forwardViewOnce(m, { auto: true }); } catch (e) { log.err('autoviewonce', e?.message); }
  }

  // ── REACTION / emoji reply handler (used for view-once unlock)
  const reaction = m.message.reactionMessage;
  if (reaction) {
    if ((fromMe || isOwner(sender)) && settings.viewOnceUnlock) {
      await handleViewOnceTarget(reaction.key, m);
    }
    return;
  }

  const replyCtx = m.message.extendedTextMessage?.contextInfo;
  if (settings.viewOnceUnlock && (fromMe || isOwner(sender)) && replyCtx?.stanzaId) {
    const replyText = (m.message.extendedTextMessage?.text || '').trim();
    const looksLikeEmojiReply = replyText && !replyText.startsWith(settings.prefix || '.') && [...replyText].length <= 8;
    if (looksLikeEmojiReply || replyCtx.quotedMessage) {
      await handleViewOnceTarget({
        remoteJid: replyCtx.remoteJid || chat,
        id: replyCtx.stanzaId,
        participant: replyCtx.participant,
      }, m, replyCtx.quotedMessage);
    }
  }

  // ── Ignore commands older than 30 seconds (prevents stale command replay on reconnect).
  // Skip this filter for protocol messages — their timestamp is the ORIGINAL message's
  // time, not the edit/revoke time, so they would be wrongly filtered.
  const msgTimestamp = Number(m.messageTimestamp) || 0;
  const isProtocol = !!m.message?.protocolMessage;
  if (!isProtocol && msgTimestamp && (Date.now() / 1000 - msgTimestamp) > 30) {
    log.info('skipped stale command (age >', Math.round(Date.now() / 1000 - msgTimestamp), 's)');
    return;
  }

  const text = getText(m).trim();
  const parsed = parseCommandText(text);
  if (!parsed) return;

  const ownerCheck = isOwner(sender) || fromMe;
  if (settings.mode !== 'public' && !ownerCheck) return;

  await handleCommand(m, parsed, { sender, isOwner: ownerCheck });
}

function parseCommandText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const prefix = settings.prefix || '.';
  let body = '';

  if (raw.startsWith(prefix)) {
    body = raw.slice(prefix.length).trim();
  } else if (prefix !== '.' && raw.startsWith('.')) {
    body = raw.slice(1).trim();
  } else {
    const first = raw.split(/\s+/)[0]?.toLowerCase();
    if (!getCommand(first)) return null;
    body = raw;
  }

  const [cmdName = '', ...rest] = body.split(/\s+/);
  if (!cmdName) return null;
  return { raw, body, cmdName, args: rest, argText: rest.join(' ').trim(), usedPrefix: raw === body ? '' : prefix };
}

async function handleCommand(m, parsed, meta) {
  const prefix = settings.prefix || '.';
  const { cmdName, args, argText } = parsed;
  const chat = m.key.remoteJid;
  const reply = (t) => sock.sendMessage(chat, { text: String(t) }, { quoted: m });

  const cmd = getCommand(cmdName);
  if (!cmd) return reply(`unknown command: ${cmdName}\nsend ${prefix}menu`);
  if (cmd.owner && !meta.isOwner) return reply('owner-only command.');

  try {
    await cmd.run({
      sock, m, chat, args, argText, text: parsed.raw, reply,
      cmdName: parsed.cmdName,
      settings, saveSettings: () => saveSettings(settings),
      isOwner: meta.isOwner, ownerJid, uptimeStr, sendToOwner, log,
      webServerStarted, PORT, LOGO_PATH, commandsByCategory, TOGGLE_KEYS,
      startAlwaysOnline, lastStatusSeen, lastStatusReact, reactToStatus, getRecentStatusMessages,
    });
  } catch (e) {
    log.err(`cmd ${cmd.name} error`, e?.message);
    reply('⚠️ command error: ' + (e?.message || 'unknown'));
  }
}

// ─── anti-delete
async function handleDeletedKey(key, deleterJid) {
  const original = getCachedMessage(key.remoteJid, key.id) || findMessageById(key.id, key.remoteJid);
  const sourceChat = original?.key?.remoteJid || key.remoteJid;
  const isStatus = (sourceChat === 'status@broadcast');
  if (isStatus && !settings.antiDeleteStatus) return;
  if (!isStatus && !settings.antiDelete) return;

  const sender = original?.key?.participant || original?.key?.remoteJid || key.participant || key.remoteJid;
  const senderName = original?.pushName || await displayNumber(sender, original);
  const senderNumber = await displayNumber(sender, original);
  const deleter = deleterJid || key.participant || sender;
  const deleterNumber = await displayNumber(deleter, original);
  const chatNumber = sourceChat?.endsWith('@g.us') ? shortJid(sourceChat) : await displayNumber(sourceChat, original);
  const sentAt  = original?.messageTimestamp ? fmtTime(original.messageTimestamp) : 'unknown';
  const delAt   = fmtTime(Date.now());
  const contentType = original ? getMessageCategory(original.message) : 'unknown';
  const contentText = original ? extractTextFromContent(original.message) : '';

  // Build mention-friendly sender info so numbers are tappable in WhatsApp
  const senderJidRaw  = original?.key?.participant || original?.key?.remoteJid || sender;
  const senderMention = mentionLine(senderJidRaw);
  const deleterMention = mentionLine(deleter);
  const notifMentions = [senderMention.mentionJid, deleterMention.mentionJid].filter(Boolean);

  const header =
    `🚨 *${isStatus ? 'DELETED STATUS' : 'DELETED MESSAGE'}* 🚨\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Sender:* ${senderName}  ${senderMention.text}\n` +
    (deleterNumber !== senderNumber ? `🗑️ *Deleted by:* ${deleterMention.text}\n` : '') +
    `💬 *Chat:* ${sourceChat?.endsWith('@g.us') ? shortJid(sourceChat) : (isStatus ? 'status' : senderMention.text)}\n` +
    `📦 *Type:* ${contentType}\n` +
    `🕐 *Sent at:* ${sentAt}\n` +
    `⏰ *Deleted at:* ${delAt}\n` +
    `━━━━━━━━━━━━━━━━━━`;

  if (!original) {
    return sendNotification([header, '⚠️ *Content:* not in cache (sent before bot started or too old).'], notifMentions);
  }
  await sendOriginalToOwner(original, header, contentText, notifMentions);
}

// ─── anti-edit (FIX: remoteJid in protocolMessage.key is always empty — fall back to upd.key.remoteJid)
async function handleEdit(upd, msg) {
  if (!settings.antiEdit) return;

  const protocolKey = msg.protocolMessage?.key;

  // FIX: WhatsApp's edit protocol message never includes remoteJid in the key.
  // We must fall back to upd.key.remoteJid (the chat where the edit happened).
  const editedKey = {
    remoteJid: protocolKey?.remoteJid || upd.key.remoteJid,
    id: protocolKey?.id || upd.key.id,
    fromMe: protocolKey?.fromMe ?? upd.key.fromMe,
    participant: protocolKey?.participant || upd.key.participant,
  };

  const original = getCachedMessage(editedKey.remoteJid, editedKey.id)
    || findMessageById(editedKey.id, editedKey.remoteJid);

  // FIX: editedMessage is a FutureProofMessage with a .message field
  const newMsg = msg.editedMessage?.message || msg.protocolMessage?.editedMessage?.message;
  const newText = newMsg ? (extractTextFromContent(newMsg) || '[non-text edit]') : '[non-text edit]';
  const oldText = original ? (extractTextFromContent(original.message) || '[non-text]') : '[not cached — sent before bot started]';

  const sender = original?.key?.participant || original?.key?.remoteJid
    || editedKey.participant || editedKey.remoteJid;
  const senderNumber = await displayNumber(sender, original);
  const senderName = original?.pushName || senderNumber;
  const chat = original?.key?.remoteJid || editedKey.remoteJid;
  const chatNumber = chat?.endsWith('@g.us') ? shortJid(chat) : await displayNumber(chat, original);
  const sentAt = original?.messageTimestamp ? fmtTime(original.messageTimestamp) : 'unknown';
  const editAt = fmtTime(Date.now());

  const editSenderJid = original?.key?.participant || original?.key?.remoteJid || editedKey.participant || editedKey.remoteJid;
  const editMention   = mentionLine(editSenderJid);
  await sendNotification([
    `✏️ *EDITED MESSAGE* ✏️\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Sender:* ${senderName}  ${editMention.text}\n` +
    `💬 *Chat:* ${chatNumber}\n` +
    `🕐 *Sent at:* ${sentAt}\n` +
    `✏️ *Edited at:* ${editAt}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Before:*\n${oldText}\n\n` +
    `*After:*\n${newText}`,
  ], [editMention.mentionJid].filter(Boolean));

  // Update the cache with the new message content
  if (original && newMsg) {
    const merged = { ...original, message: newMsg };
    replaceMessage(original.key.remoteJid || editedKey.remoteJid, editedKey.id, merged);
  }
}

// ─── FIX: always pass reuploadRequest so Baileys can refresh expired media URLs
async function getMediaBuffer(original, inner) {
  if (original?._mediaBuffer) return original._mediaBuffer;
  try {
    const fake = { ...original, message: inner };
    return await downloadMediaMessage(
      fake,
      'buffer',
      {},
      { reuploadRequest: sock?.updateMediaMessage }
    );
  } catch (e) {
    log.warn('media download fallback failed', e?.message);
    return null;
  }
}

async function sendOriginalToOwner(original, header = '', contentText = '', mentionJids = []) {
  const msg = unwrapMessageContent(original.message);
  if (!msg) return sendNotification([header], mentionJids);
  const prefix = header ? header + '\n' : '';

  // TEXT messages
  if (msg.conversation || msg.extendedTextMessage?.text || (!msg.imageMessage && !msg.videoMessage && !msg.audioMessage && !msg.documentMessage && !msg.stickerMessage && contentText)) {
    const t = contentText || msg.conversation || msg.extendedTextMessage?.text || '';
    return sendToOwner({ text: prefix + `💬 *Content:*\n${t || '[empty]'}` });
  }

  // MEDIA messages
  const buf = await getMediaBuffer(original, msg);
  if (!buf) {
    return sendToOwner({ text: prefix + '⚠️ *Content:* media could not be retrieved (decryption keys expired after revoke).' });
  }

  try {
    if (msg.imageMessage) {
      const cap = prefix + (msg.imageMessage.caption ? `💬 *Caption:*\n${msg.imageMessage.caption}` : '');
      return sendToOwner({ image: buf, caption: cap.trim() });
    }
    if (msg.videoMessage) {
      const cap = prefix + (msg.videoMessage.caption ? `💬 *Caption:*\n${msg.videoMessage.caption}` : '');
      return sendToOwner({ video: buf, caption: cap.trim(), mimetype: msg.videoMessage.mimetype || 'video/mp4' });
    }
    if (msg.documentMessage) {
      return sendToOwner({
        document: buf,
        mimetype: msg.documentMessage.mimetype,
        fileName: msg.documentMessage.fileName || 'file',
        caption: prefix.trim(),
      });
    }
    if (msg.audioMessage) {
      await sendToOwner({ text: prefix.trim() + '\n🎧 _audio attached below_' });
      return sendToOwner({ audio: buf, mimetype: msg.audioMessage.mimetype || 'audio/ogg', ptt: !!msg.audioMessage.ptt });
    }
    if (msg.stickerMessage) {
      await sendToOwner({ text: prefix.trim() + '\n🏷️ _sticker attached below_' });
      return sendToOwner({ sticker: buf });
    }
    return sendToOwner({ text: prefix + '[unsupported media type]' });
  } catch (e) {
    log.err('forward media', e?.message);
    return sendNotification([prefix + '[failed to send media: ' + e?.message + ']'], mentionJids);
  }
}

// ─── view-once: shared forwarder
async function forwardViewOnce(original, { auto = false } = {}) {
  const inner = unwrapMessageContent(original.message);
  if (!(inner?.imageMessage || inner?.videoMessage || inner?.audioMessage)) return;
  const buf = await getMediaBuffer(original, inner);
  if (!buf) return sendToOwner({ text: '⚠️ view-once: media could not be downloaded.' });
  const sender = original.key.participant || original.key.remoteJid;
  const senderNumber = await displayNumber(sender, original);
  const chat = original.key.remoteJid;
  const chatNumber = chat === 'status@broadcast' ? 'status' : (chat?.endsWith('@g.us') ? shortJid(chat) : await displayNumber(chat, original));
  const voMention  = mentionLine(original.key.participant || original.key.remoteJid);
  const voMentionJ = [voMention.mentionJid].filter(Boolean);
  const header =
    `🔓 *VIEW-ONCE ${auto ? 'AUTO-CAPTURED' : 'UNLOCKED'}*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Sender:* ${original.pushName || voMention.text}  ${voMention.text}\n` +
    `💬 *Chat:* ${chatNumber}\n` +
    `🕐 *Sent at:* ${original.messageTimestamp ? fmtTime(original.messageTimestamp) : fmtTime(Date.now())}\n` +
    `━━━━━━━━━━━━━━━━━━`;
  if (inner.imageMessage) return sock.sendMessage(ownerJid, { image: buf, caption: header + (inner.imageMessage.caption ? `\n💬 *Caption:*\n${inner.imageMessage.caption}` : ''), mentions: voMentionJ });
  if (inner.videoMessage) return sock.sendMessage(ownerJid, { video: buf, caption: header + (inner.videoMessage.caption ? `\n💬 *Caption:*\n${inner.videoMessage.caption}` : ''), mimetype: inner.videoMessage.mimetype || 'video/mp4', mentions: voMentionJ });
  if (inner.audioMessage) {
    await sendNotification([header + '\n🎧 _audio attached below_'], voMentionJ);
    return sendToOwner({ audio: buf, mimetype: inner.audioMessage.mimetype || 'audio/ogg', ptt: !!inner.audioMessage.ptt });
  }
}

async function handleViewOnceTarget(target, triggerMessage, quotedMessage) {
  const targetId = target?.id;
  const preferredChats = [
    target?.remoteJid,
    triggerMessage?.key?.remoteJid,
    triggerMessage?.message?.extendedTextMessage?.contextInfo?.remoteJid,
  ].filter(Boolean);

  let original = null;
  for (const chatId of preferredChats) {
    original = getCachedMessage(chatId, targetId);
    if (original) break;
  }
  if (!original) original = findMessageById(targetId, preferredChats[0]);

  if (!original && quotedMessage) {
    original = {
      key: {
        remoteJid: preferredChats[0] || triggerMessage?.key?.remoteJid,
        id: targetId,
        participant: target?.participant || triggerMessage?.message?.extendedTextMessage?.contextInfo?.participant,
      },
      message: quotedMessage,
      pushName: triggerMessage?.pushName,
      messageTimestamp: Math.floor(Date.now() / 1000),
    };
  }

  if (!original) {
    return sendToOwner({ text: '⚠️ view-once not in cache. Send/reply while the bot is online, then react/reply before WhatsApp expires the media.' });
  }

  const inner = unwrapMessageContent(original.message);
  if (!(isViewOnceContent(original.message) || inner?.imageMessage?.viewOnce || inner?.videoMessage?.viewOnce)) {
    return sendToOwner({ text: '⚠️ that message is not a view-once media.' });
  }
  await forwardViewOnce(original, { auto: false });
}


// ─── boot
(async () => {
  console.log(chalk.magenta.bold(`
   █████  ██      ███    ███ ███████ ███████ ██████  
  ██   ██ ██      ████  ████ ██      ██      ██   ██ 
  ███████ ██      ██ ████ ██ █████   █████   ██████  
  ██   ██ ██      ██  ██  ██ ██      ██      ██   ██ 
  ██   ██ ███████ ██      ██ ███████ ███████ ██   ██ 
              M I N I  //  cyberpunk edition
  `));
  if (process.env.OWNER_NUMBER) log.info('OWNER_NUMBER detected — auto-pair mode (pairing code will print below).');
  await loadPlugins(log);
  await startWebServer();
  await startSock();
})();

process.on('uncaughtException', e => log.err('uncaught', e?.message));
process.on('unhandledRejection', e => log.err('unhandled', e?.message || e));
