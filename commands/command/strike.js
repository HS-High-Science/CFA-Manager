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
            .setRequired(false)
        ),

    async execute(interaction) {
        const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro
        const user = interaction.options.getUser('member');
        const reason = interaction.options.getString('reason') ?? 'No reason specified.';
        const uuid = crypto.randomUUID();
        const errors = [];
        await interaction.deferReply({ephemeral: true});

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {

            await interaction.guild.channels.cache.get(process.env.STRIKE_LOG_CHANNEL_ID).send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Strike issued!`)
                        .setDescription(`<@${interaction.user.id}> has issued a strike to <@${user.id}>`)
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Reason', value: reason },
                            { name: 'Strike ID', value: uuid }
                        ])
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ]
            });

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Strike notice')
                        .setDescription('You have been issued a strike by CFA Command.\nThis can most likely be appealed in the [Internal Relations Department Discord](https://discord.gg/xsB3xPnsVG).')
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Strike ID', value: uuid, inline: true }
                        ])
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ]
            })
                .catch(_ => errors.push(_));

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Strike issued!')
                        .setDescription(`Successfully issued a strike to <@${user.id}>.`)
                        .setColor(Colors.Green)
                        .setFields([
                            { name: 'Reason', value: reason },
                            { name: 'Strike ID', value: uuid },
                            { name: 'Errors', value: errors.length > 0 ? errors.join('\n') : 'None' }
                        ])
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ]
            });
        } else {
            return interaction.editReply({
                content: 'You do not have permission to use this command.'
            });
        }
    }
}
