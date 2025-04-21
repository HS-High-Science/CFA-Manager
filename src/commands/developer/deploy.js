import { spawn } from 'child_process';
import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('[DEV] Manually deploy commands.');

export async function execute(interaction) {
    await interaction.deferReply();

    const allowedIDs = ["1226408360551645254", "427832787605782549", "597084523338924063"];
    if (!(interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id))) return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle('Access denied.')
                .setDescription('You do not have the required permissions to use this command.')
                .setColor(Colors.Red)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });

    await interaction.followUp('`Re-Deploying...`');

    const { stdout, stderr } = spawn('node src/deploy-commands', { shell: true });

    stderr.on('data', async data => {
        console.log(`stderr: ${data}`);

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('stderr')
                    .setDescription('Console has returned some warnings or information.')
                    .setFields({ name: 'stderr', value: `\`\`\`\n${data}\`\`\`` })
                    .setTimestamp()
                    .setFooter({ text: 'CFA Manager Bot' })
            ]
        });
    });

    stdout.on('data', async data => {
        console.log(`stdout: ${data}`);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Deploy operation.')
                    .setDescription('The command is being executed, watch output for results...')
                    .setFields({ name: 'stdout', value: `\`\`\`\n${data}\`\`\`` })
                    .setTimestamp()
                    .setFooter({ text: 'CFA Manager Bot' })
            ]
        });
    });
}
