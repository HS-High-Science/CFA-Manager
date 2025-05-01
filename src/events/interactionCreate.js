import { Events, EmbedBuilder, Colors, MessageFlags } from 'discord.js';

export const name = Events.InteractionCreate;
export async function execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.log(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.log(error);

        await interaction.client.channels.cache.get('1258036097422852248').send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Bot encountered an error!')
                    .setDescription(`Someone ran a /${interaction.commandName} command and it errored! Pls fix!!!!!`)
                    .setColor(Colors.Red)
                    .setFields({ name: 'Error message', value: `\`\`\`js\n${error}\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ],
            allowedMentions: { parse: ["users"] },
            content: '<@597084523338924063>' // ping boris
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Error.')
            .setDescription(`An error has occured while executing this command. The developers have been notified about this issue.`)
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } else {
            return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
}
