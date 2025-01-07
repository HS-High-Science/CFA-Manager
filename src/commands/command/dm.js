const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('DMs a user')
        .addUserOption(option => option
            .setName('member')
            .setDescription('The server member you want to DM')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message you want to send')
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('The attachment you want to send')
        )
        .addBooleanOption(option => option
            .setName('anonymous')
            .setDescription('(Defaults to TRUE) Should your name be kept unmentioned in the DM headline?')
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const user = interaction.options.getUser('member', true);
            const message = interaction.options.getString('message');
            const attachment = interaction.options.getAttachment('attachment');
            const anonymous = interaction.options.getBoolean('anonymous') ?? true;
            const dmLogChannel = await interaction.client.channels.cache.get(process.env.DM_LOG_CHANNEL_ID);
            const logEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('New Direct Message!')
                .setDescription(`<@${interaction.user.id}> has sent a direct message to <@${user.id}>.\n\n${message}`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            const embedToSend = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle(`You've Got Mail!`)
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            let author = `.`;
            if (!anonymous) {
                author = ` (<@${interaction.user.id}>).`;
            };

            if (attachment && !message) {
                embedToSend
                    .setDescription(`You have received a message from the Chaos Forces Alliance leadership${author}`)
                    .setImage(attachment.url);
                logEmbed
                    .setDescription(`<@${interaction.user.id}> has sent a direct message to <@${user.id}>.`)
                    .setImage(attachment.url);
            } else if (!attachment && message) {
                embedToSend
                    .setDescription(`You have received a message from the Chaos Forces Alliance leadership${author}\n\n${message}`);
                logEmbed
                    .setDescription(`<@${interaction.user.id}> has sent a direct message to <@${user.id}>.\n\n${message}`)
            } else if (attachment && message) {
                embedToSend
                    .setDescription(`You have received a message from the Chaos Forces Alliance leadership${author}\n\n${message}`)
                    .setImage(attachment.url);
                logEmbed
                    .setDescription(`<@${interaction.user.id}> has sent a direct message to <@${user.id}>.\n\n${message}`)
                    .setImage(attachment.url);
            } else if (!attachment && !message) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setTitle('Error.')
                            .setDescription('Cannot send an empty message.')
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })
                    ]
                })
            };

            try {
                await user.send({
                    embeds: [embedToSend]
                });
            } catch (error) {
                if (error.code === 50007) {
                    return await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Yellow)
                                .setTitle(`Error.`)
                                .setDescription(`Cannot send a message to <@${user.id}> because the user has this bot blocked.`)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    });
                }
            };

            await dmLogChannel.send({ embeds: [logEmbed] });

            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle(`Direct message sent.`)
                        .setDescription(`Successfully sent a direct message to <@${user.id}>.`)
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
                        .setTitle('Permission Denied!')
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
