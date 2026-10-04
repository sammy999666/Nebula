require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./lib/loader');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('Faltan DISCORD_TOKEN y/o CLIENT_ID en el archivo .env (mira .env.example).');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,     // Privilegiado: bienvenida / autorol
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,   // Privilegiado: AutoMod propio y niveles
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.commands = loadCommands();

const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'))) {
  const event = require(path.join(eventsDir, file));
  client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
}

process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
client.login(process.env.DISCORD_TOKEN);
