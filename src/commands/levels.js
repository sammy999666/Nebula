const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const db = require('../lib/db');
const { progress, bar } = require('../lib/levels');
const { embed, COLORS } = require('../lib/utils');

const sortedUsers = (guildId) =>
  Object.entries(db.guild(guildId).levels.users).sort((a, b) => b[1].xp - a[1].xp);

module.exports = [
  {
    category: 'levels',
    data: new SlashCommandBuilder()
      .setName('rank')
      .setDescription('Muestra tu nivel y experiencia')
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario (por defecto, tú)')),
    async execute(interaction, t) {
      const user = interaction.options.getUser('usuario') ?? interaction.user;
      const entry = db.guild(interaction.guildId).levels.users[user.id] ?? { xp: 0, messages: 0 };
      const { level, current, needed } = progress(entry.xp);
      const position = sortedUsers(interaction.guildId).findIndex(([id]) => id === user.id) + 1;
      await interaction.reply({
        embeds: [embed(COLORS.pink)
          .setTitle(t('rank_title', { user: user.displayName }))
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .setDescription(`${bar(current, needed)}\n\`${current} / ${needed} XP\``)
          .addFields(
            { name: t('f_level'), value: `${level}`, inline: true },
            { name: t('f_total_xp'), value: `${entry.xp}`, inline: true },
            { name: t('f_position'), value: position ? `#${position}` : '—', inline: true },
          )],
      });
    },
  },

  {
    category: 'levels',
    data: new SlashCommandBuilder().setName('top').setDescription('Ranking de niveles del servidor'),
    async execute(interaction, t) {
      const top = sortedUsers(interaction.guildId).slice(0, 10);
      if (!top.length) return interaction.reply({ content: t('top_empty'), flags: MessageFlags.Ephemeral });
      const medals = ['🥇', '🥈', '🥉'];
      const lines = top.map(([id, data], i) => `${medals[i] ?? `**${i + 1}.**`} <@${id}> — ${t('f_level')} **${progress(data.xp).level}** · ${data.xp} XP`);
      await interaction.reply({ embeds: [embed(COLORS.main).setTitle(t('top_title')).setDescription(lines.join('\n'))], allowedMentions: { parse: [] } });
    },
  },

  {
    category: 'levels',
    data: new SlashCommandBuilder()
      .setName('niveles')
      .setDescription('Configura el sistema de niveles')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addBooleanOption((o) => o.setName('activo').setDescription('Activar o desactivar el sistema').setRequired(true))
      .addBooleanOption((o) => o.setName('anunciar').setDescription('Anunciar cuando alguien sube de nivel')),
    async execute(interaction, t) {
      const lv = db.guild(interaction.guildId).levels;
      lv.enabled = interaction.options.getBoolean('activo');
      const announce = interaction.options.getBoolean('anunciar');
      if (announce !== null) lv.announce = announce;
      db.save();
      await interaction.reply({ content: t(lv.enabled ? 'levels_on' : 'levels_off'), flags: MessageFlags.Ephemeral });
    },
  },
];
