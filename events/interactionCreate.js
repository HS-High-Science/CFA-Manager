const { Events, EmbedBuilder, Colors } = require('discord.js');
const { setTimeout: wait } = require("node:timers/promises");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
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

            await interaction.client.channels.cache.get('1235938304990380113').send({
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
            })

            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Error.')
                .setDescription(`An error has occured while executing this command.\nPing StolarchukBoris if the issue persists.`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};
