# 💜 Nebula Bot

Bot de Discord moderno hecho con **discord.js v14** (slash commands). Incluye moderación, **AutoMod propio**, **AutoMod nativo de Discord**, **3 idiomas** (ES / EN / PT), niveles, bienvenida, logs y un comando **/ship** con imagen generada.

## ✨ Características

| Módulo | Comandos |
|---|---|
| 🌐 General | `/help` `/ping` `/userinfo` `/avatar` `/serverinfo` `/botinfo` |
| 🎉 Diversión | `/ship` `/8ball` `/moneda` `/dado` `/encuesta` `/broma` `/dato` `/consejo` `/frase` `/reto` `/verdad` `/dilema` `/oraculo` `/fortuna` `/suerte` `/numerosecreto` `/elige` `/rps` `/trivia` `/adivina` `/acertijo` `/pregunta` `/improvisa` |
| 🤝 Social | `/abrazo` `/beso` `/palmada` `/saludo` `/sonreir` `/guino` `/reir` `/bailar` `/chocar` `/apoyar` `/consolar` `/celebrar` `/elogio` `/shipamistad` |
| ✍️ Texto | `/mayus` `/minus` `/invertir` `/vaporwave` `/mock` `/aplausos` `/emoji` `/spoiler` `/citaformat` `/contar` `/repetir` `/lista` `/sinacentos` `/codigo` `/morse` `/rot13` `/palabra` `/hexcolor` |
| 🧰 Utilidades | `/numero` `/porcentaje` `/convertir` `/temp` `/fecha` `/hora` `/timestamp` `/sortear` `/decision` `/servericon` `/serverbanner` `/miembros` `/rolinfo` `/canalinfo` `/emojiinfo` `/permisos` `/invitar` `/actividad` `/cuenta` `/toproles` `/uptime` |
| 🔨 Moderación | `/ban` `/kick` `/timeout` `/untimeout` `/clear` `/warn` `/warns` `/clearwarns` `/slowmode` `/lock` `/unlock` |
| 🛡️ AutoMod propio | `/automod estado` · `regla` · `accion` · `palabras` |
| 🛡️ AutoMod de Discord | `/automod-discord palabras` · `spam` · `menciones` · `presets` · `listar` · `eliminar` |
| ⚙️ Configuración | `/idioma ver\|establecer` · `/setup bienvenida\|logs\|autorol\|desactivar` |
| 📈 Niveles | `/rank` `/top` `/niveles` |

Nebula incluye **100 comandos principales** en total. Las respuestas de los 71 comandos añadidos están traducidas al español, inglés y portugués; `/idioma establecer` selecciona el idioma para cada servidor.

- **/ship**: mide el amor entre dos usuarios y genera una imagen con sus avatares sobre `assets/ship.jpg`. El porcentaje es estable durante el día para la misma pareja.
- **AutoMod propio**: anti-enlaces, anti-invitaciones, anti-spam, anti-mayúsculas, anti-menciones masivas y lista de palabras prohibidas. Acción: borrar o borrar + aislar 5 min. Los moderadores (Gestionar mensajes) quedan exentos.
- **AutoMod de Discord**: crea las reglas nativas del servidor (las que se ven en *Ajustes del servidor → AutoMod*), con alertas a un canal y aislamiento opcional.
- **Advertencias**: 3 `/warn` = aislamiento automático de 1 hora.
- **Idiomas**: `/idioma establecer` cambia el idioma del bot en ese servidor. Los textos base están en `src/lib/locales.js` y los de los comandos extra en `src/lib/extraLocales.js`.
- **Logs**: bans, kicks, timeouts, warns, AutoMod, entradas/salidas y mensajes borrados en el canal que elijas con `/setup logs`.

## 📁 Estructura

```
nebula-bot/
├─ assets/            # ship.jpg (fondo del /ship) y font.ttf
├─ src/
│  ├─ commands/       # comandos agrupados por categoría, incluidos los 71 extra
│  ├─ events/         # ready, interactionCreate, messageCreate, miembros, logs
│  ├─ lib/            # db, i18n, locales, automod, niveles, imagen del ship, utilidades
│  ├─ index.js        # arranque
│  └─ deploy.js       # registro manual de comandos
├─ .env.example
└─ package.json
```

## 🚀 Instalación

Requiere **Node.js 20 o superior**.

1. Crea la aplicación en el [Discord Developer Portal](https://discord.com/developers/applications) → *Bot* → copia el **token**.
2. En la pestaña **Bot**, activa los **Privileged Gateway Intents**: **Server Members Intent** y **Message Content Intent**.
3. Invita al bot desde *OAuth2 → URL Generator* con los scopes `bot` y `applications.commands`, y el permiso **Administrator** (o, como mínimo: Gestionar mensajes, Gestionar roles, Gestionar canales, Expulsar, Banear, Moderar miembros, Gestionar servidor, Enviar mensajes, Insertar enlaces, Adjuntar archivos, Añadir reacciones).
4. Instala y configura:

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# edita .env con DISCORD_TOKEN y CLIENT_ID (y GUILD_ID para pruebas)
npm start
```

Los comandos se registran solos al iniciar (`AUTO_DEPLOY=true`). También puedes usar `npm run deploy`.
Con `GUILD_ID` aparecen al instante en ese servidor; sin él se registran globalmente (puede tardar un poco).

> 💡 Para que el bot pueda moderar, su rol debe estar **por encima** de los roles de los usuarios que modera.

## 🗄️ Datos

La configuración se guarda en `data/db.json` (se crea sola, está en `.gitignore`). Si lo despliegas en un hosting, conserva esa carpeta entre reinicios.

## 🎨 Personalizar el /ship

Reemplaza `assets/ship.jpg` por tu imagen (recomendado 5:2, p. ej. 1600×640). Los avatares se dibujan a los lados y el corazón con el porcentaje en el centro; ajusta posiciones en `src/lib/shipImage.js`.

## ➕ Añadir comandos o idiomas

- **Comando**: agrega un objeto `{ category, data, execute }` al array de un archivo de `src/commands/` (o crea uno nuevo).
- **Idioma**: copia un bloque de `src/lib/locales.js`, tradúcelo y añade el código en `LANGS` de `src/lib/i18n.js`.

## 📜 Licencia

MIT. La fuente `assets/font.ttf` es DejaVu Sans Bold (licencia libre de Bitstream Vera / DejaVu).
