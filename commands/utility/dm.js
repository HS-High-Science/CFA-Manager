const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('DMs a user')
        .addUserOption(option => option
            .setName('member')
            .setDescription('The server member you want to DM')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message you want to send')
            .setRequired(false)
        )
        .addNumberOption(option => option
            .setName('userid')
            .setDescription('The ID of the user you want to DM outside of this server.')
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
            const allowedIDs = ["1226408360551645254", "427832787605782549", "1239137720669044766"]

            if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
                const user = interaction.options.getUser('member');
                const message = interaction.options.getString('message');
                const userid = interaction.options.getNumber('userid');
                const attachment = interaction.options.getAttachment('attachment');

                if (user) {
                    user.send({
                        content: message,
                        files: attachment ? [attachment] : []
                    });
                    return interaction.editReply({ content: `Sent DM to ${user.tag}!`, ephemeral: true });
                }

                if (userid) {
                    const user = await interaction.client.users.fetch(userid);

                    try {
                        user.send({
                            content: message,
                            files: attachment ? [attachment] : []
                        });
                    } catch (error) {
                        console.log(error);
                        return interaction.editReply({ content: 'Seems like the user ID you wanted to DM could not be DMed. The reason for it is that the user must be in the server where the bot is.', ephemeral: true });
                    }

                    return interaction.editReply({ content: `Sent DM to ${user.tag}!`, ephemeral: true });
                }

                return interaction.editReply({ content: 'Please provide a user or user ID!', ephemeral: true });
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
        } catch (error) {
            console.log(error);

            await interaction.channels.cache.get('1235938304990380113').send({
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