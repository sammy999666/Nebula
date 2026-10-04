const db = require('./db');
const L = require('./locales');
const extraLocales = require('./extraLocales');

for (const language of Object.keys(L)) {
  Object.assign(L[language], extraLocales[language] ?? {});
}

const LANGS = {
  es: 'Español 🇪🇸',
  en: 'English 🇺🇸',
  pt: 'Português 🇧🇷',
};

const lang = (guildId) => (guildId ? db.guild(guildId).lang : 'es');

/** Valor crudo (string o array). */
function raw(guildId, key) {
  const l = lang(guildId);
  return L[l]?.[key] ?? L.es[key] ?? key;
}

/** Texto traducido con variables {nombre}. */
function t(guildId, key, vars = {}) {
  const value = raw(guildId, key);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

module.exports = { t, raw, lang, LANGS };
