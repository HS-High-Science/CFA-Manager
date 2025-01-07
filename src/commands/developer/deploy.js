import { spawn } from 'child_process';
import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('[DEV] Manually deploy commands and restart.');
export async function execute(interaction) {
    const allowedIDs = ["1226408360551645254", "427832787605782549", "597084523338924063"];
    await interaction.deferReply();

    if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
        await interaction.followUp('`Re-Deploying...`');

        const { stdout, stderr } = spawn('node src/deploy-commands', { shell: true });

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
        });

        stdout.on('data', async (data) => {
            console.log(`stdout: ${data}`);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle('Deploy Operation')
                        .setDescription('The command is being executed, watch output for results.')
                        .setFields([
                            { name: 'Output', value: `\`\`\`\n${data}\`\`\`` },
                        ])
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });
        });
    } else {
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Access Denied')
                    .setDescription('You do not have the required permissions to run this command.')
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    };
};