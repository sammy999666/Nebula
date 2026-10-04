const crypto = require('node:crypto');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { embed, COLORS } = require('../lib/utils');
const { renderShip } = require('../lib/shipImage');

/** Porcentaje estable para la pareja durante el día (mismo par = mismo resultado ese día). */
function lovePercent(idA, idB) {
  if (idA === idB) return 100;
  const [x, y] = [idA, idB].sort();
  const day = new Date().toISOString().slice(0, 10);
  const hash = crypto.createHash('sha256').update(`${x}:${y}:${day}`).digest();
  return hash.readUInt16BE(0) % 101;
}

function shipName(a, b) {
  return a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2));
}

function tier(percent, self) {
  if (self) return 'ship_self';
  if (percent === 100) return 'ship_5';
  if (percent >= 80) return 'ship_4';
  if (percent >= 60) return 'ship_3';
  if (percent >= 40) return 'ship_2';
  if (percent >= 20) return 'ship_1';
  return 'ship_0';
}

module.exports = [
  {
    category: 'fun',
    data: new SlashCommandBuilder()
      .setName('ship')
      .setDescription('Mide el amor entre dos usuarios 💜')
      .addUserOption((o) => o.setName('usuario_a').setDescription('Primer usuario').setRequired(true))
      .addUserOption((o) => o.setName('usuario_b').setDescription('Segundo usuario (por defecto, tú)')),
    async execute(interaction, t) {
      const userA = interaction.options.getUser('usuario_a');
      const userB = interaction.options.getUser('usuario_b') ?? interaction.user;
      await interaction.deferReply();

      const percent = lovePercent(userA.id, userB.id);
      const nameA = userA.displayName;
      const nameB = userB.displayName;

      const buffer = await renderShip({ userA, userB, nameA, nameB, percent });
      const file = new AttachmentBuilder(buffer, { name: 'ship.png' });

      const e = embed(COLORS.pink)
        .setTitle(`💜 ${shipName(nameA, nameB)}`)
        .setDescription(`**${userA}** 💞 **${userB}**\n\n${t(tier(percent, userA.id === userB.id), { percent })}`)
        .setImage('attachment://ship.png')
        .setFooter({ text: t('ship_footer') });

      await interaction.editReply({ embeds: [e], files: [file] });
    },
  },
];
