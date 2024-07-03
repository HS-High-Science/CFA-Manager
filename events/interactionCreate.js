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

            await interaction.channels.cache.get('1235938304990380113').send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Bot encountered an error!')
                        .setDescription(`Someone ran a ${interaction.commandName} command and it errored!`)
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Error message', value: `\`\`\`js\n${error}\`\`\`` }
                        ])
                        .setFooter({
                            text: `Chaos Forces Alliance`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ],
                allowedMentions: { parse: ["users"] },
                content: '<@427832787605782549>'
            })

            const replied = interaction.replied
            const replyData = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('There was an error while executing this command!')
                        .setColor(Colors.Red)
                        .setFooter({
                            text: `Chaos Force Alliance.`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ]
            }

            if (replied) {
                return interaction.editReply(replyData);
            } else {
                return interaction.reply(replyData);
            }
        }
    },
};
