const { exec } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Pulls changes from the repository'),
    async execute(interaction) {
        await interaction.deferReply();

        const allowedIDs = ["1226408360551645254", "427832787605782549"]

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            await interaction.reply('`Pulling...`');
            
            exec(`git pull https://${process.env.GIT_USERNAME}:${process.env.GIT_TOKEN}@gitlab.astrohweston.xyz/high-science/chaos-forces-alliance/cfa-manager master`, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error}`);

                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setColor(Colors.Red)
                                    .setTitle('Pull Failed')
                                    .setDescription('The program ran into error when trying to pull')
                                    .setFields([
                                        { name: 'Error', value: `\`\`\`\n${error}\`\`\`` },
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: interaction.guild.name })
                            ]
                    })
                }

                if (stderr) {
                    console.log(`stderr: ${stderr}`);

                    await interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setColor(Colors.Yellow)
                                    .setTitle('Standard Error')
                                    .setDescription('There are some warnings or information the shell gave')
                                    .setFields([
                                        { name: 'Output', value: `\`\`\`\n${stderr}\`\`\`` },
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: interaction.guild.name })
                            ]
                    })
                }

                if (stdout.includes('Already up to date.')) {
                    console.log(`stdout: ${stdout}`);

                    return interaction.followUp({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setColor(Colors.Blue)
                                    .setTitle('Already up to date!')
                                    .setDescription("The bot has latest version of the code!")
                                    .setTimestamp()
                                    .setFooter({ text: interaction.guild.name })
                            ]
                    })
                }

                console.log(`stdout: ${stdout}`);

                return interaction.followUp({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setColor(Colors.Blue)
                                .setTitle('Updated Successfully!')
                                .addFields([
                                    { name: 'Output', value: `\`\`\`js\n${stdout}\`\`\`` },
                                ])
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })

                        ]
                });
            });
        } else {
            return interaction.editReply({
                embeds:
                    [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('Insufficient Permissions')
                            .setDescription('You are not a Bot Developer to run this command!')
                            .setTimestamp()
                            .setFooter({ text: interaction.guild.name })
                    ]
            })
        }
    }
}