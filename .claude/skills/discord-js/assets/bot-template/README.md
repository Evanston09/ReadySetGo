# Discord Bot Template

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Fill in your Discord bot credentials in `.env`:
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
   - `CLIENT_ID`: Your application's client ID
   - `GUILD_ID`: (Optional) Your test server ID for faster command deployment

4. Deploy slash commands:
   ```bash
   npm run deploy
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Project Structure

```
.
├── commands/           # Slash command files
│   └── ping.js        # Example ping command
├── events/            # Event handler files
│   ├── ready.js       # Bot ready event
│   └── interactionCreate.js  # Command interaction handler
├── index.js           # Main bot file
├── deploy-commands.js # Command deployment script
├── package.json       # Dependencies
└── .env               # Environment variables (create this)
```

## Adding Commands

Create a new file in `commands/` directory:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    async execute(interaction) {
        await interaction.reply('Response!');
    },
};
```

Then run `npm run deploy` to register the command.

## Adding Events

Create a new file in `events/` directory:

```javascript
module.exports = {
    name: 'eventName',
    once: false, // Set to true if event should only run once
    execute(...args) {
        // Event handler code
    },
};
```

The bot will automatically load it on next restart.
