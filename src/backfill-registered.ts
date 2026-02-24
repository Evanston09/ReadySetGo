import 'dotenv/config';
import { ChannelType, Client, GatewayIntentBits, OverwriteType, PermissionFlagsBits } from 'discord.js';

const token = process.env.DISCORD_TOKEN as string;
const guildId = process.env.GUILD_ID as string;
const registeredRoleId = process.env.REGISTERED_ROLE_ID as string;
const internToTeamRaw = process.env.INTERN_TO_TEAM as string;

if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable');
  process.exit(1);
}

if (!guildId) {
  console.error('Missing GUILD_ID environment variable');
  process.exit(1);
}

if (!registeredRoleId) {
  console.error('Missing REGISTERED_ROLE_ID environment variable');
  process.exit(1);
}

if (!internToTeamRaw) {
  console.error('Missing INTERN_TO_TEAM environment variable');
  process.exit(1);
}

const internIds = Object.keys(JSON.parse(internToTeamRaw));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

async function run() {
  await client.login(token);

  const guild = await client.guilds.fetch(guildId);
  await guild.channels.fetch();

  const registeredRole = await guild.roles.fetch(registeredRoleId);
  if (!registeredRole) {
    console.error(`REGISTERED_ROLE_ID not found: ${registeredRoleId}`);
    process.exit(1);
  }

  await guild.members.fetch();

  const internCategoryIds = new Set<string>();
  for (const internId of internIds) {
    const category = guild.channels.cache.find(
      ch => ch.type === ChannelType.GuildCategory
        && 'permissionOverwrites' in ch
        && ch.permissionOverwrites.cache.some(
          ow => ow.type === OverwriteType.Member
            && ow.id === internId
            && ow.allow.has(PermissionFlagsBits.ManageChannels)
        )
    );
    if (category) internCategoryIds.add(category.id);
  }

  const channels = guild.channels.cache.filter(
    (channel) => channel.parentId !== null && internCategoryIds.has(channel.parentId) && channel.type === ChannelType.GuildText
  );

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of guild.members.cache.values()) {
    if (member.user.bot) continue;
    if (member.roles.cache.has(registeredRole.id)) {
      skipped += 1;
      continue;
    }

    let canView = false;
    for (const channel of channels.values()) {
      if (!('permissionOverwrites' in channel)) continue;
      if (channel.permissionOverwrites.cache.some(
        (overwrite) => overwrite.type === OverwriteType.Member && overwrite.id === member.id && overwrite.allow.has(PermissionFlagsBits.ViewChannel)
      )) {
        canView = true;
        break;
      }
    }

    if (!canView) {
      skipped += 1;
      continue;
    }

    try {
      await member.roles.add(registeredRole, 'Backfill registered role from team category access');
      added += 1;
    } catch (error) {
      errors += 1;
      console.error(`Failed to add role for ${member.user.tag} (${member.id})`, error);
    }
  }

  console.log(`Backfill complete. Added: ${added}, Skipped: ${skipped}, Errors: ${errors}`);
  await client.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
