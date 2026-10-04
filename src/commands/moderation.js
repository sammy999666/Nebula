const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const db = require('../lib/db');
const { embed, COLORS, checkTarget, sendLog } = require('../lib/utils');

const P = PermissionFlagsBits;
const WARN_LIMIT = 3;

function modLog(interaction, t, titleKey, target, reason, extra = []) {
  sendLog(interaction.guild, embed(COLORS.warn)
    .setTitle(t(titleKey))
    .addFields(
      { name: t('f_user'), value: `${target} (${target.id})`, inline: true },
      { name: t('f_moderator'), value: `${interaction.user}`, inline: true },
      ...extra,
      { name: t('f_reason'), value: reason },
    ));
}

const reasonOption = (o) => o.setName('razon').setDescription('Razón').setMaxLength(400);

module.exports = [
  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Banea a un usuario')
      .setDefaultMemberPermissions(P.BanMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
      .addStringOption(reasonOption)
      .addIntegerOption((o) => o.setName('dias').setDescription('Días de mensajes a borrar (0-7)').setMinValue(0).setMaxValue(7)),
    async execute(interaction, t) {
      const user = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon') ?? t('no_reason');
      const member = interaction.options.getMember('usuario');
      if (user.id === interaction.user.id) return interaction.reply({ content: t('cannot_self'), flags: MessageFlags.Ephemeral });
      if (member) {
        const problem = checkTarget(interaction, member, t);
        if (problem) return interaction.reply({ content: problem, flags: MessageFlags.Ephemeral });
      }
      await interaction.guild.members.ban(user, {
        reason: `${interaction.user.tag}: ${reason}`,
        deleteMessageSeconds: (interaction.options.getInteger('dias') ?? 0) * 86400,
      });
      await interaction.reply(t('ban_done', { user: user.tag, reason }));
      modLog(interaction, t, 'log_ban', user, reason);
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Expulsa a un usuario')
      .setDefaultMemberPermissions(P.KickMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
      .addStringOption(reasonOption),
    async execute(interaction, t) {
      const member = interaction.options.getMember('usuario');
      const reason = interaction.options.getString('razon') ?? t('no_reason');
      const problem = checkTarget(interaction, member, t);
      if (problem) return interaction.reply({ content: problem, flags: MessageFlags.Ephemeral });
      await member.kick(`${interaction.user.tag}: ${reason}`);
      await interaction.reply(t('kick_done', { user: member.user.tag, reason }));
      modLog(interaction, t, 'log_kick', member.user, reason);
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Aísla temporalmente a un usuario')
      .setDefaultMemberPermissions(P.ModerateMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
      .addIntegerOption((o) => o.setName('minutos').setDescription('Duración en minutos').setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(reasonOption),
    async execute(interaction, t) {
      const member = interaction.options.getMember('usuario');
      const minutes = interaction.options.getInteger('minutos');
      const reason = interaction.options.getString('razon') ?? t('no_reason');
      const problem = checkTarget(interaction, member, t);
      if (problem) return interaction.reply({ content: problem, flags: MessageFlags.Ephemeral });
      await member.timeout(minutes * 60_000, `${interaction.user.tag}: ${reason}`);
      await interaction.reply(t('timeout_done', { user: member.user.tag, minutes, reason }));
      modLog(interaction, t, 'log_timeout', member.user, reason, [{ name: t('f_duration'), value: `${minutes} min`, inline: true }]);
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('untimeout')
      .setDescription('Quita el aislamiento a un usuario')
      .setDefaultMemberPermissions(P.ModerateMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    async execute(interaction, t) {
      const member = interaction.options.getMember('usuario');
      if (!member) return interaction.reply({ content: t('target_missing'), flags: MessageFlags.Ephemeral });
      await member.timeout(null);
      await interaction.reply(t('untimeout_done', { user: member.user.tag }));
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Borra mensajes del canal')
      .setDefaultMemberPermissions(P.ManageMessages)
      .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
      .addUserOption((o) => o.setName('usuario').setDescription('Solo mensajes de este usuario')),
    async execute(interaction, t) {
      const amount = interaction.options.getInteger('cantidad');
      const user = interaction.options.getUser('usuario');
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      let toDelete = amount;
      if (user) {
        const fetched = await interaction.channel.messages.fetch({ limit: 100 });
        toDelete = fetched.filter((m) => m.author.id === user.id).first(amount);
      }
      const deleted = await interaction.channel.bulkDelete(toDelete, true);
      await interaction.editReply(t('clear_done', { count: deleted.size }));
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Advierte a un usuario (3 advertencias = 1h de aislamiento)')
      .setDefaultMemberPermissions(P.ModerateMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
      .addStringOption(reasonOption),
    async execute(interaction, t) {
      const member = interaction.options.getMember('usuario');
      const reason = interaction.options.getString('razon') ?? t('no_reason');
      const problem = checkTarget(interaction, member, t);
      if (problem) return interaction.reply({ content: problem, flags: MessageFlags.Ephemeral });

      const g = db.guild(interaction.guildId);
      const list = (g.warns[member.id] ??= []);
      list.push({ by: interaction.user.id, reason, at: Date.now() });
      db.save();

      await interaction.reply(t('warn_done', { user: member.user.tag, count: list.length, limit: WARN_LIMIT, reason }));
      modLog(interaction, t, 'log_warn', member.user, reason, [{ name: t('f_warns'), value: `${list.length}/${WARN_LIMIT}`, inline: true }]);

      if (list.length >= WARN_LIMIT && member.moderatable) {
        await member.timeout(60 * 60_000, 'Auto: límite de advertencias').catch(() => {});
        await interaction.followUp(t('warn_auto', { user: member.user.tag, limit: WARN_LIMIT }));
      }
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('warns')
      .setDescription('Ver las advertencias de un usuario')
      .setDefaultMemberPermissions(P.ModerateMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    async execute(interaction, t) {
      const user = interaction.options.getUser('usuario');
      const list = db.guild(interaction.guildId).warns[user.id] ?? [];
      if (!list.length) return interaction.reply({ content: t('warns_none', { user: user.tag }), flags: MessageFlags.Ephemeral });
      const lines = list.slice(-10).map((w, i) => `**${i + 1}.** <t:${Math.floor(w.at / 1000)}:d> — ${w.reason} (<@${w.by}>)`);
      await interaction.reply({ embeds: [embed(COLORS.warn).setTitle(t('warns_title', { user: user.tag })).setDescription(lines.join('\n'))], flags: MessageFlags.Ephemeral });
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('clearwarns')
      .setDescription('Borra las advertencias de un usuario')
      .setDefaultMemberPermissions(P.ModerateMembers)
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true)),
    async execute(interaction, t) {
      const user = interaction.options.getUser('usuario');
      delete db.guild(interaction.guildId).warns[user.id];
      db.save();
      await interaction.reply({ content: t('warns_cleared', { user: user.tag }), flags: MessageFlags.Ephemeral });
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('slowmode')
      .setDescription('Cambia el modo lento del canal')
      .setDefaultMemberPermissions(P.ManageChannels)
      .addIntegerOption((o) => o.setName('segundos').setDescription('0 para desactivar (máx. 21600)').setRequired(true).setMinValue(0).setMaxValue(21600)),
    async execute(interaction, t) {
      const seconds = interaction.options.getInteger('segundos');
      await interaction.channel.setRateLimitPerUser(seconds);
      await interaction.reply(t('slowmode_done', { seconds }));
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('lock')
      .setDescription('Bloquea el canal actual para @everyone')
      .setDefaultMemberPermissions(P.ManageChannels),
    async execute(interaction, t) {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      await interaction.reply(t('lock_done'));
    },
  },

  {
    category: 'moderation',
    data: new SlashCommandBuilder()
      .setName('unlock')
      .setDescription('Desbloquea el canal actual')
      .setDefaultMemberPermissions(P.ManageChannels),
    async execute(interaction, t) {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
      await interaction.reply(t('unlock_done'));
    },
  },
];
