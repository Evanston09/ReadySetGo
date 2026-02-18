# ReadySetGo

A Discord bot for the Ready, Set, App! program that automatically assigns users to team channels based on their email registration in Airtable.

## How It Works

1. User runs `/register` in the server
2. Bot shows a modal asking for their email
3. Bot looks up the email in Airtable to find their team
4. Bot sets the user's nickname to their first name
5. Bot creates a team channel (or adds them to an existing one) with the appropriate permissions

## Setup

### Prerequisites

- Node.js
- A Discord bot application with the `bot` and `applications.commands` scopes
- Bot permissions: **Manage Channels**, **Manage Nicknames**, **Manage Roles**
- An Airtable base with team registration data

### Install

```
npm install
```

### Environment Variables

Create a `.env` file with the following:

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENTID` | Your Discord application/client ID |
| `AIRTABLE_TOKEN` | Airtable personal access token |
| `TEAM_REGIS_BASE_ID` | ID of the Airtable base containing team registrations |
| `INTERN_TO_TEAM` | JSON string mapping intern Discord user IDs to Airtable table IDs, e.g. `{"123456":"tblABC"}` |
| `TEAM_CATEGORY_ID` | ID of the Discord category to create team channels under |
| `LEAD_INTERN_ROLE_ID` | ID of the Lead Intern role (gets view access to all team channels) |
| `CONTACT_USER_ID` | Discord user ID to direct users to if their email isn't found |
| `REGISTERED_ROLE_ID` | Role ID to assign on successful registration |
| `GUILD_ID` | Discord guild ID for the backfill script |
| `REGISTRATION_LOG_PATH` | JSONL log file path (default: `/data/registrations.jsonl`) |

### Deploy Commands and Run

```
npx tsc && node dist/deploy.js
node dist/index.js
```

### Docker Logging

By default the bot appends registration logs to `/data/registrations.jsonl`. Mount a host directory to `/data` so logs persist outside the container.

Example `docker run`:

```
docker run --env-file .env -v "$(pwd)/data:/data" your-image
```

You can override the log path with `REGISTRATION_LOG_PATH`.

### Backfill Registered Role (Local Script)

Use this once to grant the Registered role to members who can view team channels under `TEAM_CATEGORY_ID`.

```
npx tsc
node dist/backfill-registered.js
```
