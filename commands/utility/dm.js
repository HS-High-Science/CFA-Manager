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
            .setDescription('The ID of the user you want to DM. Allows you to DM a user who is not in THIS server, only works if bot is inside the server the user is in.')
            .setRequired(false)
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('The attachment you want to send')
            .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const allowedIDs = ["1226408360551645254", "427832787605782549", "1239137720669044766"]
            if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
                const user = interaction.options.getUser('user');
                const message = interaction.options.getString('message');
                const userid = interaction.options.getNumber('userid');
                const attachment = interaction.options.getAttachment('attachment');

                if (user) {
                    user.send({
                        content: message,
                        files: attachment ? [attachment] : []
                    });
                    return interaction.reply({ content: `Sent DM to ${user.tag}!`, ephemeral: true });
                }

                if (userid) {
                    const user = await interaction.client.users.fetch(userid);
                    user.send({
                        content: message,
                        files: attachment ? [attachment] : []
                    });
                    return interaction.reply({ content: `Sent DM to ${user.tag}!`, ephemeral: true });
                }

                return interaction.reply({ content: 'Please provide a user or user ID!', ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            return interaction.reply({ content: 'There was an error while executing this command! Contact Danonienko if error presists.', ephemeral: true });
        }
    }
}