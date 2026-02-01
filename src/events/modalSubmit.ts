import { ChannelType, Events, MessageFlags, PermissionFlagsBits } from 'discord.js';
import type {Interaction, CacheType, TextChannel} from 'discord.js'
import { getSignupDetails } from '../airtable.js';
import 'dotenv/config'

// Assertations needed because it executes in a diff scope where the type narrowing dosent apply
const teamCategoryId = process.env.TEAM_CATEGORY_ID as string;
if (!teamCategoryId) {
    console.error('Missing TEAM_CATEGORY_ID environment variable');
    process.exit(1);
}

const leadInternRoleId = process.env.LEAD_INTERN_ROLE_ID as string;
if (!leadInternRoleId) {
    console.error('Missing LEAD_INTERN_ROLE_ID environment variable');
    process.exit(1);
}

const contactUserId = process.env.CONTACT_USER_ID;
if (!contactUserId) {
    console.error('Missing CONTACT_USER_ID environment variable');
    process.exit(1);
}

export const name = Events.InteractionCreate
export async function execute(interaction: Interaction<CacheType>) {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === 'emailModal') {
        const email = interaction.fields.getTextInputValue('emailInput');
        if (!interaction.guild) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const signupDetails = await getSignupDetails(email)
        if (!signupDetails) {
            await interaction.editReply({ content: `This email does not seem to be associated with any known Ready, Set, App! teams :cry:\nIf you need help, please DM <@${contactUserId}>` });
            return;
        }

        // Sanitize the team name for channel naming
        const channelName = signupDetails.team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '')

        const member = await interaction.guild.members.fetch(interaction.user.id)
        // Must cache the intern
        await interaction.guild.members.fetch(signupDetails.internDiscordId)

        await member.setNickname(`${signupDetails.fname}`)

        let channel = interaction.guild.channels.cache.find(
            ch => ch.name === channelName && ch.type === ChannelType.GuildText
        )

        if (channel) {
            if (channel.type !== ChannelType.GuildText) return;

            await channel.permissionOverwrites.create(interaction.user.id, {
                ViewChannel: true,
                SendMessages: true,
            })
        } else {
            channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: teamCategoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    // Add the bot itself
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages],
                    },
                    // Lead interns can view and send
                    {
                        id: leadInternRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: signupDetails.internDiscordId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                    },
                ],
            })
        }

        await interaction.editReply({ content: `You've been added to <#${channel.id}>!` })
	}
}
