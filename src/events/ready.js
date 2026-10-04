const { Events, ActivityType } = require('discord.js');
const { registerCommands } = require('../lib/loader');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Conectado como ${client.user.tag} en ${client.guilds.cache.size} servidores`);

    const statuses = [
      () => ({ name: '/help • Nebula Bot', type: ActivityType.Listening }),
      () => ({ name: `${client.guilds.cache.size} servidores 💜`, type: ActivityType.Watching }),
      () => ({ name: '/ship — ¿cuánto se aman?', type: ActivityType.Playing }),
    ];
    let i = 0;
    const rotate = () => client.user.setActivity(statuses[i++ % statuses.length]());
    rotate();
    setInterval(rotate, 30_000).unref();

    if (process.env.AUTO_DEPLOY !== 'false') {
      await registerCommands(client.commands).catch((err) => console.error('[deploy] Error:', err.message));
    }
  },
};
