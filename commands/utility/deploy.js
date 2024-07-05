const { exec } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('[DEV] Manually deploy/re-deploy commands'),
    async execute(interaction) {
        interaction.reply('`Re-Deploying...`')

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
                                .setDescription(`\`\`\`\n${error.message}\`\`\``)
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                    });
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle('stderr')
                                .setDescription('There are some warnings or information that console gave')
                                .setFields([
                                    { name: 'Output', value: `\`\`\`\n${stderr}\`\`\`` },
                                ])
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                    });
                }
                console.log(`stdout: ${stdout}`);
                return interaction.followUp({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setColor(Colors.Green)
                                .setTitle('Deploy Successful')
                                .setDescription('Re-deployed commands successfully!')
                                .setFields([
                                    { name: 'Output', value: `\`\`\`\n${stdout}\`\`\`` },
                                ])
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                });
            });
        } else {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }
    }
}