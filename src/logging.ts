import fs from 'node:fs/promises';
import path from 'node:path';

type RegistrationLogEntry = {
    timestamp: string;
    status: 'success' | 'not_found' | 'error';
    discordUserId: string;
    email: string;
    teamName?: string;
    internDiscordId?: string;
};

const defaultLogPath = '/data/registrations.jsonl';
const logPath = process.env.REGISTRATION_LOG_PATH?.trim() || defaultLogPath;

export async function appendRegistrationLog(entry: RegistrationLogEntry) {
    const targetPath = logPath;
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    const row = JSON.stringify(entry);
    await fs.appendFile(targetPath, `${row}\n`, { encoding: 'utf8' });
}
