const { Events } = require('discord.js');
const db = require('../lib/db');
const { t } = require('../lib/i18n');
const { embed, COLORS, sendLog } = require('../lib/utils');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const g = db.guild(member.guild.id);

    if (g.autoRole) {
      await member.roles.add(g.autoRole, 'Autorol').catch(() => {});
    }

    if (g.welcome.enabled && g.welcome.channel) {
      const channel = member.guild.channels.cache.get(g.welcome.channel);
      if (channel?.isTextBased()) {
        const template = g.welcome.message || t(member.guild.id, 'welcome_default');
        const text = template
          .replaceAll('{user}', member.toString())
          .replaceAll('{server}', member.guild.name)
          .replaceAll('{count}', member.guild.memberCount);
        channel.send({
          embeds: [embed(COLORS.pink).setDescription(text).setThumbnail(member.user.displayAvatarURL({ size: 256 }))],
        }).catch(() => {});
      }
    }

    sendLog(member.guild, embed(COLORS.ok)
      .setTitle(t(member.guild.id, 'log_join'))
      .setDescription(`${member} (${member.user.tag})`)
      .setThumbnail(member.user.displayAvatarURL()));
  },
};
