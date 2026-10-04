// Base de datos simple en JSON (sin dependencias nativas). Archivo: data/db.json
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DIR, 'db.json');

const DEFAULTS = () => ({
  lang: 'es',
  logChannel: null,
  autoRole: null,
  welcome: { enabled: false, channel: null, message: null },
  levels: { enabled: true, announce: true, users: {} },
  warns: {},
  automod: {
    action: 'delete', // delete | timeout
    badWords: [],
    rules: {
      antiLinks: false,
      antiInvites: false,
      antiSpam: false,
      antiCaps: false,
      antiMentions: false,
      badWords: false,
    },
  },
});

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function merge(target, defaults) {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) target[key] = defaults[key];
    else if (isObj(defaults[key]) && isObj(target[key])) merge(target[key], defaults[key]);
  }
  return target;
}

let data = { guilds: {} };
try {
  fs.mkdirSync(DIR, { recursive: true });
  if (fs.existsSync(FILE)) data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (!data.guilds) data.guilds = {};
} catch (err) {
  console.error('[db] No se pudo leer db.json, se inicia vacía:', err.message);
}

let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fs.writeFile(FILE, JSON.stringify(data), (err) => {
      if (err) console.error('[db] Error guardando:', err.message);
    });
  }, 500);
}

/** Devuelve la configuración del servidor (se crea con valores por defecto). */
function guild(id) {
  data.guilds[id] = merge(data.guilds[id] || {}, DEFAULTS());
  return data.guilds[id];
}

function flush() {
  clearTimeout(timer);
  try { fs.writeFileSync(FILE, JSON.stringify(data)); } catch {}
}
process.on('SIGINT', () => { flush(); process.exit(0); });
process.on('SIGTERM', () => { flush(); process.exit(0); });

module.exports = { guild, save, flush };
