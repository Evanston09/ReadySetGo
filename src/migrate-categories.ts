import 'dotenv/config';
import { ChannelType, Client, GatewayIntentBits, OverwriteType, PermissionFlagsBits } from 'discord.js';
import type { Guild } from 'discord.js';

const token = process.env.DISCORD_TOKEN as string;
const guildId = process.env.GUILD_ID as string;
const oldCategoryId = process.env.TEAM_CATEGORY_ID as string;
const leadInternRoleId = process.env.LEAD_INTERN_ROLE_ID as string;
const internToTeamRaw = process.env.INTERN_TO_TEAM as string;

if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable');
  process.exit(1);
}

if (!guildId) {
  console.error('Missing GUILD_ID environment variable');
  process.exit(1);
}

if (!oldCategoryId) {
  console.error('Missing TEAM_CATEGORY_ID environment variable (the old category to migrate from)');
  process.exit(1);
}

if (!leadInternRoleId) {
  console.error('Missing LEAD_INTERN_ROLE_ID environment variable');
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

const internCategoryCache = new Map<string, string>();

async function getOrCreateInternCategory(
  guild: Guild,
  internDiscordId: string,
): Promise<string> {
  const cached = internCategoryCache.get(internDiscordId);
  if (cached) return cached;

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
        id: client.user!.id,
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

  console.log(`Created category "${displayName}'s Teams" for intern ${internDiscordId}`);
  internCategoryCache.set(internDiscordId, category.id);
  return category.id;
}

async function run() {
  await client.login(token);

  const guild = await client.guilds.fetch(guildId);
  await guild.channels.fetch();
  await guild.members.fetch();

  const oldCategory = guild.channels.cache.get(oldCategoryId);
  if (!oldCategory || oldCategory.type !== ChannelType.GuildCategory) {
    console.error('TEAM_CATEGORY_ID does not reference a valid category');
    process.exit(1);
  }

  const channels = guild.channels.cache.filter(
    ch => ch.parentId === oldCategoryId && ch.type === ChannelType.GuildText
  );

  console.log(`Found ${channels.size} channels in old category to migrate`);

  let moved = 0;
  let skipped = 0;
  let errors = 0;

  for (const channel of channels.values()) {
    if (!('permissionOverwrites' in channel)) {
      skipped += 1;
      continue;
    }

    let ownerInternId: string | null = null;
    for (const internId of internIds) {
      if (channel.permissionOverwrites.cache.some(
        ow => ow.type === OverwriteType.Member
          && ow.id === internId
          && ow.allow.has(PermissionFlagsBits.ManageChannels)
      )) {
        ownerInternId = internId;
        break;
      }
    }

    if (!ownerInternId) {
      console.warn(`Channel #${channel.name} has no matching intern owner, skipping`);
      skipped += 1;
      continue;
    }

    try {
      const newCategoryId = await getOrCreateInternCategory(guild, ownerInternId);
      await channel.setParent(newCategoryId, { lockPermissions: false });
      console.log(`Moved #${channel.name} → intern ${ownerInternId}'s category`);
      moved += 1;
    } catch (error) {
      errors += 1;
      console.error(`Failed to move #${channel.name}:`, error);
    }
  }

  console.log(`\nMigration complete. Moved: ${moved}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log('You can now remove TEAM_CATEGORY_ID from your .env and delete the old category if empty.');
  await client.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
