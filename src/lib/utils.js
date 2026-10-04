const { EmbedBuilder } = require('discord.js');
const db = require('./db');

const COLORS = { main: 0x9b59ff, ok: 0x57f287, err: 0xed4245, warn: 0xfee75c, pink: 0xf472b6 };

const embed = (color = COLORS.main) => new EmbedBuilder().setColor(color).setTimestamp();

/** Devuelve un texto de error si el moderador/bot no puede actuar sobre el miembro, o null si todo OK. */
function checkTarget(interaction, member, t) {
  if (!member) return t('target_missing');
  if (member.id === interaction.user.id) return t('cannot_self');
  if (member.id === interaction.guild.ownerId) return t('cannot_target');
  const me = interaction.guild.members.me;
  if (member.roles.highest.position >= me.roles.highest.position) return t('cannot_target');
  if (
    interaction.user.id !== interaction.guild.ownerId &&
    member.roles.highest.position >= interaction.member.roles.highest.position
  ) return t('cannot_target');
  return null;
}

/** Envía un embed al canal de logs configurado. */
async function sendLog(guild, embedToSend) {
  const id = db.guild(guild.id).logChannel;
  if (!id) return;
  const channel = guild.channels.cache.get(id);
  if (channel?.isTextBased()) channel.send({ embeds: [embedToSend] }).catch(() => {});
}

const shorten = (text, max = 1000) => (text.length > max ? text.slice(0, max - 1) + '…' : text);

module.exports = { COLORS, embed, checkTarget, sendLog, shorten };
