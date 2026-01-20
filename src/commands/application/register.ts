import { TextInputBuilder, TextInputStyle, ModalBuilder, LabelBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
            .setName('register')
            .setDescription('Register your team affiliation')

export async function execute(interaction: ChatInputCommandInteraction) {
		const modal = new ModalBuilder().setCustomId('emailModal').setTitle('Register with Team');

    	const emailInput = new TextInputBuilder()
			.setCustomId('emailInput')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('john.doe@example.com');

		const emailLabel = new LabelBuilder()
			.setLabel('Email Address')
			.setDescription('Make sure you use the same one with which you registered with your team.')
    		.setTextInputComponent(emailInput);

		// Add label to the modal
		modal.addLabelComponents(emailLabel);

    	await interaction.showModal(modal);
}
