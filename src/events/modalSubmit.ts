import { ChannelType, Events, MessageFlags, OverwriteType, PermissionFlagsBits } from 'discord.js';
import type {Interaction, CacheType, TextChannel, Guild} from 'discord.js'
import { getSignupDetails } from '../airtable.js';
import { appendRegistrationLog } from '../logging.js';
import 'dotenv/config'

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

const registeredRoleId = process.env.REGISTERED_ROLE_ID as string;
if (!registeredRoleId) {
    console.error('Missing REGISTERED_ROLE_ID environment variable');
    process.exit(1);
}

const internCategoryCache = new Map<string, string>();

async function getOrCreateInternCategory(
    guild: Guild,
    internDiscordId: string,
    botId: string,
    leadInternRoleId: string,
): Promise<string> {
    const cached = internCategoryCache.get(internDiscordId);
    if (cached) {
        // Verify the cached category still exists
        const existing = guild.channels.cache.get(cached);
        if (existing) return cached;
        internCategoryCache.delete(internDiscordId);
    }

    const existingCategory = guild.channels.cache.find(
        ch => ch.type === ChannelType.GuildCategory
            && 'permissionOverwrites' in ch
            && ch.permissionOverwrites.cache.some(
                ow => ow.type === OverwriteType.Member
                    && ow.id === internDiscordId
                    && ow.allow.has(PermissionFlagsBits.ManageChannels)
            )
    );

    if (existingCategory) {
        internCategoryCache.set(internDiscordId, existingCategory.id);
        return existingCategory.id;
    }

    const internMember = await guild.members.fetch(internDiscordId);
    const displayName = internMember.displayName;

    const category = await guild.channels.create({
        name: `${displayName}'s Teams`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: botId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages],
            },
            {
                id: leadInternRoleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
            },
            {
                id: internDiscordId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
            },
        ],
    });

    internCategoryCache.set(internDiscordId, category.id);
    return category.id;
}

export const name = Events.InteractionCreate
export async function execute(interaction: Interaction<CacheType>) {
	if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'emailModal') {
        const email = interaction.fields.getTextInputValue('emailInput');
        if (!interaction.guild) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let signupDetails;
        try {
            signupDetails = await getSignupDetails(email)
        } catch (error) {
            console.error('Failed to lookup signup details', error);
            await appendRegistrationLog({
                timestamp: new Date().toISOString(),
                status: 'error',
                discordUserId: interaction.user.id,
                email,
            });
            await interaction.editReply({ content: 'Something went wrong while verifying your email. Please try again later.' });
            return;
        }
        if (!signupDetails) {
            await appendRegistrationLog({
                timestamp: new Date().toISOString(),
                status: 'not_found',
                discordUserId: interaction.user.id,
                email,
            });
            await interaction.editReply({ content: `This email does not seem to be associated with any known Ready, Set, App! teams :cry:\nIf you need help, please DM <@${contactUserId}>` });
            return;
        }

        // Sanitize the team name for channel naming
        const channelName = signupDetails.team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '')

        const member = await interaction.guild.members.fetch(interaction.user.id)
        // Must cache the intern
        await interaction.guild.members.fetch(signupDetails.internDiscordId)

        const registeredRole = await interaction.guild.roles.fetch(registeredRoleId)
        if (!registeredRole) {
            await interaction.editReply({ content: 'Registered role is missing. Please contact an admin.' })
            return
        }

        await member.setNickname(`${signupDetails.fname}`)
        await member.roles.add(registeredRole, 'Registered after email verification')

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
            const categoryId = await getOrCreateInternCategory(
                interaction.guild,
                signupDetails.internDiscordId,
                interaction.client.user.id,
                leadInternRoleId,
            );

            channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryId,
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

        await appendRegistrationLog({
            timestamp: new Date().toISOString(),
            status: 'success',
            discordUserId: interaction.user.id,
            email,
            teamName: signupDetails.team,
            internDiscordId: signupDetails.internDiscordId,
        });

        await interaction.editReply({ content: `You've been added to <#${channel.id}>!` })
    }
}
