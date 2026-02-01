import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config'

const contactUserId = process.env.CONTACT_USER_ID;
if (!contactUserId) {
    console.error('Missing CONTACT_USER_ID environment variable');
    process.exit(1);
}

export const data = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Post the welcome embed in this channel')

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.channel) {
        return
    }

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Welcome to Ready, Set, App!')
        .setDescription(
            'We\'re excited to have you here! To get connected with your team, follow the steps below.'
        )
        .addFields(
            {
                name: 'How to Get Started',
                value:
                    '1. Head over to the **#start-here** channel\n' +
                    '2. Use the `/register` command\n' +
                    '3. Enter the email you signed up with\n' +
                    '4. You\'ll be automatically added to your team\'s channel with your intern',
            },
            {
                name: 'Need Help?',
                value: `If your email isn't recognized or you run into issues, reach out to <@${contactUserId}>.`,
            },
            {
                name: 'Source Code',
                value: '[GitHub](https://github.com/Evanston09/ReadySetGo)',
            },
        )
        .setFooter({ text: 'Ready, Set, App!' })

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Welcome embed posted!', flags: MessageFlags.Ephemeral })
}
