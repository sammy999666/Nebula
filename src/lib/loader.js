const fs = require('node:fs');
const path = require('node:path');
const { Collection, REST, Routes, InteractionContextType } = require('discord.js');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/** Carga todos los comandos. Cada archivo exporta un comando o un array de comandos. */
function loadCommands() {
  const commands = new Collection();
  for (const file of fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.js'))) {
    const exported = require(path.join(COMMANDS_DIR, file));
    for (const cmd of [].concat(exported)) {
      cmd.data.setContexts(InteractionContextType.Guild); // solo en servidores
      commands.set(cmd.data.name, cmd);
    }
  }
  return commands;
}

/** Registra los slash commands en Discord (global o en un servidor de pruebas). */
async function registerCommands(commands) {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const body = commands.map((c) => c.data.toJSON());
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body });
  console.log(`[deploy] ${body.length} comandos registrados ${GUILD_ID ? `en el servidor ${GUILD_ID}` : 'globalmente'}.`);
}

module.exports = { loadCommands, registerCommands };
