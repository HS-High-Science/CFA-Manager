import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('[DEV] Manually reboot the bot.');

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

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle('Rebooting...')
                .setDescription('Bot reboot is in progress...')
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });

    process.exit();
}
