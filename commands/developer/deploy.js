const { spawn } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('[DEV] Manually deploy/re-deploy commands'),
    async execute(interaction) {
        const allowedIDs = ["1226408360551645254", "427832787605782549", "597084523338924063"]
        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            interaction.reply('`Re-Deploying...`')

            const { stdout, stderr } = spawn('node deploy-commands', { shell: true })

            stderr.on('data', async (data) => {
                console.log(`stderr: ${data}`);

                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('stderr')
                            .setDescription('There are some warnings or information that console gave')
                            .setFields([
                                { name: 'Output', value: `\`\`\`\n${data}\`\`\`` },
                            ])
                            .setTimestamp()
                            .setFooter({ text: interaction.guild.name })
                    ]
                });

            })

            stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setTitle('Deploy Operation')
                            .setDescription('The command is being executed, watch output for results.')
                            .setFields([
                                { name: 'Output', value: `\`\`\`\n${data}\`\`\`` },
                            ])
                            .setTimestamp()
                            .setFooter({ text: interaction.guild.name })
                    ]
                });
            })
        } else {
            return interaction.reply({ content: 'You do not have permission to use this command!' });
        }
    }
}