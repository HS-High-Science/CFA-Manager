const { exec } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploys commands'),
    async execute(interaction) {
        await interaction.deferReply();

        const allowedIDs = ["1226408360551645254", "427832787605782549"]

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            exec('node deploy-commands.js', (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle('Deploy Failed')
                                .setDescription(`\`\`\`js\n${error.message}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                    });
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle('Deploy Failed')
                                .setDescription(`\`\`\`js\n${stderr}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                    });
                }
                console.log(`stdout: ${stdout}`);
                return interaction.editReply({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setColor(Colors.Green)
                                .setTitle('Deploy Successful')
                                .setDescription(`\`\`\`js\n${stdout}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                });
            });
        }
    }
}