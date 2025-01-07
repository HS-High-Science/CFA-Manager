# CFA Manager
CFA Manager is a Discord utility bot created by [Astro](https://github.com/AstroHWeston). CFA Manager was created to serve the [Chaos Forces Alliance](https://www.roblox.com/communities/35039433/CFA-Chaos-Forces-Alliance) ROBLOX group. It features rich features such as event announcements (Events such as raids and trainings) and a custom disciplinary system!

> [!IMPORTANT]
> Most of CFA Manager's **current** code has been created using the Discord.js guide. As such, the code may not be optimal as the project was never taken seriously, so apologies for that!

## Installation
To get started with CFA Manager, please follow these simple steps:

- Clone the [CFA Manager repository](https://github.com/AstroHWeston/CFA-Manager.git) (Example: `git clone https://github.com/AstroHWeston/CFA-Manager.git`).
- Install relevant NPM dependencies using a package manager of your choice (Example: `npm install`, `pnpm install`, `yarn install`).
- Copy the `.env.example` file to `.env` (Example: `cp .env.example .env`).

> [!NOTE]
> CFA Manager has only ever been tested on Win64 and Linux (Distros: Ubuntu, Kali linux). We make no guarantees that it will work in anything other than the two mentioned systems.

## Environment configuration
> [!IMPORTANT]
> The following environment variables **must** be set in order for the bot to be able to boot!

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `DB_CLIENT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

> [!CAUTION]
> Be aware! CFA Manager has only been tested on the MySQL and MariaDB DBMS'! We do not take responsibilities for any data corruption should other DBMS' be used.

# Contributing
Please read through our [contribution guidelines](./CODE_OF_CONDUCT.md) before starting to contribute. We welcome contributions of all kinds, not just code!

# Help
If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please join our [Discord server](https://discord.gg/C9cPJGz37N)!