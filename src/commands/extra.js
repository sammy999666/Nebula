const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require('discord.js');
const crypto = require('node:crypto');
const { embed } = require('../lib/utils');
const { raw, lang } = require('../lib/i18n');
const LOCALES = require('../lib/extraLocales');

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const localized = (values) => ({ 'en-US': values.en, 'pt-BR': values.pt });
const LOCALE_TAG = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };

const CATEGORY_DESCRIPTION = {
  fun: { en: 'A lighthearted game or prompt for your server.', pt: 'Um jogo ou tema leve para o servidor.' },
  social: { en: 'Send a friendly interaction to a server member.', pt: 'Envie uma interação amigável a alguém do servidor.' },
  text: { en: 'Transform, format, or inspect text you provide.', pt: 'Transforme, formate ou analise um texto.' },
  utility: { en: 'Run a quick calculation or view server information.', pt: 'Faça um cálculo rápido ou veja informações do servidor.' },
};

const COMMAND_NAMES = {
  broma: { en: 'joke', pt: 'piada' },
  dato: { en: 'fact', pt: 'fato' },
  consejo: { en: 'advice', pt: 'conselho' },
  frase: { en: 'quote', pt: 'frase' },
  reto: { en: 'challenge', pt: 'desafio' },
  verdad: { en: 'truth', pt: 'verdade' },
  dilema: { en: 'dilemma', pt: 'dilema' },
  oraculo: { en: 'oracle', pt: 'oraculo' },
  fortuna: { en: 'fortune', pt: 'fortuna' },
  suerte: { en: 'luck', pt: 'sorte' },
  numerosecreto: { en: 'secret-number', pt: 'numero-secreto' },
  elige: { en: 'choose', pt: 'escolher' },
  rps: { en: 'rps', pt: 'jokenpo' },
  trivia: { en: 'trivia', pt: 'trivia' },
  adivina: { en: 'guess', pt: 'adivinhar' },
  acertijo: { en: 'riddle', pt: 'enigma' },
  pregunta: { en: 'prompt', pt: 'pergunta' },
  improvisa: { en: 'story-starter', pt: 'ideia-historia' },
  abrazo: { en: 'hug', pt: 'abraco' },
  beso: { en: 'kiss', pt: 'beijo' },
  palmada: { en: 'pat', pt: 'tapinha' },
  saludo: { en: 'greet', pt: 'cumprimentar' },
  sonreir: { en: 'smile', pt: 'sorrir' },
  guino: { en: 'wink', pt: 'piscar' },
  reir: { en: 'laugh', pt: 'rir' },
  bailar: { en: 'dance', pt: 'dancar' },
  chocar: { en: 'highfive', pt: 'bater-cinco' },
  apoyar: { en: 'support', pt: 'apoio' },
  consolar: { en: 'comfort', pt: 'consolo' },
  celebrar: { en: 'celebrate', pt: 'comemorar' },
  elogio: { en: 'compliment', pt: 'elogio' },
  shipamistad: { en: 'friendship', pt: 'amizade' },
  mayus: { en: 'uppercase', pt: 'maiusculas' },
  minus: { en: 'lowercase', pt: 'minusculas' },
  invertir: { en: 'reverse', pt: 'inverter' },
  vaporwave: { en: 'vaporwave', pt: 'vaporwave' },
  mock: { en: 'mock', pt: 'ironia' },
  aplausos: { en: 'claps', pt: 'aplausos' },
  emoji: { en: 'emoji', pt: 'emoji' },
  spoiler: { en: 'spoiler', pt: 'spoiler' },
  citaformat: { en: 'quote-format', pt: 'citar' },
  contar: { en: 'count', pt: 'contar' },
  repetir: { en: 'repeat', pt: 'repetir' },
  lista: { en: 'list', pt: 'lista' },
  sinacentos: { en: 'strip-accents', pt: 'sem-acentos' },
  codigo: { en: 'code', pt: 'codigo' },
  morse: { en: 'morse', pt: 'morse' },
  rot13: { en: 'rot13', pt: 'rot13' },
  palabra: { en: 'word', pt: 'palavra' },
  hexcolor: { en: 'hex-color', pt: 'cor-hex' },
  numero: { en: 'random-number', pt: 'numero-aleatorio' },
  porcentaje: { en: 'percent', pt: 'porcentagem' },
  convertir: { en: 'convert', pt: 'converter' },
  temp: { en: 'temperature', pt: 'temperatura' },
  fecha: { en: 'date', pt: 'data' },
  hora: { en: 'time', pt: 'hora' },
  timestamp: { en: 'timestamp', pt: 'timestamp' },
  sortear: { en: 'draw', pt: 'sortear' },
  decision: { en: 'decide', pt: 'decidir' },
  servericon: { en: 'server-icon', pt: 'icone-servidor' },
  serverbanner: { en: 'server-banner', pt: 'banner-servidor' },
  miembros: { en: 'members', pt: 'membros' },
  rolinfo: { en: 'role-info', pt: 'info-cargo' },
  canalinfo: { en: 'channel-info', pt: 'info-canal' },
  emojiinfo: { en: 'emoji-info', pt: 'info-emoji' },
  permisos: { en: 'permissions', pt: 'permissoes' },
  invitar: { en: 'invite', pt: 'convidar' },
  actividad: { en: 'activity', pt: 'atividade' },
  cuenta: { en: 'account', pt: 'conta' },
  toproles: { en: 'top-roles', pt: 'top-cargos' },
  uptime: { en: 'uptime', pt: 'tempo-ativo' },
};

const OPTION_NAMES = {
  texto: { 'en-US': 'text', 'pt-BR': 'texto' },
  usuario: { 'en-US': 'user', 'pt-BR': 'usuario' },
  minimo: { 'en-US': 'minimum', 'pt-BR': 'minimo' },
  maximo: { 'en-US': 'maximum', 'pt-BR': 'maximo' },
  opciones: { 'en-US': 'options', 'pt-BR': 'opcoes' },
  veces: { 'en-US': 'times', 'pt-BR': 'vezes' },
  valor: { 'en-US': 'value', 'pt-BR': 'valor' },
  porcentaje: { 'en-US': 'percent', 'pt-BR': 'porcentagem' },
  unidad: { 'en-US': 'unit', 'pt-BR': 'unidade' },
  direccion: { 'en-US': 'direction', 'pt-BR': 'direcao' },
  zona_horaria: { 'en-US': 'time_zone', 'pt-BR': 'fuso_horario' },
  fecha: { 'en-US': 'date', 'pt-BR': 'data' },
  pregunta: { 'en-US': 'question', 'pt-BR': 'pergunta' },
  usuario_a: { 'en-US': 'user_a', 'pt-BR': 'usuario_a' },
  usuario_b: { 'en-US': 'user_b', 'pt-BR': 'usuario_b' },
  rol: { 'en-US': 'role', 'pt-BR': 'cargo' },
  canal: { 'en-US': 'channel', 'pt-BR': 'canal' },
  emoji: { 'en-US': 'emoji', 'pt-BR': 'emoji' },
  numero: { 'en-US': 'number', 'pt-BR': 'numero' },
  eleccion: { 'en-US': 'choice', 'pt-BR': 'escolha' },
  idioma_codigo: { 'en-US': 'language', 'pt-BR': 'linguagem' },
};

function addOption(builder, spec) {
  const method = `add${spec.type[0].toUpperCase()}${spec.type.slice(1)}Option`;
  builder[method]((option) => {
    option.setName(spec.name);
    if (OPTION_NAMES[spec.name]) option.setNameLocalizations(OPTION_NAMES[spec.name]);
    option.setDescription(LOCALES.es[`opt_${spec.description}`]);
    option.setDescriptionLocalizations({
      'en-US': LOCALES.en[`opt_${spec.description}`],
      'pt-BR': LOCALES.pt[`opt_${spec.description}`],
    });
    if (spec.required) option.setRequired(true);
    if (spec.maxLength) option.setMaxLength(spec.maxLength);
    if (spec.minValue !== undefined) option.setMinValue(spec.minValue);
    if (spec.maxValue !== undefined) option.setMaxValue(spec.maxValue);
    if (spec.choices) option.addChoices(...spec.choices);
    return option;
  });
}

const str = (name = 'texto', description = 'text', required = true, maxLength = 300) =>
  ({ type: 'string', name, description, required, maxLength });
const integer = (name, description, required = false, minValue, maxValue) =>
  ({ type: 'integer', name, description, required, minValue, maxValue });
const number = (name, description, required = true, minValue = -1_000_000_000, maxValue = 1_000_000_000) =>
  ({ type: 'number', name, description, required, minValue, maxValue });
const user = (name = 'usuario', required = true, description = 'user') =>
  ({ type: 'user', name, description, required });
const role = () => ({ type: 'role', name: 'rol', description: 'role', required: true });
const channel = () => ({ type: 'channel', name: 'canal', description: 'channel' });
const choices = (name, description, values, required = true) =>
  ({ type: 'string', name, description, choices: values, required });

function define(name, category, description, options, execute) {
  const data = new SlashCommandBuilder()
    .setName(name)
    .setNameLocalizations(localized(COMMAND_NAMES[name]))
    .setDescription(description)
    .setDescriptionLocalizations(localized(CATEGORY_DESCRIPTION[category]));
  for (const spec of options) addOption(data, spec);
  return { category, data, execute };
}

function replyText(interaction, text) {
  return interaction.reply({ content: text, allowedMentions: { parse: [] } });
}

function wordsFrom(text) {
  return text.split(/[,\n|]/).map((item) => item.trim()).filter(Boolean);
}

function numberFormat(guildId, value, maximumFractionDigits = 2) {
  const current = lang(guildId);
  return new Intl.NumberFormat(LOCALE_TAG[current] || LOCALE_TAG.es, { maximumFractionDigits }).format(value);
}

const commands = [];
const add = (...args) => commands.push(define(...args));

// Light games, prompts and small conversation starters.
add('broma', 'fun', 'Cuenta una broma corta', [], async (i) => replyText(i, pick(raw(i.guildId, 'ex_jokes'))));
add('dato', 'fun', 'Comparte un dato curioso', [], async (i, t) => replyText(i, t('ex_fact', { fact: pick(raw(i.guildId, 'ex_facts')) })));
add('consejo', 'fun', 'Da un consejo práctico y breve', [], async (i, t) => replyText(i, t('ex_advice', { advice: pick(raw(i.guildId, 'ex_advice')) })));
add('frase', 'fun', 'Comparte una frase para pensar', [], async (i, t) => replyText(i, t('ex_quote', { quote: pick(raw(i.guildId, 'ex_quotes')) })));
add('reto', 'fun', 'Propón un reto amistoso', [], async (i, t) => replyText(i, t('ex_challenge', { challenge: pick(raw(i.guildId, 'ex_challenges')) })));
add('verdad', 'fun', 'Haz una pregunta para conocerse mejor', [], async (i, t) => replyText(i, t('ex_truth', { truth: pick(raw(i.guildId, 'ex_truths')) })));
add('dilema', 'fun', 'Plantea una elección difícil y divertida', [], async (i, t) => replyText(i, t('ex_dilemma', { dilemma: pick(raw(i.guildId, 'ex_dilemmas')) })));
add('oraculo', 'fun', 'Pide una respuesta aleatoria al oráculo', [], async (i, t) => replyText(i, t('ex_oracle', { answer: pick(raw(i.guildId, 'ex_oracles')) })));
add('fortuna', 'fun', 'Saca un mensaje positivo al azar', [], async (i, t) => replyText(i, t('ex_fortune', { fortune: pick(raw(i.guildId, 'ex_fortunes')) })));
add('suerte', 'fun', 'Consulta tu número de suerte (solo por diversión)', [], async (i, t) => {
  const value = Math.floor(Math.random() * 101);
  return replyText(i, t('ex_luck', { number: value, mood: t(value >= 50 ? 'ex_luck_high' : 'ex_luck_low') }));
});
add('numerosecreto', 'fun', 'Revela el número secreto del día', [], async (i, t) => {
  const day = new Date().toISOString().slice(0, 10);
  const digest = crypto.createHash('sha256').update(`${i.guildId}:${day}:nebula`).digest();
  return replyText(i, t('ex_secret_number', { number: digest.readUInt16BE(0) % 100 + 1 }));
});
add('elige', 'fun', 'Elige al azar entre varias opciones', [str('opciones', 'choices', true, 1000)], async (i, t) => {
  const options = wordsFrom(i.options.getString('opciones'));
  if (options.length < 2) return replyText(i, t('ex_empty_choices'));
  return replyText(i, t('ex_pick', { choice: pick(options).slice(0, 180) }));
});
add('rps', 'fun', 'Juega piedra, papel o tijera contra Nebula', [
  choices('eleccion', 'direction', [
    { name: '🪨 Piedra', value: 'rock' },
    { name: '📄 Papel', value: 'paper' },
    { name: '✂️ Tijera', value: 'scissors' },
  ]),
], async (i, t) => {
  const player = i.options.getString('eleccion');
  const bot = pick(['rock', 'paper', 'scissors']);
  const names = { rock: t('ex_rock'), paper: t('ex_paper'), scissors: t('ex_scissors') };
  const tie = player === bot;
  const win = (player === 'rock' && bot === 'scissors')
    || (player === 'paper' && bot === 'rock')
    || (player === 'scissors' && bot === 'paper');
  return replyText(i, t('ex_rps', {
    player: names[player],
    bot: names[bot],
    result: t(tie ? 'ex_rps_tie' : win ? 'ex_rps_win' : 'ex_rps_loss'),
  }));
});
add('trivia', 'fun', 'Recibe una pregunta de cultura general con su respuesta', [], async (i, t) => {
  const item = pick(raw(i.guildId, 'ex_trivia'));
  return replyText(i, t('ex_trivia', item));
});
add('adivina', 'fun', 'Intenta adivinar un número del 1 al 10', [
  integer('numero', 'value', true, 1, 10),
], async (i, t) => {
  const guess = i.options.getInteger('numero');
  const result = Math.floor(Math.random() * 10) + 1;
  return replyText(i, t('ex_guess', {
    guess,
    number: result,
    result: t(guess === result ? 'ex_guess_right' : 'ex_guess_wrong'),
  }));
});
add('acertijo', 'fun', 'Propón un acertijo (respuesta oculta)', [], async (i, t) => {
  const item = pick(raw(i.guildId, 'ex_riddles'));
  return replyText(i, t('ex_riddle', item));
});
add('pregunta', 'fun', 'Propón un tema de conversación', [], async (i, t) => replyText(i, t('ex_prompt', { prompt: pick(raw(i.guildId, 'ex_prompts')) })));
add('improvisa', 'fun', 'Crea un inicio inesperado para una historia', [], async (i, t) => replyText(i, t('ex_story', { prompt: pick(raw(i.guildId, 'ex_stories')) })));

// Friendly social reactions: no external image API or extra permissions required.
const socialActions = [
  ['abrazo', 'Da un abrazo amistoso', 'ex_action_hug'],
  ['beso', 'Envía un beso amistoso', 'ex_action_kiss'],
  ['palmada', 'Da una palmada amistosa', 'ex_action_pat'],
  ['saludo', 'Saluda a alguien', 'ex_action_greet'],
  ['sonreir', 'Dedica una sonrisa', 'ex_action_smile'],
  ['guino', 'Guiña un ojo', 'ex_action_wink'],
  ['reir', 'Comparte una risa', 'ex_action_laugh'],
  ['bailar', 'Invita a alguien a bailar', 'ex_action_dance'],
  ['chocar', 'Choca los cinco', 'ex_action_highfive'],
  ['apoyar', 'Envía apoyo a alguien', 'ex_action_support'],
  ['consolar', 'Ofrece consuelo a alguien', 'ex_action_comfort'],
  ['celebrar', 'Celebra con alguien', 'ex_action_celebrate'],
];
for (const [name, description, actionKey] of socialActions) {
  add(name, 'social', description, [user()], async (i, t) => {
    const target = i.options.getUser('usuario');
    if (target.id === i.user.id) return replyText(i, t('cannot_self'));
    return replyText(i, t('ex_social', {
      actor: i.user.toString(),
      action: t(actionKey),
      target: target.toString(),
    }));
  });
}
add('elogio', 'social', 'Envía un cumplido amable a alguien', [user()], async (i, t) => {
  const target = i.options.getUser('usuario');
  const compliment = pick(raw(i.guildId, 'ex_compliments'));
  return replyText(i, t('ex_compliment', { target: target.toString(), compliment }));
});
add('shipamistad', 'social', 'Calcula la química de amistad entre dos personas', [
  user('usuario_a', true, 'user_a'),
  user('usuario_b', false, 'user_b'),
], async (i, t) => {
  const a = i.options.getUser('usuario_a');
  const b = i.options.getUser('usuario_b') ?? i.user;
  const percent = crypto.createHash('sha256').update([a.id, b.id].sort().join(':')).digest().readUInt16BE(0) % 101;
  const line = t(percent >= 75 ? 'ex_friend_high' : percent >= 40 ? 'ex_friend_mid' : 'ex_friend_low');
  return replyText(i, t('ex_friendship', { a: a.toString(), b: b.toString(), percent, line }));
});

// Text tools. Text supplied by the member is returned without allowing pings.
const textOption = [str('texto', 'text', true, 1500)];
const transform = (name, description, key, fn) => add(name, 'text', description, textOption, async (i, t) => {
  const text = i.options.getString('texto');
  const result = fn(text).slice(0, 1800).replace(/[\uD800-\uDBFF]$/, '');
  return replyText(i, t(key, { text: result }));
});
transform('mayus', 'Convierte el texto a mayúsculas', 'ex_upper', (s) => s.toLocaleUpperCase());
transform('minus', 'Convierte el texto a minúsculas', 'ex_lower', (s) => s.toLocaleLowerCase());
transform('invertir', 'Invierte el orden de los caracteres', 'ex_reverse', (s) => Array.from(s).reverse().join(''));
transform('vaporwave', 'Convierte el texto a estilo vaporwave', 'ex_vaporwave', (s) =>
  Array.from(s, (char) => char === ' ' ? '　' : char.charCodeAt(0) >= 33 && char.charCodeAt(0) <= 126
    ? String.fromCharCode(char.charCodeAt(0) + 0xFEE0) : char).join(''));
transform('mock', 'Alterna mayúsculas y minúsculas', 'ex_mock', (s) => {
  let upper = false;
  return Array.from(s, (char) => {
    if (!/\p{L}/u.test(char)) return char;
    upper = !upper;
    return upper ? char.toLocaleUpperCase() : char.toLocaleLowerCase();
  }).join('');
});
transform('aplausos', 'Añade aplausos entre las palabras', 'ex_claps', (s) => s.trim().split(/\s+/).join(' 👏 '));
transform('emoji', 'Convierte las letras en emojis de letras', 'ex_emoji', (s) => Array.from(s.toUpperCase(), (char) => {
  if (char >= 'A' && char <= 'Z') return String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65);
  return char >= '0' && char <= '9' ? `${char}️⃣` : char;
}).join(''));
transform('spoiler', 'Oculta un texto con formato spoiler de Discord', 'ex_spoiler', (s) => s.replaceAll('||', '| |'));
transform('citaformat', 'Convierte cada línea en una cita de Discord', 'ex_quoteformat', (s) => s.split('\n').map((line) => `> ${line}`).join('\n'));
add('contar', 'text', 'Cuenta caracteres, palabras y líneas', textOption, async (i, t) => {
  const text = i.options.getString('texto');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return replyText(i, t('ex_text_stats', { chars: Array.from(text).length, words, lines: text.split(/\r?\n/).length }));
});
add('repetir', 'text', 'Repite un texto de una a cinco veces', [
  str('texto', 'text', true, 300),
  integer('veces', 'count', false, 1, 5),
], async (i, t) => {
  const text = i.options.getString('texto');
  const times = i.options.getInteger('veces') ?? 2;
  return replyText(i, t('ex_repeat', { text: Array(times).fill(text).join('\n').slice(0, 1900) }));
});
add('lista', 'text', 'Convierte elementos separados por coma en una lista', [str('texto', 'text', true, 1000)], async (i, t) => {
  const items = wordsFrom(i.options.getString('texto')).slice(0, 30).map((item, index) => `${index + 1}. ${item}`).join('\n');
  if (!items) return replyText(i, t('ex_empty_choices'));
  return replyText(i, t('ex_list', { items }));
});
transform('sinacentos', 'Quita los acentos del texto', 'ex_no_diacritics', (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
add('codigo', 'text', 'Formatea texto como un bloque de código', [
  str('texto', 'text', true, 1500),
  str('idioma_codigo', 'language', false, 16),
], async (i, t) => {
  const content = i.options.getString('texto').replaceAll('```', 'ˋˋˋ');
  const language = (i.options.getString('idioma_codigo') || '').replace(/[^a-zA-Z0-9_+-]/g, '');
  await i.reply({ content: `${t('ex_code', { language: language || 'text' })}\n\`\`\`${language}\n${content}\n\`\`\``, allowedMentions: { parse: [] } });
});
const MORSE = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
  i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
  q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
  y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-',
  ',': '--..--', '?': '..--..', '!': '-.-.--', ' ': '/',
};
add('morse', 'text', 'Convierte letras y números a código Morse', textOption, async (i, t) => {
  const text = i.options.getString('texto').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const encoded = Array.from(text, (char) => MORSE[char] ?? char).join(' ').slice(0, 1750);
  return replyText(i, t('ex_morse', { text: encoded }));
});
transform('rot13', 'Aplica ROT13 alfabético (no es cifrado seguro)', 'ex_rot13', (s) => s.replace(/[a-zA-Z]/g, (char) => {
  const base = char <= 'Z' ? 65 : 97;
  return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
}));
add('palabra', 'text', 'Elige una palabra al azar en el idioma del servidor', [], async (i, t) => replyText(i, t('ex_random_word', { word: pick(raw(i.guildId, 'ex_words')) })));
add('hexcolor', 'text', 'Genera un color hexadecimal aleatorio', [], async (i, t) => {
  const hex = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0').toUpperCase()}`;
  await i.reply({ embeds: [embed(parseInt(hex.slice(1), 16)).setTitle(t('ex_hexcolor', { hex })).setDescription(`\`${hex}\``)] });
});

// Small calculators, dates and read-only server helpers.
add('numero', 'utility', 'Genera un número entero aleatorio dentro de un intervalo', [
  integer('minimo', 'min', false, -1_000_000_000, 1_000_000_000),
  integer('maximo', 'max', false, -1_000_000_000, 1_000_000_000),
], async (i, t) => {
  const min = i.options.getInteger('minimo') ?? 1;
  const max = i.options.getInteger('maximo') ?? 100;
  if (min > max || max - min > 1_000_000_000) return replyText(i, t('ex_range_error'));
  return replyText(i, t('ex_random_number', { number: min + Math.floor(Math.random() * (max - min + 1)) }));
});
add('porcentaje', 'utility', 'Calcula un porcentaje de una cantidad', [
  number('valor', 'value'),
  number('porcentaje', 'percent'),
], async (i, t) => {
  const value = i.options.getNumber('valor');
  const percent = i.options.getNumber('porcentaje');
  return replyText(i, t('ex_percentage', {
    value: numberFormat(i.guildId, value),
    percent: numberFormat(i.guildId, percent),
    result: numberFormat(i.guildId, value * percent / 100),
  }));
});
const UNITS = {
  km_mi: { from: 'km', to: 'mi', factor: 0.621371 },
  mi_km: { from: 'mi', to: 'km', factor: 1.60934 },
  kg_lb: { from: 'kg', to: 'lb', factor: 2.20462 },
  lb_kg: { from: 'lb', to: 'kg', factor: 0.453592 },
  cm_in: { from: 'cm', to: 'in', factor: 0.393701 },
  in_cm: { from: 'in', to: 'cm', factor: 2.54 },
  l_gal: { from: 'L', to: 'US gal', factor: 0.264172 },
  gal_l: { from: 'US gal', to: 'L', factor: 3.78541 },
};
add('convertir', 'utility', 'Convierte distancias, pesos y volúmenes', [
  number('valor', 'value'),
  choices('unidad', 'unit', Object.keys(UNITS).map((value) => ({ name: `${UNITS[value].from} → ${UNITS[value].to}`, value }))),
], async (i, t) => {
  const value = i.options.getNumber('valor');
  const conversion = UNITS[i.options.getString('unidad')];
  return replyText(i, t('ex_conversion', {
    value: numberFormat(i.guildId, value),
    from: conversion.from,
    result: numberFormat(i.guildId, value * conversion.factor),
    to: conversion.to,
  }));
});
add('temp', 'utility', 'Convierte temperaturas entre Celsius y Fahrenheit', [
  number('valor', 'value'),
  choices('direccion', 'direction', [
    { name: '°C → °F', value: 'c_f' },
    { name: '°F → °C', value: 'f_c' },
  ]),
], async (i, t) => {
  const value = i.options.getNumber('valor');
  const celsius = i.options.getString('direccion') === 'f_c';
  const result = celsius ? (value - 32) * 5 / 9 : value * 9 / 5 + 32;
  return replyText(i, t('ex_temperature', {
    value: numberFormat(i.guildId, value),
    from: celsius ? 'F' : 'C',
    result: numberFormat(i.guildId, result),
    to: celsius ? 'C' : 'F',
  }));
});
function dateForLocale(guildId, date, timeZone, timeStyle = 'short') {
  const current = lang(guildId);
  return new Intl.DateTimeFormat(LOCALE_TAG[current] || LOCALE_TAG.es, {
    dateStyle: 'full',
    timeStyle,
    timeZone,
  }).format(date);
}
add('fecha', 'utility', 'Muestra la fecha y hora en una zona horaria', [
  str('zona_horaria', 'timezone', false, 64),
], async (i, t) => {
  const zone = i.options.getString('zona_horaria') || 'UTC';
  try {
    return replyText(i, t('ex_date', { date: dateForLocale(i.guildId, new Date(), zone), zone }));
  } catch {
    return replyText(i, t('ex_timezone_error'));
  }
});
add('hora', 'utility', 'Muestra la hora de una zona horaria IANA', [
  str('zona_horaria', 'timezone', false, 64),
], async (i, t) => {
  const zone = i.options.getString('zona_horaria') || 'UTC';
  try {
    return replyText(i, t('ex_time', { date: dateForLocale(i.guildId, new Date(), zone), zone }));
  } catch {
    return replyText(i, t('ex_timezone_error'));
  }
});
add('timestamp', 'utility', 'Convierte una fecha en un timestamp dinámico de Discord', [
  str('fecha', 'epoch', false, 80),
], async (i, t) => {
  const input = i.options.getString('fecha');
  let date = new Date();
  if (input) {
    const seconds = /^\d{9,11}$/.test(input) ? Number(input) * 1000 : NaN;
    date = new Date(Number.isFinite(seconds) ? seconds : input);
  }
  if (Number.isNaN(date.getTime())) return replyText(i, t('ex_invalid_date'));
  const stamp = Math.floor(date.getTime() / 1000);
  return replyText(i, t('ex_timestamp', { absolute: `<t:${stamp}:F>`, relative: `<t:${stamp}:R>` }));
});
add('sortear', 'utility', 'Elige una opción ganadora de una lista', [
  str('opciones', 'choices', true, 1000),
], async (i, t) => {
  const list = wordsFrom(i.options.getString('opciones'));
  if (list.length < 2) return replyText(i, t('ex_empty_choices'));
  return replyText(i, t('ex_draw_winner', { count: list.length, winner: pick(list).slice(0, 180) }));
});
add('decision', 'utility', 'Da una respuesta al azar a una pregunta de sí o no', [
  str('pregunta', 'question', true, 250),
], async (i, t) => {
  const langCode = lang(i.guildId);
  const localizedAnswers = { es: ['Sí', 'No', 'Quizás'], en: ['Yes', 'No', 'Maybe'], pt: ['Sim', 'Não', 'Talvez'] };
  return replyText(i, t('ex_decision', {
    question: i.options.getString('pregunta'),
    answer: pick(localizedAnswers[langCode] || localizedAnswers.es),
  }));
});

add('servericon', 'utility', 'Muestra el icono del servidor en grande', [], async (i, t) => {
  const url = i.guild.iconURL({ size: 1024 });
  if (!url) return replyText(i, t('ex_icon_none'));
  await i.reply({ embeds: [embed().setTitle(i.guild.name).setImage(url)] });
});
add('serverbanner', 'utility', 'Muestra el banner del servidor', [], async (i, t) => {
  const url = i.guild.bannerURL({ size: 1024 });
  if (!url) return replyText(i, t('ex_banner_none'));
  await i.reply({ embeds: [embed().setTitle(i.guild.name).setImage(url)] });
});
add('miembros', 'utility', 'Muestra cuántas personas hay en el servidor', [], async (i, t) =>
  replyText(i, t('ex_member_count', { total: numberFormat(i.guildId, i.guild.memberCount, 0) })));
add('rolinfo', 'utility', 'Muestra información de un rol', [role()], async (i, t) => {
  const selected = i.options.getRole('rol');
  const color = selected.hexColor === '#000000' ? '—' : selected.hexColor;
  return replyText(i, t('ex_role_info', {
    role: selected.name,
    id: selected.id,
    position: selected.position,
    color,
    members: selected.members.size,
  }));
});
add('canalinfo', 'utility', 'Muestra información de un canal', [channel()], async (i, t) => {
  const selected = i.options.getChannel('canal') ?? i.channel;
  const type = selected.isThread?.() ? 'ex_channel_thread'
    : selected.isVoiceBased?.() ? 'ex_channel_voice'
      : selected.isTextBased?.() ? 'ex_channel_text' : 'ex_channel_other';
  const created = selected.createdAt ? `<t:${Math.floor(selected.createdAt.getTime() / 1000)}:D>` : '—';
  return replyText(i, t('ex_channel_info', {
    channel: selected.toString(),
    type: t(type),
    id: selected.id,
    created,
  }));
});
add('emojiinfo', 'utility', 'Muestra información de un emoji personalizado del servidor', [
  str('emoji', 'emoji', true, 64),
], async (i, t) => {
  const match = i.options.getString('emoji').match(/^<(?<animated>a?):[\w~]+:(?<id>\d+)>$/);
  if (!match) return replyText(i, t('ex_emoji_bad'));
  const selected = i.guild.emojis.cache.get(match.groups.id);
  if (!selected) return replyText(i, t('ex_emoji_missing'));
  return replyText(i, t('ex_emoji_info', {
    emoji: selected.toString(),
    name: selected.name,
    id: selected.id,
    animated: selected.animated ? '✅' : '❌',
  }));
});
const NOTABLE_PERMISSIONS = [
  ['Admin', PermissionFlagsBits.Administrator],
  ['ManageGuild', PermissionFlagsBits.ManageGuild],
  ['ManageMessages', PermissionFlagsBits.ManageMessages],
  ['ManageRoles', PermissionFlagsBits.ManageRoles],
  ['BanMembers', PermissionFlagsBits.BanMembers],
  ['KickMembers', PermissionFlagsBits.KickMembers],
  ['ModerateMembers', PermissionFlagsBits.ModerateMembers],
  ['ManageChannels', PermissionFlagsBits.ManageChannels],
  ['ManageWebhooks', PermissionFlagsBits.ManageWebhooks],
  ['ManageEmojisAndStickers', PermissionFlagsBits.ManageEmojisAndStickers],
];
add('permisos', 'utility', 'Muestra los permisos destacados de una persona', [
  user('usuario', false),
], async (i, t) => {
  const selected = i.options.getUser('usuario') ?? i.user;
  const member = await i.guild.members.fetch(selected.id).catch(() => null);
  if (!member) return replyText(i, t('target_missing'));
  const permissions = NOTABLE_PERMISSIONS
    .filter(([, flag]) => member.permissions.has(flag))
    .map(([key]) => `• ${t(`ex_perm_${key.toLowerCase()}`)}`)
    .join('\n') || t('ex_permissions_none');
  return replyText(i, t('ex_permissions', { user: selected.toString(), permissions }));
});
add('invitar', 'utility', 'Genera un enlace para invitar a Nebula', [], async (i, t) => {
  const required = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageGuild,
  ];
  const permissions = new PermissionsBitField(required).bitfield.toString();
  const url = `https://discord.com/oauth2/authorize?client_id=${i.client.user.id}&scope=bot%20applications.commands&permissions=${permissions}`;
  return replyText(i, t('ex_invite', { url }));
});
add('actividad', 'utility', 'Muestra la actividad pública actual del bot', [], async (i, t) => {
  const activities = i.client.user.presence.activities.map((item) => item.name).filter(Boolean);
  if (!activities.length) return replyText(i, t('ex_activity_none'));
  return replyText(i, t('ex_activity', { activities: activities.join(' · ') }));
});
add('cuenta', 'utility', 'Muestra cuándo se creó una cuenta de Discord', [
  user('usuario', false),
], async (i, t) => {
  const selected = i.options.getUser('usuario') ?? i.user;
  const stamp = Math.floor(selected.createdTimestamp / 1000);
  return replyText(i, t('ex_account', {
    user: selected.username,
    created: `<t:${stamp}:R>`,
    date: `<t:${stamp}:D>`,
  }));
});
add('toproles', 'utility', 'Lista los roles con más miembros en caché', [], async (i, t) => {
  const roles = i.guild.roles.cache
    .filter((item) => item.id !== i.guild.id && !item.managed)
    .sort((a, b) => b.members.size - a.members.size)
    .first(8);
  const lines = roles.map((item, index) => `**${index + 1}.** ${item} — ${item.members.size}`);
  return replyText(i, t('ex_top_roles', { roles: lines.join('\n') || '—' }));
});
add('uptime', 'utility', 'Muestra cuánto tiempo lleva activo Nebula', [], async (i, t) => {
  const totalMinutes = Math.floor((i.client.uptime || 0) / 60_000);
  return replyText(i, t('ex_uptime', {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }));
});

module.exports = commands;