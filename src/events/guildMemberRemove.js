const { Events } = require('discord.js');
const { t } = require('../lib/i18n');
const { embed, COLORS, sendLog } = require('../lib/utils');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    sendLog(member.guild, embed(COLORS.err)
      .setTitle(t(member.guild.id, 'log_leave'))
      .setDescription(`${member.user.tag} (${member.id})`)
      .setThumbnail(member.user.displayAvatarURL()));
  },
};
