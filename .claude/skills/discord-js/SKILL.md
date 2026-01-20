---
name: discord-js
description: Build Discord bots from scratch using discord.js v14+. Covers bot setup, slash commands, events, message handling, embeds, buttons, modals, roles, permissions, channels, and more. Use when creating new Discord bots, adding features to existing bots, implementing slash commands, working with Discord API interactions, or building Discord automation. Includes comprehensive examples for moderation, utility, and fun commands.
---

# Discord.js Bot Builder

## Overview

Build full-featured Discord bots using discord.js v14+. This skill provides a complete bot template, comprehensive API patterns, and extensive command examples for creating bots from scratch.

## Quick Start

### Create a New Bot Project

Use the bot template from `assets/bot-template/` to start a new bot:

1. Copy the entire `bot-template/` directory to your project location
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Add your bot token, client ID, and guild ID to `.env`
5. Deploy commands: `npm run deploy`
6. Start the bot: `npm start`

The template includes:
- Command handler system (auto-loads from `commands/` directory)
- Event handler system (auto-loads from `events/` directory)
- Example ping command
- Ready and interaction events
- Command deployment script
- Proper project structure

## Bot Template Structure

```
bot-template/
├── commands/           # Slash command files
│   └── ping.js        # Example command
├── events/            # Event handlers
│   ├── ready.js       # Bot ready event
│   └── interactionCreate.js  # Command handler
├── index.js           # Main bot file
├── deploy-commands.js # Command deployment
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # Setup instructions
```

## Adding Commands

Create new command files in `commands/` directory:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input description')
                .setRequired(true)
        ),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        await interaction.reply(`You said: ${input}`);
    },
};
```

After creating a command, run `npm run deploy` to register it with Discord.

## Adding Events

Create new event files in `events/` directory:

```javascript
module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message) {
        if (message.author.bot) return;
        console.log(`${message.author.tag}: ${message.content}`);
    },
};
```

The bot automatically loads all events on startup.

## Common Patterns

### Slash Command with Options

```javascript
.addStringOption(option => ...)      // Text input
.addIntegerOption(option => ...)     // Whole numbers
.addUserOption(option => ...)        // User mention
.addChannelOption(option => ...)     // Channel mention
.addRoleOption(option => ...)        // Role mention
.addBooleanOption(option => ...)     // True/false
```

### Reply Types

```javascript
// Normal reply
await interaction.reply('Message');

// Ephemeral (only user sees)
await interaction.reply({ content: 'Secret!', ephemeral: true });

// Deferred reply (for long operations)
await interaction.deferReply();
// ... do work ...
await interaction.editReply('Done!');
```

### Embeds

```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Title')
    .setDescription('Description')
    .addFields(
        { name: 'Field 1', value: 'Value 1' },
        { name: 'Field 2', value: 'Value 2', inline: true }
    )
    .setTimestamp();

await interaction.reply({ embeds: [embed] });
```

### Buttons

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('button_id')
            .setLabel('Click Me')
            .setStyle(ButtonStyle.Primary)
    );

await interaction.reply({ content: 'Choose:', components: [row] });
```

Handle button clicks:

```javascript
// In interactionCreate event
if (interaction.isButton()) {
    if (interaction.customId === 'button_id') {
        await interaction.reply('Button clicked!');
    }
}
```

### Permission Checks

```javascript
if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: 'No permission!', ephemeral: true });
}
```

## References

### discord-guide.md

Comprehensive API reference covering:
- Bot setup and authentication
- Client configuration and intents
- All common events
- Slash commands in detail
- Messages, embeds, buttons, modals
- Roles, permissions, channels
- Voice connections
- Advanced patterns (cooldowns, pagination, collectors)

Read when implementing specific features, working with Discord API components, or troubleshooting.

### command-examples.md

Extensive collection of ready-to-use command examples:
- **Basic**: hello, echo, userinfo
- **Moderation**: kick, ban, clear messages, timeout
- **Utility**: poll, reminder, avatar
- **Fun**: 8ball, dice roll
- **Information**: serverinfo, help
- **Advanced**: confirmation dialogs, multi-step commands with modals

Copy and adapt examples for quick command implementation.

## Getting Bot Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Navigate to Bot section → Add Bot
4. Copy bot token (DISCORD_TOKEN)
5. Get application ID from General Information (CLIENT_ID)
6. Enable required Privileged Gateway Intents if needed:
   - MESSAGE CONTENT INTENT (for reading message content)
   - SERVER MEMBERS INTENT (for member events)
   - PRESENCE INTENT (for user presence)

## Inviting Bot to Server

Generate invite URL:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` and adjust permissions value as needed.
