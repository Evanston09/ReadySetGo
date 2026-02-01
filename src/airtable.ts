import Airtable from "airtable"
import 'dotenv/config'

type InternToTeam = {
    [discordUserId: string]: string
}

type SignupDetails = {
    team: string,
    fname: string,
    internDiscordId: string
}

const airtableToken = process.env.AIRTABLE_TOKEN;
const baseId = process.env.TEAM_REGIS_BASE_ID;
const internToTeamRaw = process.env.INTERN_TO_TEAM

if (!airtableToken) {
    console.error('Missing AIRTABLE_TOKEN environment variable')
    process.exit(1)
}

if (!baseId) {
    console.error('Missing TEAM_REGIS_BASE_ID environment variable')
    process.exit(1)
}

if (!internToTeamRaw) {
    console.error('Missing INTERN_TO_TEAM environment variable')
    process.exit(1)
}
const internToTeam: InternToTeam = JSON.parse(internToTeamRaw)
if (!internToTeam || typeof internToTeam !== "object") {
    console.error('INTERN_TO_TEAM enviroment not JSON parsable')
    process.exit(1)
}

Airtable.configure({ apiKey: airtableToken })

const base = Airtable.base(baseId)

export async function getSignupDetails(targetEmail: string): Promise<SignupDetails | null> {
    for (const [internDiscordId, tableId] of Object.entries(internToTeam)) {
        const records = await base(tableId).select().all()
        for (const record of records) {
            for (let i = 1; i < 6; i++) {
                if ((record.get(`TM${i} Email`) as string)?.trim() === targetEmail.trim()) {
                    // We are hoping none of the fields are null. (Which they should be)
                    return {
                        team: (record.get("Team Name") as string).trim(),
                        fname: (record.get(`TM${i} First`) as string).trim(),
                        internDiscordId,
                    }
                }
            }
        }
    }
    return null
}
