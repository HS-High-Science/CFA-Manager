const { Events, EmbedBuilder, Colors} = require('discord.js');
const {setTimeout: wait} = require("node:timers/promises");

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

            const replied = interaction.replied
            const replyData = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('There was an error while executing this command!')
                        .setColor(Colors.Red)
                        .setFooter({
                            text: `High Science Private Security.`,
                            iconURL: "https://cdn.discordapp.com/attachments/1061002191109885972/1200897516015714494/67a27d98794c35ce06462b4eceddffa9.png?ex=65c7d9f7&is=65b564f7&hm=a4884af8560db7b5b9c4124a9fc64ca70f7f1eb66962060b42f91289c1e1264a&"
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
