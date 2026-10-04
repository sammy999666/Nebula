const { Events } = require('discord.js');
const db = require('../lib/db');
const automod = require('../lib/automod');
const { progress } = require('../lib/levels');
const { t } = require('../lib/i18n');

const xpCooldown = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // 1) AutoMod propio
    if (await automod.handle(message).catch((err) => { console.error('[automod]', err.message); return false; })) return;

    // 2) XP / niveles (15-25 XP por mensaje, 1 vez por minuto)
    const g = db.guild(message.guild.id);
    if (!g.levels.enabled) return;
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    if (now - (xpCooldown.get(key) ?? 0) < 60_000) return;
    xpCooldown.set(key, now);

    const entry = (g.levels.users[message.author.id] ??= { xp: 0, messages: 0 });
    const before = progress(entry.xp).level;
    entry.xp += 15 + Math.floor(Math.random() * 11);
    entry.messages++;
    const after = progress(entry.xp).level;
    db.save();

    if (after > before && g.levels.announce) {
      message.channel
        .send({ content: t(message.guild.id, 'levelup', { user: message.author.toString(), level: after }), allowedMentions: { users: [message.author.id] } })
        .catch(() => {});
    }
  },
};
