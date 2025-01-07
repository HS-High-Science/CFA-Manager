import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('[DEV] Manually reboot the bot.');
export async function execute(interaction) {
    const allowedIDs = ["1226408360551645254", "427832787605782549", "597084523338924063"];
    await interaction.deferReply();

    if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
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