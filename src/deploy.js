// Registra los slash commands manualmente: npm run deploy
require('dotenv').config();
const { loadCommands, registerCommands } = require('./lib/loader');

registerCommands(loadCommands()).catch((err) => {
  console.error('[deploy] Error:', err);
  process.exit(1);
});
