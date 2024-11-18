const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issues a formal warning to a user.')
        .addUserOption(option => option
            .setName('member')
            .setDescription('The server member you want to issue the warning to.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the warning.')
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

            await interaction.guild.channels.cache.get(process.env.WARNING_LOG_CHANNEL_ID).send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Warning issued!`)
                        .setDescription(`<@${interaction.user.id}> has issued a formal warning to <@${user.id}>`)
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Reason', value: reason },
                            { name: 'Warning ID', value: uuid }
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
                        .setTitle('Formal warning notice')
                        .setDescription('You have been issued a formal warning by CFA Command.\nThis can most likely be appealed in the [Internal Relations Department Discord](https://discord.gg/xsB3xPnsVG).')
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Warning ID', value: uuid, inline: true }
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
                        .setTitle('Warning issued!')
                        .setDescription(`Successfully issued a formal warning to <@${user.id}>.`)
                        .setColor(Colors.Green)
                        .setFields([
                            { name: 'Reason', value: reason },
                            { name: 'Warning ID', value: uuid },
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
