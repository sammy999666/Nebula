const { SlashCommandBuilder } = require('discord.js');
const { embed, COLORS } = require('../lib/utils');

const ts = (date) => `<t:${Math.floor(date.getTime() / 1000)}:R>`;

module.exports = [
  {
    category: 'general',
    data: new SlashCommandBuilder().setName('ping').setDescription('Muestra la latencia del bot'),
    async execute(interaction, t) {
      const ms = Date.now() - interaction.createdTimestamp;
      await interaction.reply(t('ping', { ms, api: Math.round(interaction.client.ws.ping) }));
    },
  },

  {
    category: 'general',
    data: new SlashCommandBuilder().setName('help').setDescription('Lista todos los comandos del bot'),
    async execute(interaction, t) {
      const groups = {};
      for (const cmd of interaction.client.commands.values()) {
        (groups[cmd.category] ??= []).push(`\`/${cmd.data.name}\``);
      }
      const e = embed()
        .setTitle(t('help_title'))
        .setDescription(t('help_desc'))
        .setThumbnail(interaction.client.user.displayAvatarURL());
      for (const [cat, list] of Object.entries(groups)) {
        e.addFields({ name: t(`cat_${cat}`), value: list.join(' '), inline: false });
      }
      await interaction.reply({ embeds: [e] });
    },
  },

  {
    category: 'general',
    data: new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('Información de un usuario')
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario (por defecto, tú)')),
    async execute(interaction, t) {
      const user = interaction.options.getUser('usuario') ?? interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const e = embed(member?.displayHexColor && member.displayHexColor !== '#000000' ? member.displayColor : COLORS.main)
        .setTitle(user.tag)
        .setThumbnail(user.displayAvatarURL({ size: 512 }))
        .addFields(
          { name: t('f_id'), value: user.id, inline: true },
          { name: t('f_created'), value: ts(user.createdAt), inline: true },
        );
      if (member) {
        const roles = member.roles.cache.filter((r) => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map((r) => r.toString());
        e.addFields(
          { name: t('f_joined'), value: ts(member.joinedAt), inline: true },
          { name: t('f_roles', { count: roles.length }), value: roles.slice(0, 15).join(' ') || '—' },
        );
      }
      await interaction.reply({ embeds: [e] });
    },
  },

  {
    category: 'general',
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Muestra el avatar de un usuario en grande')
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario (por defecto, tú)')),
    async execute(interaction) {
      const user = interaction.options.getUser('usuario') ?? interaction.user;
      await interaction.reply({
        embeds: [embed().setTitle(user.displayName).setImage(user.displayAvatarURL({ size: 1024 }))],
      });
    },
  },

  {
    category: 'general',
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('Información del servidor'),
    async execute(interaction, t) {
      const g = interaction.guild;
      const owner = await g.fetchOwner().catch(() => null);
      const e = embed()
        .setTitle(g.name)
        .setThumbnail(g.iconURL({ size: 512 }))
        .addFields(
          { name: t('f_owner'), value: owner ? owner.toString() : '—', inline: true },
          { name: t('f_members'), value: `${g.memberCount}`, inline: true },
          { name: t('f_channels'), value: `${g.channels.cache.size}`, inline: true },
          { name: t('f_roles', { count: g.roles.cache.size }), value: '\u200b', inline: true },
          { name: t('f_boosts'), value: `${g.premiumSubscriptionCount ?? 0}`, inline: true },
          { name: t('f_created'), value: ts(g.createdAt), inline: true },
        );
      await interaction.reply({ embeds: [e] });
    },
  },

  {
    category: 'general',
    data: new SlashCommandBuilder().setName('botinfo').setDescription('Estadísticas del bot'),
    async execute(interaction, t) {
      const c = interaction.client;
      const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
      const up = `<t:${Math.floor((Date.now() - c.uptime) / 1000)}:R>`;
      await interaction.reply({
        embeds: [embed()
          .setTitle(c.user.username)
          .setThumbnail(c.user.displayAvatarURL())
          .addFields(
            { name: t('f_servers'), value: `${c.guilds.cache.size}`, inline: true },
            { name: t('f_commands'), value: `${c.commands.size}`, inline: true },
            { name: t('f_memory'), value: `${mem} MB`, inline: true },
            { name: t('f_uptime'), value: up, inline: true },
            { name: 'Node.js', value: process.version, inline: true },
          )],
      });
    },
  },
];
