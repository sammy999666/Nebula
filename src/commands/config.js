const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { MessageFlags } = require('discord.js');
const db = require('../lib/db');
const { LANGS } = require('../lib/i18n');
const { embed } = require('../lib/utils');

module.exports = [
  {
    category: 'config',
    data: new SlashCommandBuilder()
      .setName('idioma')
      .setDescription('Cambia el idioma del bot en este servidor / Change language / Mudar idioma')
      .addSubcommand((s) => s.setName('ver').setDescription('Muestra el idioma actual'))
      .addSubcommand((s) => s
        .setName('establecer')
        .setDescription('Cambia el idioma')
        .addStringOption((o) => o
          .setName('idioma')
          .setDescription('Idioma / Language / Idioma')
          .setRequired(true)
          .addChoices(...Object.entries(LANGS).map(([value, name]) => ({ name, value }))))),
    async execute(interaction, t) {
      const g = db.guild(interaction.guildId);
      if (interaction.options.getSubcommand() === 'ver') {
        return interaction.reply({ content: t('lang_current', { lang: LANGS[g.lang] }), flags: MessageFlags.Ephemeral });
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: t('need_manage_guild'), flags: MessageFlags.Ephemeral });
      }
      g.lang = interaction.options.getString('idioma');
      db.save();
      // Se responde ya en el nuevo idioma
      const { t: tNew } = require('../lib/i18n');
      await interaction.reply(tNew(interaction.guildId, 'lang_set', { lang: LANGS[g.lang] }));
    },
  },

  {
    category: 'config',
    data: new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Configura bienvenida, logs y autorol')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand((s) => s
        .setName('bienvenida')
        .setDescription('Activa los mensajes de bienvenida')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal de bienvenida').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
        .addStringOption((o) => o.setName('mensaje').setDescription('Variables: {user} {server} {count}').setMaxLength(500)))
      .addSubcommand((s) => s
        .setName('logs')
        .setDescription('Canal donde se registran moderación y eventos')
        .addChannelOption((o) => o.setName('canal').setDescription('Canal de logs').addChannelTypes(ChannelType.GuildText).setRequired(true)))
      .addSubcommand((s) => s
        .setName('autorol')
        .setDescription('Rol que se da automáticamente a los nuevos miembros')
        .addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)))
      .addSubcommand((s) => s
        .setName('desactivar')
        .setDescription('Desactiva un módulo')
        .addStringOption((o) => o.setName('modulo').setDescription('Módulo').setRequired(true).addChoices(
          { name: 'Bienvenida', value: 'welcome' },
          { name: 'Logs', value: 'logs' },
          { name: 'Autorol', value: 'autorole' },
        ))),
    async execute(interaction, t) {
      const g = db.guild(interaction.guildId);
      const sub = interaction.options.getSubcommand();

      if (sub === 'bienvenida') {
        const channel = interaction.options.getChannel('canal');
        g.welcome = { enabled: true, channel: channel.id, message: interaction.options.getString('mensaje') };
        db.save();
        return interaction.reply({ content: t('setup_welcome_ok', { channel: channel.toString() }), flags: MessageFlags.Ephemeral });
      }
      if (sub === 'logs') {
        const channel = interaction.options.getChannel('canal');
        g.logChannel = channel.id;
        db.save();
        return interaction.reply({ content: t('setup_logs_ok', { channel: channel.toString() }), flags: MessageFlags.Ephemeral });
      }
      if (sub === 'autorol') {
        const role = interaction.options.getRole('rol');
        const me = interaction.guild.members.me;
        if (role.managed || role.id === interaction.guild.id || role.position >= me.roles.highest.position) {
          return interaction.reply({ content: t('role_unassignable'), flags: MessageFlags.Ephemeral });
        }
        g.autoRole = role.id;
        db.save();
        return interaction.reply({ content: t('setup_autorole_ok', { role: role.toString() }), flags: MessageFlags.Ephemeral });
      }
      const module_ = interaction.options.getString('modulo');
      if (module_ === 'welcome') g.welcome.enabled = false;
      if (module_ === 'logs') g.logChannel = null;
      if (module_ === 'autorole') g.autoRole = null;
      db.save();
      await interaction.reply({ content: t('setup_disabled'), flags: MessageFlags.Ephemeral });
    },
  },
];
