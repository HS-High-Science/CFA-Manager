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
            .setRequired(false)
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('The attachment you want to send')
            .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro

            if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
                const user = interaction.options.getUser('member');
                const message = interaction.options.getString('message');
                const attachment = interaction.options.getAttachment('attachment');

                await interaction.guild.channels.cache.get(process.env.DM_LOG_CHANNEL_ID).send({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setTitle(`${interaction.user.tag} sent a DM to ${user.tag}`)
                                .setColor(Colors.Green)
                                .setFields([
                                    { name: 'Text Content', value: message ? message : 'N/A' },
                                    { name: 'Attachment', value: attachment ? attachment.url : 'N/A' }
                                ])
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                                .setTimestamp()
                        ]
                });

                if (user) {
                    user.send({
                        content: message ? message : '** **',
                        files: attachment ? [attachment] : []
                    });

                    await interaction.editReply({ content: `Sent DM to ${user.tag}!` })

                if (userid) {
                    const user = await interaction.client.users.fetch(userid);

                    user.send({
                        content: message ? message : '** **',
                        files: attachment ? [attachment] : []

                    return interaction.guild.channels.cache.get('1258036069572808725').send({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle(`${interaction.user.tag} sent a DM to ${user.tag}`)
                                    .setColor(Colors.Green)
                                    .setFields([
                                        { name: 'Text Content', value: message ? message : 'N/A' },
                                        { name: 'Attachment', value: attachment ? attachment.url : 'N/A' }
                                    ])
                                    .setFooter({
                                        text: interaction.guild.name,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                    });

                } else {
                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Permission Denied!')
                                    .setDescription('You do not have the required permissions to use this command!')
                                    .setColor(Colors.Red)
                                    .setFooter({
                                        text: interaction.guild.name,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                    })
                }
            }
        } catch (error) {
            console.warn(error);

            await interaction.guild.channels.cache.get(process.env.ERR_LOG_CHANNEL_ID).send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Bot encountered an error!')
                        .setDescription(`Someone ran a ${interaction.commandName} ${subCommand ? subCommand : ''} command and it errored!`)
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Error message', value: `\`\`\`js\n${error}\`\`\`` }
                        ])
                        .setFooter({
                            text: `Chaos Forces Alliance`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ],
                allowedMentions: { parse: ["users"] },
                content: '<@427832787605782549>'
            })

            return interaction.editReply({ content: 'There was an error while executing this command! Contact Danonienko if error persists.', ephemeral: true });
        }
    }
}
