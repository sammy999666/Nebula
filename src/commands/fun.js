const { SlashCommandBuilder } = require('discord.js');
const { embed, COLORS } = require('../lib/utils');
const { raw } = require('../lib/i18n');

const NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = [
  {
    category: 'fun',
    data: new SlashCommandBuilder()
      .setName('8ball')
      .setDescription('Hazle una pregunta a la bola mágica')
      .addStringOption((o) => o.setName('pregunta').setDescription('Tu pregunta').setRequired(true).setMaxLength(200)),
    async execute(interaction, t) {
      const answer = pick(raw(interaction.guildId, 'eightball'));
      await interaction.reply({
        embeds: [embed()
          .setTitle('🎱 8ball')
          .addFields(
            { name: t('f_question'), value: interaction.options.getString('pregunta') },
            { name: t('f_answer'), value: answer },
          )],
      });
    },
  },

  {
    category: 'fun',
    data: new SlashCommandBuilder().setName('moneda').setDescription('Lanza una moneda'),
    async execute(interaction, t) {
      await interaction.reply(Math.random() < 0.5 ? t('coin_heads') : t('coin_tails'));
    },
  },

  {
    category: 'fun',
    data: new SlashCommandBuilder()
      .setName('dado')
      .setDescription('Lanza un dado')
      .addIntegerOption((o) => o.setName('caras').setDescription('Número de caras (por defecto 6)').setMinValue(2).setMaxValue(1000)),
    async execute(interaction, t) {
      const sides = interaction.options.getInteger('caras') ?? 6;
      await interaction.reply(t('dice', { sides, result: 1 + Math.floor(Math.random() * sides) }));
    },
  },

  {
    category: 'fun',
    data: new SlashCommandBuilder()
      .setName('encuesta')
      .setDescription('Crea una encuesta con reacciones')
      .addStringOption((o) => o.setName('pregunta').setDescription('Pregunta de la encuesta').setRequired(true).setMaxLength(250))
      .addStringOption((o) => o.setName('opcion1').setDescription('Opción 1').setMaxLength(100))
      .addStringOption((o) => o.setName('opcion2').setDescription('Opción 2').setMaxLength(100))
      .addStringOption((o) => o.setName('opcion3').setDescription('Opción 3').setMaxLength(100))
      .addStringOption((o) => o.setName('opcion4').setDescription('Opción 4').setMaxLength(100)),
    async execute(interaction, t) {
      const question = interaction.options.getString('pregunta');
      const options = [1, 2, 3, 4].map((i) => interaction.options.getString(`opcion${i}`)).filter(Boolean);
      const emojis = options.length >= 2 ? NUMBERS.slice(0, options.length) : ['👍', '👎'];
      const description = options.length >= 2 ? options.map((o, i) => `${NUMBERS[i]} ${o}`).join('\n') : t('poll_yesno');

      await interaction.reply({
        embeds: [embed(COLORS.pink)
          .setTitle(`📊 ${question}`)
          .setDescription(description)
          .setFooter({ text: t('poll_by', { user: interaction.user.displayName }) })],
      });
      const msg = await interaction.fetchReply();
      for (const emoji of emojis) await msg.react(emoji).catch(() => {});
    },
  },
];
