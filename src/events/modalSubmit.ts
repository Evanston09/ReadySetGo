import { Events } from 'discord.js';
import type {Interaction, CacheType} from 'discord.js'

export const name = Events.InteractionCreate
export async function execute(interaction: Interaction<CacheType>) {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === 'emailModal') {
		await interaction.reply({ content: 'Your submission was received successfully! You will be moved to the appropriate channel soon.' });
		const email = interaction.fields.getTextInputValue('emailInput');

        // Add logic here
		console.log({email});
	}
}
