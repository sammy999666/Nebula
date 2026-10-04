const { Events } = require('discord.js');
const { t } = require('../lib/i18n');
const { embed, COLORS, sendLog, shorten } = require('../lib/utils');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.guild || message.author?.bot || !message.content) return;
    sendLog(message.guild, embed(COLORS.warn)
      .setTitle(t(message.guild.id, 'log_msg_deleted'))
      .addFields(
        { name: t(message.guild.id, 'f_user'), value: `${message.author} (${message.author.id})`, inline: true },
        { name: t(message.guild.id, 'f_channel'), value: `${message.channel}`, inline: true },
        { name: t(message.guild.id, 'f_content'), value: shorten(message.content, 1000) },
      ));
  },
};
