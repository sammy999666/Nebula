// AutoMod propio del bot (se aplica en messageCreate).
const { PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const { t } = require('./i18n');
const { embed, COLORS, sendLog, shorten } = require('./utils');

const INVITE = /(discord\.gg|discord(app)?\.com\/invite)\/[a-z0-9-]+/i;
const LINK = /(https?:\/\/|www\.)\S+/i;
const spamMap = new Map();
const RULE_KEY = { am_invites: 'rule_antiInvites', am_links: 'rule_antiLinks', am_badwords: 'rule_badWords', am_mentions: 'rule_antiMentions', am_caps: 'rule_antiCaps', am_spam: 'rule_antiSpam' };

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function hasBadWord(content, words) {
  const text = normalize(content);
  return words.some((w) => {
    const rx = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRx(normalize(w))}($|[^\\p{L}\\p{N}])`, 'iu');
    return rx.test(text);
  });
}

function tooManyCaps(content) {
  const letters = content.replace(/[^\p{L}]/gu, '');
  if (letters.length < 10) return false;
  const upper = letters.replace(/[^\p{Lu}]/gu, '').length;
  return upper / letters.length > 0.7;
}

function isSpam(message) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const list = (spamMap.get(key) || []).filter((ts) => now - ts < 5000);
  list.push(now);
  spamMap.set(key, list);
  if (list.length >= 6) { spamMap.delete(key); return true; }
  return false;
}

// Limpieza periódica para no acumular memoria
setInterval(() => {
  const now = Date.now();
  for (const [key, list] of spamMap) {
    if (!list.some((ts) => now - ts < 5000)) spamMap.delete(key);
  }
}, 60_000).unref();

/** @returns {Promise<boolean>} true si el mensaje fue sancionado. */
async function handle(message) {
  const cfg = db.guild(message.guild.id).automod;
  const rules = cfg.rules;
  if (!Object.values(rules).some(Boolean)) return false;

  const member = message.member;
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.ManageMessages) || member.permissions.has(PermissionFlagsBits.Administrator)) return false;
  const me = message.guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageMessages)) return false;

  const content = message.content || '';
  let violation = null;

  if (rules.antiInvites && INVITE.test(content)) violation = 'am_invites';
  else if (rules.antiLinks && LINK.test(content)) violation = 'am_links';
  else if (rules.badWords && cfg.badWords.length && hasBadWord(content, cfg.badWords)) violation = 'am_badwords';
  else if (rules.antiMentions && message.mentions.users.size + message.mentions.roles.size >= 5) violation = 'am_mentions';
  else if (rules.antiCaps && tooManyCaps(content)) violation = 'am_caps';
  else if (rules.antiSpam && isSpam(message)) violation = 'am_spam';

  if (!violation) return false;

  const gid = message.guild.id;
  await message.delete().catch(() => {});

  let punished = false;
  if (cfg.action === 'timeout' && member.moderatable) {
    punished = await member.timeout(5 * 60 * 1000, `AutoMod: ${violation}`).then(() => true).catch(() => false);
  }

  const notice = await message.channel
    .send(t(gid, violation, { user: message.author.toString() }))
    .catch(() => null);
  if (notice) setTimeout(() => notice.delete().catch(() => {}), 6000);

  sendLog(message.guild, embed(COLORS.warn)
    .setTitle(t(gid, 'log_automod_title'))
    .addFields(
      { name: t(gid, 'f_user'), value: `${message.author} (${message.author.id})`, inline: true },
      { name: t(gid, 'f_channel'), value: `${message.channel}`, inline: true },
      { name: t(gid, 'f_rule'), value: t(gid, RULE_KEY[violation]), inline: false },
      { name: t(gid, 'f_content'), value: shorten(content || '—', 500) || '—', inline: false },
      { name: t(gid, 'f_action'), value: punished ? t(gid, 'act_timeout') : t(gid, 'act_delete'), inline: true },
    ));
  return true;
}

module.exports = { handle };
