// /automod -> AutoMod propio del bot  |  /automod-discord -> reglas nativas de Discord (AutoMod del servidor)
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  AutoModerationActionType,
  AutoModerationRuleKeywordPresetType,
  ChannelType,
} = require('discord.js');
const { MessageFlags } = require('discord.js');
const db = require('../lib/db');
const { embed, COLORS } = require('../lib/utils');

const RULES = [
  ['antiLinks', 'Anti-enlaces'],
  ['antiInvites', 'Anti-invitaciones'],
  ['antiSpam', 'Anti-spam'],
  ['antiCaps', 'Anti-mayúsculas'],
  ['antiMentions', 'Anti-menciones masivas'],
  ['badWords', 'Palabras prohibidas'],
];

const TRIGGER_NAMES = {
  [AutoModerationRuleTriggerType.Keyword]: 'Palabras clave',
  [AutoModerationRuleTriggerType.Spam]: 'Spam',
  [AutoModerationRuleTriggerType.KeywordPreset]: 'Presets',
  [AutoModerationRuleTriggerType.MentionSpam]: 'Menciones',
};

/** Acciones comunes de las reglas nativas. */
function buildActions(interaction, t, { allowTimeout = false } = {}) {
  const actions = [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: t('native_block_msg') } }];
  const alert = interaction.options.getChannel('alertas');
  if (alert) actions.push({ type: AutoModerationActionType.SendAlertMessage, metadata: { channel: alert.id } });
  const minutes = allowTimeout ? interaction.options.getInteger('aislar_minutos') : null;
  if (minutes) actions.push({ type: AutoModerationActionType.Timeout, metadata: { durationSeconds: minutes * 60 } });
  return actions;
}

const alertOption = (o) => o.setName('alertas').setDescription('Canal donde Discord enviará alertas').addChannelTypes(ChannelType.GuildText);
const timeoutOption = (o) => o.setName('aislar_minutos').setDescription('Aislar al infractor (minutos)').setMinValue(1).setMaxValue(1440);

async function createNative(interaction, t, rule) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const created = await interaction.guild.autoModerationRules.create({
      eventType: AutoModerationRuleEventType.MessageSend,
      enabled: true,
      reason: `AutoMod nativo creado por ${interaction.user.tag}`,
      ...rule,
    });
    await interaction.editReply(t('native_created', { name: created.name }));
  } catch (err) {
    await interaction.editReply(t('native_error', { error: err.message }));
  }
}

const customCommand = {
  category: 'automod',
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configura el AutoMod propio del bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s.setName('estado').setDescription('Muestra qué reglas están activas'))
    .addSubcommand((s) => s
      .setName('regla')
      .setDescription('Activa o desactiva una regla')
      .addStringOption((o) => o.setName('nombre').setDescription('Regla').setRequired(true).addChoices(...RULES.map(([value, name]) => ({ name, value }))))
      .addBooleanOption((o) => o.setName('activa').setDescription('¿Activar?').setRequired(true)))
    .addSubcommand((s) => s
      .setName('accion')
      .setDescription('Qué hacer con los infractores')
      .addStringOption((o) => o.setName('tipo').setDescription('Acción').setRequired(true).addChoices(
        { name: 'Solo borrar el mensaje', value: 'delete' },
        { name: 'Borrar + aislar 5 minutos', value: 'timeout' },
      )))
    .addSubcommand((s) => s
      .setName('palabras')
      .setDescription('Gestiona la lista de palabras prohibidas')
      .addStringOption((o) => o.setName('accion').setDescription('Acción').setRequired(true).addChoices(
        { name: 'Agregar', value: 'add' },
        { name: 'Quitar', value: 'remove' },
        { name: 'Listar', value: 'list' },
      ))
      .addStringOption((o) => o.setName('palabra').setDescription('Palabra (para agregar o quitar)').setMaxLength(50))),

  async execute(interaction, t) {
    const g = db.guild(interaction.guildId);
    const cfg = g.automod;
    const sub = interaction.options.getSubcommand();

    if (sub === 'estado') {
      const lines = RULES.map(([key]) => `${cfg.rules[key] ? '🟢' : '🔴'} ${t(`rule_${key}`)}`);
      return interaction.reply({
        embeds: [embed()
          .setTitle(t('am_status_title'))
          .setDescription(lines.join('\n'))
          .addFields({ name: t('f_action'), value: cfg.action === 'timeout' ? t('act_timeout') : t('act_delete') })],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (sub === 'regla') {
      const key = interaction.options.getString('nombre');
      const on = interaction.options.getBoolean('activa');
      cfg.rules[key] = on;
      db.save();
      return interaction.reply({ content: t(on ? 'am_rule_on' : 'am_rule_off', { rule: t(`rule_${key}`) }), flags: MessageFlags.Ephemeral });
    }

    if (sub === 'accion') {
      cfg.action = interaction.options.getString('tipo');
      db.save();
      return interaction.reply({ content: t('am_action_set', { action: cfg.action === 'timeout' ? t('act_timeout') : t('act_delete') }), flags: MessageFlags.Ephemeral });
    }

    // palabras
    const action = interaction.options.getString('accion');
    const word = interaction.options.getString('palabra')?.trim().toLowerCase();
    if (action === 'list') {
      return interaction.reply({ content: cfg.badWords.length ? `||${cfg.badWords.join(', ')}||` : t('am_words_empty'), flags: MessageFlags.Ephemeral });
    }
    if (!word) return interaction.reply({ content: t('am_word_required'), flags: MessageFlags.Ephemeral });
    if (action === 'add') {
      if (!cfg.badWords.includes(word)) cfg.badWords.push(word);
      db.save();
      return interaction.reply({ content: t('am_word_added'), flags: MessageFlags.Ephemeral });
    }
    cfg.badWords = cfg.badWords.filter((w) => w !== word);
    db.save();
    return interaction.reply({ content: t('am_word_removed'), flags: MessageFlags.Ephemeral });
  },
};

const nativeCommand = {
  category: 'automod',
  data: new SlashCommandBuilder()
    .setName('automod-discord')
    .setDescription('Crea y gestiona reglas del AutoMod nativo de Discord')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) => s
      .setName('palabras')
      .setDescription('Bloquea palabras clave (separadas por comas; admite comodines *)')
      .addStringOption((o) => o.setName('lista').setDescription('Ej: palabra1, *insulto*, otra').setRequired(true))
      .addStringOption((o) => o.setName('nombre').setDescription('Nombre de la regla').setMaxLength(100))
      .addChannelOption(alertOption)
      .addIntegerOption(timeoutOption))
    .addSubcommand((s) => s
      .setName('spam')
      .setDescription('Bloquea mensajes sospechosos de spam (1 regla por servidor)')
      .addChannelOption(alertOption))
    .addSubcommand((s) => s
      .setName('menciones')
      .setDescription('Bloquea menciones masivas (1 regla por servidor)')
      .addIntegerOption((o) => o.setName('limite').setDescription('Máximo de menciones por mensaje').setRequired(true).setMinValue(1).setMaxValue(50))
      .addChannelOption(alertOption)
      .addIntegerOption(timeoutOption))
    .addSubcommand((s) => s
      .setName('presets')
      .setDescription('Usa las listas predefinidas de Discord')
      .addStringOption((o) => o.setName('tipo').setDescription('Lista').setRequired(true).addChoices(
        { name: 'Todas', value: 'all' },
        { name: 'Groserías', value: 'profanity' },
        { name: 'Contenido sexual', value: 'sexual' },
        { name: 'Insultos / slurs', value: 'slurs' },
      ))
      .addChannelOption(alertOption))
    .addSubcommand((s) => s.setName('listar').setDescription('Lista las reglas nativas del servidor'))
    .addSubcommand((s) => s
      .setName('eliminar')
      .setDescription('Elimina una regla nativa')
      .addStringOption((o) => o.setName('regla').setDescription('Regla a eliminar').setRequired(true).setAutocomplete(true))),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const rules = await interaction.guild.autoModerationRules.fetch().catch(() => null);
    if (!rules) return interaction.respond([]);
    await interaction.respond(
      rules.filter((r) => r.name.toLowerCase().includes(focused)).first(25).map((r) => ({ name: r.name.slice(0, 100), value: r.id })),
    );
  },

  async execute(interaction, t) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'palabras') {
      const list = interaction.options.getString('lista').split(',').map((w) => w.trim()).filter(Boolean).slice(0, 1000);
      return createNative(interaction, t, {
        name: interaction.options.getString('nombre') ?? 'Nebula • Palabras prohibidas',
        triggerType: AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: { keywordFilter: list },
        actions: buildActions(interaction, t, { allowTimeout: true }),
      });
    }

    if (sub === 'spam') {
      return createNative(interaction, t, {
        name: 'Nebula • Anti-spam',
        triggerType: AutoModerationRuleTriggerType.Spam,
        actions: buildActions(interaction, t),
      });
    }

    if (sub === 'menciones') {
      return createNative(interaction, t, {
        name: 'Nebula • Menciones masivas',
        triggerType: AutoModerationRuleTriggerType.MentionSpam,
        triggerMetadata: { mentionTotalLimit: interaction.options.getInteger('limite') },
        actions: buildActions(interaction, t, { allowTimeout: true }),
      });
    }

    if (sub === 'presets') {
      const type = interaction.options.getString('tipo');
      const map = {
        profanity: [AutoModerationRuleKeywordPresetType.Profanity],
        sexual: [AutoModerationRuleKeywordPresetType.SexualContent],
        slurs: [AutoModerationRuleKeywordPresetType.Slurs],
        all: [AutoModerationRuleKeywordPresetType.Profanity, AutoModerationRuleKeywordPresetType.SexualContent, AutoModerationRuleKeywordPresetType.Slurs],
      };
      return createNative(interaction, t, {
        name: 'Nebula • Filtros de Discord',
        triggerType: AutoModerationRuleTriggerType.KeywordPreset,
        triggerMetadata: { presets: map[type] },
        actions: buildActions(interaction, t),
      });
    }

    if (sub === 'listar') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const rules = await interaction.guild.autoModerationRules.fetch().catch((err) => err);
      if (rules instanceof Error) return interaction.editReply(t('native_error', { error: rules.message }));
      if (!rules.size) return interaction.editReply(t('native_none'));
      const lines = rules.map((r) => `${r.enabled ? '🟢' : '🔴'} **${r.name}** — ${TRIGGER_NAMES[r.triggerType] ?? r.triggerType}`);
      return interaction.editReply({ embeds: [embed(COLORS.main).setTitle(t('native_list_title')).setDescription(lines.join('\n'))] });
    }

    // eliminar
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await interaction.guild.autoModerationRules.delete(interaction.options.getString('regla'), `Eliminada por ${interaction.user.tag}`);
      await interaction.editReply(t('native_deleted'));
    } catch (err) {
      await interaction.editReply(t('native_error', { error: err.message }));
    }
  },
};

module.exports = [customCommand, nativeCommand];
