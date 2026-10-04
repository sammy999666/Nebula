const { Events, MessageFlags } = require('discord.js');
const { t: translate } = require('../lib/i18n');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (interaction.isAutocomplete()) {
      try { await command.autocomplete?.(interaction); } catch (err) { console.error('[autocomplete]', err.message); }
      return;
    }
    if (!interaction.isChatInputCommand()) return;

    const t = (key, vars) => translate(interaction.guildId, key, vars);
    try {
      await command.execute(interaction, t);
    } catch (err) {
      console.error(`[/${interaction.commandName}]`, err);
      const payload = { content: t('err_generic'), flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => {});
      else await interaction.reply(payload).catch(() => {});
    }
  },
};
