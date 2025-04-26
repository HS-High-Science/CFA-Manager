import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a direct message to a user.')
    .addUserOption(option => option
        .setName('member')
        .setDescription('The server member to DM.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('message')
        .setDescription('The message to send.')
    )
    .addAttachmentOption(option => option
        .setName('attachment')
        .setDescription('The optional attachment to send.')
    )
    .addBooleanOption(option => option
        .setName('anonymous')
        .setDescription('(Defaults to TRUE) Should your name be kept unmentioned in the DM headline?')
    );

export async function execute(interaction) {
    await interaction.deferReply();

    const allowedIDs = ["1239137720669044766", "1255634139730935860"];

    if (!(interaction.member.roles.cache.hasAny(...allowedIDs))) return await interaction.editReply({
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

    const user = interaction.options.getMember('member', true);

    if (!user) return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Error.')
                .setDescription(`${user} is not a member of this server.`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });

    const message = interaction.options.getString('message');
    const attachment = interaction.options.getAttachment('attachment');

    if (!attachment && !message) return await interaction.editReply({
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
    });

    const anonymous = interaction.options.getBoolean('anonymous') ?? true;
    const dmLogChannel = interaction.client.channels.cache.get(process.env.DM_LOG_CHANNEL_ID);
    const logEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('New Direct Message.')
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    const embedToSend = new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle(`You've got mail!`)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    let author = `.`;
    if (!anonymous) author = ` (${interaction.user}).`;

    let userDesc = `You have received a message from the Chaos Forces Alliance leadership${author}`;
    let logDesc = `${interaction.user} has sent a direct message to ${user}.`;

    if (attachment) {
        embedToSend.setImage(attachment.url);
        logEmbed.setImage(attachment.url);
    }

    if (message) {
        userDesc = userDesc.concat(`\n\n${message}`);
        logDesc = logDesc.concat(`\n\n${message}`);
    }

    embedToSend.setDescription(userDesc);
    logEmbed.setDescription(logDesc);

    try {
        await user.send({ embeds: [embedToSend] });
    } catch (_) {
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`Error.`)
                    .setDescription(`Cannot send a message to ${user}. This could happen because the user has this bot blocked.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }

    await dmLogChannel.send({ embeds: [logEmbed] });

    return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`Direct message sent.`)
                .setDescription(`Successfully sent a direct message to ${user}.`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });
}
