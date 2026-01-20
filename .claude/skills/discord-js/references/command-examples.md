# Discord.js Command Examples

## Table of Contents
- [Basic Commands](#basic-commands)
- [Moderation Commands](#moderation-commands)
- [Utility Commands](#utility-commands)
- [Fun Commands](#fun-commands)
- [Information Commands](#information-commands)
- [Advanced Patterns](#advanced-patterns)

## Basic Commands

### Simple Reply

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello'),
    async execute(interaction) {
        await interaction.reply(`Hello, ${interaction.user.username}!`);
    },
};
```

### Echo Command

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Repeats your message')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to repeat')
                .setRequired(true)
        ),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        await interaction.reply(message);
    },
};
```

### User Info

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.username}'s Info`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'ID', value: user.id },
                { name: 'Account Created', value: user.createdAt.toDateString() },
                { name: 'Joined Server', value: member.joinedAt.toDateString() },
                { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
```

## Moderation Commands

### Kick

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kick')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('KickMembers')) {
            return interaction.reply({ content: 'You need Kick Members permission!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable) {
            return interaction.reply({ content: 'Cannot kick this user!', ephemeral: true });
        }

        await member.kick(reason);
        await interaction.reply(`Kicked ${user.tag}. Reason: ${reason}`);
    },
};
```

### Ban

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('BanMembers')) {
            return interaction.reply({ content: 'You need Ban Members permission!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await interaction.guild.members.ban(user, { reason });
        await interaction.reply(`Banned ${user.tag}. Reason: ${reason}`);
    },
};
```

### Clear Messages

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({ content: 'You need Manage Messages permission!', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `Deleted ${amount} messages!`, ephemeral: true });
    },
};
```

### Timeout (Mute)

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320) // 28 days
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({ content: 'You need Moderate Members permission!', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const member = await interaction.guild.members.fetch(user.id);

        await member.timeout(duration * 60 * 1000, `Timed out by ${interaction.user.tag}`);
        await interaction.reply(`Timed out ${user.tag} for ${duration} minutes.`);
    },
};
```

## Utility Commands

### Poll

```javascript
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll question')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Options separated by commas (max 10)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',').map(o => o.trim());

        if (options.length > 10) {
            return interaction.reply({ content: 'Maximum 10 options allowed!', ephemeral: true });
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(question)
            .setDescription(options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n'))
            .setFooter({ text: `Poll by ${interaction.user.tag}` })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
```

### Reminder

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Reminder message')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Minutes until reminder')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const minutes = interaction.options.getInteger('minutes');

        await interaction.reply(`I'll remind you in ${minutes} minute(s)!`);

        setTimeout(async () => {
            await interaction.user.send(`⏰ Reminder: ${message}`);
        }, minutes * 60 * 1000);
    },
};
```

### Avatar

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get user avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to get avatar of')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    },
};
```

## Fun Commands

### 8ball

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8ball')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question')
                .setRequired(true)
        ),
    async execute(interaction) {
        const responses = [
            'Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not',
            'Ask again later', 'I don\'t know', 'Probably', 'Unlikely'
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];
        await interaction.reply(`🎱 ${answer}`);
    },
};
```

### Dice Roll

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll dice')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the die')
                .setRequired(false)
                .setMinValue(2)
        )
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)
        ),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const count = interaction.options.getInteger('count') || 1;

        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }

        const total = rolls.reduce((a, b) => a + b, 0);
        await interaction.reply(`🎲 Rolled ${count}d${sides}: ${rolls.join(', ')} (Total: ${total})`);
    },
};
```

## Information Commands

### Server Info

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),
    async execute(interaction) {
        const { guild } = interaction;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Server ID', value: guild.id },
                { name: 'Owner', value: `<@${guild.ownerId}>` },
                { name: 'Created', value: guild.createdAt.toDateString() },
                { name: 'Members', value: guild.memberCount.toString(), inline: true },
                { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
                { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
```

### Help Command

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands'),
    async execute(interaction) {
        const commands = interaction.client.commands;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Bot Commands')
            .setDescription(
                commands.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n')
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
```

## Advanced Patterns

### Command with Confirmation

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-channel')
        .setDescription('Delete current channel'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ManageChannels')) {
            return interaction.reply({ content: 'You need Manage Channels permission!', ephemeral: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({
            content: 'Are you sure you want to delete this channel?',
            components: [row],
            ephemeral: true
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            if (confirmation.customId === 'confirm') {
                await confirmation.update({ content: 'Deleting channel...', components: [] });
                await interaction.channel.delete();
            } else {
                await confirmation.update({ content: 'Cancelled', components: [] });
            }
        } catch (e) {
            await interaction.editReply({ content: 'Confirmation timed out', components: [] });
        }
    },
};
```

### Multi-step Command with Modal

```javascript
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a support ticket'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('ticketModal')
            .setTitle('Support Ticket');

        const subjectInput = new TextInputBuilder()
            .setCustomId('subject')
            .setLabel('Subject')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(subjectInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    },
};

// In your main file, handle the modal submission:
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'ticketModal') {
        const subject = interaction.fields.getTextInputValue('subject');
        const description = interaction.fields.getTextInputValue('description');

        // Create ticket channel or send to support channel
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.user.id,
                    allow: ['ViewChannel', 'SendMessages'],
                },
            ],
        });

        await ticketChannel.send(`**Subject:** ${subject}\n**Description:** ${description}`);
        await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
    }
});
```
