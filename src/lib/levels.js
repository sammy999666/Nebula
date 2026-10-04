// Sistema de niveles (estilo MEE6): XP necesaria para pasar del nivel n al n+1.
const xpForLevel = (level) => 5 * level ** 2 + 50 * level + 100;

function progress(totalXp) {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, current: remaining, needed: xpForLevel(level) };
}

function bar(current, needed, size = 12) {
  const filled = Math.round((current / needed) * size);
  return '▰'.repeat(filled) + '▱'.repeat(size - filled);
}

module.exports = { xpForLevel, progress, bar };
