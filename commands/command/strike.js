const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strike')
        .setDescription('Issues a strike to a user.')
        .addUserOption(option => option
            .setName('member')
            .setDescription('The server member you want to issue the strike to.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the strike.')
            .setRequired(true)
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('The attachment to be included with the strike.')
        ),
    async execute(interaction) {
        const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro
        const user = interaction.options.getUser('member', true);
        const reason = interaction.options.getString('reason', true);
        const attachment = interaction.options.getAttachment('attachment');
        const uuid = crypto.randomUUID();
        await interaction.deferReply({ ephemeral: true });

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const userEmbed = new EmbedBuilder()
                .setTitle('Strike notice')
                .setDescription('You have been issued a strike by CFA Command.\nIt can most likely be appealed in the [Internal Relations Department Discord](https://discord.gg/xsB3xPnsVG).')
                .setColor(Colors.Red)
                .setFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Strike ID', value: uuid, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            const logEmbed = new EmbedBuilder()
                .setTitle(`Strike issued!`)
                .setDescription(`<@${interaction.user.id}> has issued a strike to <@${user.id}>`)
                .setColor(Colors.Red)
                .setFields(
                    { name: 'Reason', value: reason },
                    { name: 'Strike ID', value: uuid }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            if (attachment) {
                logEmbed.setImage(attachment.url);
                userEmbed.setImage(attachment.url);
            };

            try {
                await user.send({ embeds: [userEmbed] });
                await interaction.guild.channels.cache.get(process.env.STRIKE_LOG_CHANNEL_ID).send({ embeds: [logEmbed] });
            } catch (error) {
                if (error.code === 50007) {
                    return await interaction.guild.channels.cache.get(process.env.STRIKE_LOG_CHANNEL_ID).send({
                        content: '## ⚠️ Unable to DM the user about the strike. Please inform them manually.',
                        embeds: [logEmbed]
                    });
                }
            };

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Strike issued!')
                        .setDescription(`Successfully issued a strike warning to <@${user.id}>.`)
                        .setColor(Colors.Green)
                        .setFields(
                            { name: 'Reason', value: reason },
                            { name: 'Warning ID', value: uuid }
                        )
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });
        } else {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Access Denied!')
                        .setDescription('You do not have the required permissions to use this command!')
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        }
    }
}
