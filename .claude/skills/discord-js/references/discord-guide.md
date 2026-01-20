# Discord.js Comprehensive Guide

## Table of Contents
- [Bot Setup & Authentication](#bot-setup--authentication)
- [Client & Intents](#client--intents)
- [Events](#events)
- [Slash Commands](#slash-commands)
- [Messages](#messages)
- [Embeds](#embeds)
- [Buttons & Components](#buttons--components)
- [Modals](#modals)
- [Roles & Permissions](#roles--permissions)
- [Channels](#channels)
- [Voice](#voice)
- [Common Patterns](#common-patterns)

## Bot Setup & Authentication

### Creating a Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Navigate to Bot section
4. Click "Add Bot"
5. Copy the token (keep it secret!)
6. Enable necessary Privileged Gateway Intents if needed

### Basic Bot Structure

```javascript
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.login('YOUR_BOT_TOKEN');
```

## Client & Intents

### Common Intents

```javascript
GatewayIntentBits.Guilds                    // Guild/server info
GatewayIntentBits.GuildMembers              // Member join/leave/update (privileged)
GatewayIntentBits.GuildMessages             // Messages in guilds
GatewayIntentBits.MessageContent            // Message content (privileged)
GatewayIntentBits.DirectMessages            // DMs
GatewayIntentBits.GuildVoiceStates          // Voice state updates
GatewayIntentBits.GuildPresences            // User presence (privileged)
GatewayIntentBits.GuildMessageReactions     // Message reactions
```

### Client Options

```javascript
const client = new Client({
    intents: [...],
    partials: [Partials.Channel, Partials.Message], // For uncached data
});
```

## Events

### Common Events

```javascript
// Bot ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Message created
client.on('messageCreate', message => {
    if (message.author.bot) return;
    console.log(`${message.author.tag}: ${message.content}`);
});

// Interaction (slash commands, buttons, etc.)
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        // Handle slash command
    }
});

// Member join
client.on('guildMemberAdd', member => {
    console.log(`${member.user.tag} joined ${member.guild.name}`);
});

// Member leave
client.on('guildMemberRemove', member => {
    console.log(`${member.user.tag} left ${member.guild.name}`);
});

// Message delete
client.on('messageDelete', message => {
    console.log(`Message deleted: ${message.content}`);
});

// Guild create (bot joins server)
client.on('guildCreate', guild => {
    console.log(`Joined new guild: ${guild.name}`);
});
```

## Slash Commands

### Creating a Slash Command

```javascript
const { SlashCommandBuilder } = require('discord.js');

const command = new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Greets the user');

// With options
const commandWithOptions = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Bot repeats your message')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('Message to repeat')
            .setRequired(true)
    )
    .addUserOption(option =>
        option.setName('user')
            .setDescription('User to mention')
            .setRequired(false)
    );
```

### Command Option Types

```javascript
.addStringOption()      // Text input
.addIntegerOption()     // Whole numbers
.addNumberOption()      // Decimal numbers
.addBooleanOption()     // True/false
.addUserOption()        // User mention
.addChannelOption()     // Channel mention
.addRoleOption()        // Role mention
.addMentionableOption() // User or role
.addAttachmentOption()  // File upload
```

### Handling Command Interactions

```javascript
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'hello') {
        await interaction.reply('Hello!');
    }

    if (interaction.commandName === 'say') {
        const message = interaction.options.getString('message');
        const user = interaction.options.getUser('user');

        await interaction.reply(`${user ? `${user}, ` : ''}${message}`);
    }
});
```

### Deferred Replies (for long operations)

```javascript
await interaction.deferReply(); // Shows "Bot is thinking..."
await interaction.deferReply({ ephemeral: true }); // Only visible to user

// Later...
await interaction.editReply('Done!');
```

### Ephemeral Responses

```javascript
await interaction.reply({ content: 'Only you can see this!', ephemeral: true });
```

## Messages

### Sending Messages

```javascript
// Send to channel
channel.send('Hello!');

// Send with embed
channel.send({ embeds: [embed] });

// Send with components
channel.send({
    content: 'Pick an option:',
    components: [row]
});

// Reply to message
message.reply('I am replying to you!');

// DM a user
user.send('Direct message!');
```

### Editing Messages

```javascript
const msg = await channel.send('Original message');
await msg.edit('Updated message');
```

### Deleting Messages

```javascript
message.delete();

// Delete after delay (milliseconds)
setTimeout(() => message.delete(), 5000);
```

### Fetching Messages

```javascript
// Fetch single message
const fetchedMsg = await channel.messages.fetch('messageId');

// Fetch multiple messages
const messages = await channel.messages.fetch({ limit: 10 });
```

## Embeds

### Creating Embeds

```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Embed Title')
    .setURL('https://example.com')
    .setAuthor({
        name: 'Author Name',
        iconURL: 'https://i.imgur.com/example.png',
        url: 'https://example.com'
    })
    .setDescription('This is the embed description')
    .setThumbnail('https://i.imgur.com/thumbnail.png')
    .addFields(
        { name: 'Field 1', value: 'Value 1' },
        { name: 'Field 2', value: 'Value 2', inline: true },
        { name: 'Field 3', value: 'Value 3', inline: true }
    )
    .setImage('https://i.imgur.com/image.png')
    .setTimestamp()
    .setFooter({
        text: 'Footer text',
        iconURL: 'https://i.imgur.com/footer.png'
    });

channel.send({ embeds: [embed] });
```

### Embed Color Options

```javascript
.setColor(0x0099FF)           // Hex
.setColor('#0099FF')          // Hex string
.setColor('Blue')             // Color name
.setColor([0, 153, 255])      // RGB array
```

## Buttons & Components

### Creating Buttons

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('primary')
            .setLabel('Primary')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('success')
            .setLabel('Success')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setLabel('Link')
            .setURL('https://example.com')
            .setStyle(ButtonStyle.Link)
    );

await interaction.reply({
    content: 'Choose an option:',
    components: [row]
});
```

### Button Styles

```javascript
ButtonStyle.Primary    // Blue
ButtonStyle.Secondary  // Gray
ButtonStyle.Success    // Green
ButtonStyle.Danger     // Red
ButtonStyle.Link       // Link button (requires URL)
```

### Handling Button Interactions

```javascript
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'primary') {
        await interaction.reply('You clicked Primary!');
    }
});
```

### Select Menus

```javascript
const { StringSelectMenuBuilder } = require('discord.js');

const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select')
    .setPlaceholder('Choose an option')
    .addOptions([
        {
            label: 'Option 1',
            description: 'Description for option 1',
            value: 'option1',
        },
        {
            label: 'Option 2',
            description: 'Description for option 2',
            value: 'option2',
        },
    ]);

const row = new ActionRowBuilder().addComponents(selectMenu);

await interaction.reply({ components: [row] });
```

### Handling Select Menu Interactions

```javascript
if (interaction.isStringSelectMenu()) {
    const selected = interaction.values[0];
    await interaction.reply(`You selected: ${selected}`);
}
```

## Modals

### Creating Modals

```javascript
const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const modal = new ModalBuilder()
    .setCustomId('myModal')
    .setTitle('My Modal');

const nameInput = new TextInputBuilder()
    .setCustomId('nameInput')
    .setLabel('What is your name?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

const feedbackInput = new TextInputBuilder()
    .setCustomId('feedbackInput')
    .setLabel('Your feedback')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

const firstRow = new ActionRowBuilder().addComponents(nameInput);
const secondRow = new ActionRowBuilder().addComponents(feedbackInput);

modal.addComponents(firstRow, secondRow);

await interaction.showModal(modal);
```

### Handling Modal Submissions

```javascript
if (interaction.isModalSubmit()) {
    if (interaction.customId === 'myModal') {
        const name = interaction.fields.getTextInputValue('nameInput');
        const feedback = interaction.fields.getTextInputValue('feedbackInput');

        await interaction.reply(`Thanks ${name}! Feedback: ${feedback}`);
    }
}
```

## Roles & Permissions

### Checking Permissions

```javascript
if (member.permissions.has('Administrator')) {
    // User is admin
}

if (member.permissions.has(['ManageMessages', 'KickMembers'])) {
    // User has both permissions
}
```

### Adding/Removing Roles

```javascript
// Add role
await member.roles.add(roleId);
await member.roles.add(role);

// Remove role
await member.roles.remove(roleId);

// Set roles (replace all)
await member.roles.set([roleId1, roleId2]);
```

### Creating Roles

```javascript
const role = await guild.roles.create({
    name: 'New Role',
    color: 'Blue',
    permissions: ['SendMessages', 'ViewChannel'],
    reason: 'Created by bot'
});
```

### Common Permission Flags

```javascript
'Administrator'
'ManageGuild'
'ManageRoles'
'ManageChannels'
'KickMembers'
'BanMembers'
'ManageMessages'
'SendMessages'
'EmbedLinks'
'AttachFiles'
'MentionEveryone'
'ViewChannel'
```

## Channels

### Creating Channels

```javascript
// Text channel
await guild.channels.create({
    name: 'new-channel',
    type: ChannelType.GuildText,
    topic: 'Channel topic',
    parent: categoryId, // Optional category
});

// Voice channel
await guild.channels.create({
    name: 'Voice Channel',
    type: ChannelType.GuildVoice,
});

// Category
await guild.channels.create({
    name: 'Category',
    type: ChannelType.GuildCategory,
});
```

### Deleting Channels

```javascript
await channel.delete('Reason for deletion');
```

### Setting Channel Permissions

```javascript
await channel.permissionOverwrites.create(user, {
    ViewChannel: true,
    SendMessages: false,
});

await channel.permissionOverwrites.create(role, {
    ViewChannel: true,
});
```

## Voice

### Joining Voice Channels

Requires `@discordjs/voice` package:

```javascript
const { joinVoiceChannel } = require('@discordjs/voice');

const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
});
```

### Leaving Voice Channels

```javascript
connection.destroy();
```

## Common Patterns

### Command Cooldowns

```javascript
const cooldowns = new Map();
const cooldownAmount = 5000; // 5 seconds

if (cooldowns.has(interaction.user.id)) {
    const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;

    if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        return interaction.reply({
            content: `Please wait ${timeLeft.toFixed(1)} seconds.`,
            ephemeral: true
        });
    }
}

cooldowns.set(interaction.user.id, Date.now());
setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);
```

### Error Handling

```javascript
try {
    await command.execute(interaction);
} catch (error) {
    console.error(error);
    await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true
    });
}
```

### Pagination

```javascript
const pages = [embed1, embed2, embed3];
let currentPage = 0;

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
    );

const message = await interaction.reply({
    embeds: [pages[currentPage]],
    components: [row],
    fetchReply: true
});

const collector = message.createMessageComponentCollector({ time: 60000 });

collector.on('collect', async i => {
    if (i.customId === 'prev') {
        currentPage = currentPage > 0 ? --currentPage : pages.length - 1;
    } else if (i.customId === 'next') {
        currentPage = currentPage + 1 < pages.length ? ++currentPage : 0;
    }

    await i.update({ embeds: [pages[currentPage]], components: [row] });
});
```

### Reaction Collectors

```javascript
const message = await channel.send('React to this message!');
await message.react('👍');
await message.react('👎');

const filter = (reaction, user) => {
    return ['👍', '👎'].includes(reaction.emoji.name) && !user.bot;
};

const collector = message.createReactionCollector({ filter, time: 60000 });

collector.on('collect', (reaction, user) => {
    console.log(`${user.tag} reacted with ${reaction.emoji.name}`);
});

collector.on('end', collected => {
    console.log(`Collected ${collected.size} reactions`);
});
```
