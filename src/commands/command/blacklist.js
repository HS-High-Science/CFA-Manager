import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage CFA application blacklists.')
    .addSubcommand(subCommand => subCommand
        .setName('issue')
        .setDescription('Blacklist a person from applying.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to be blacklisted.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the blacklist to be issued.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Blacklist duration (text).')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('remove')
        .setDescription('Unblacklist a person from applying.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to be unblacklisted.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription(`The reason for the blacklist removal.`)
        )
    );

export async function execute(interaction) {
    await interaction.deferReply();

    const allowedIDs = ["1239137720669044766", "1255634139730935860"]; // command, high command

    if (!interaction.member.roles.cache.hasAny(...allowedIDs)) return await interaction.editReply({
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

    const subcommand = interaction.options.getSubcommand();
    const logChannel = await interaction.guild.channels.cache.get('1332780824952836188');
    const user = interaction.options.getMember('user', true);

    if (!user) return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle('Error.')
                .setColor(Colors.Red)
                .setDescription(`${user} is not a member of this server.`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });

    const reason = interaction.options.getString('reason', true);

    if (subcommand === 'issue') {
        const duration = interaction.options.getString('duration', true);
        const userEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Blacklist issued.')
            .setDescription('You have been blacklisted from applying for the Chaos Forces Alliance.')
            .setFields(
                { name: 'Reason', value: reason },
                { name: 'Duration', value: duration }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Blacklist issued.')
            .setDescription(`${interaction.user} has issued an applications blacklist to ${user}.`)
            .setFields(
                { name: 'Reason', value: reason },
                { name: 'Duration', value: duration }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await user.roles.add('1258820500046741524');
        await user.send({ embeds: [userEmbed] })
            .catch(async _ => await logChannel.send({ content: '## ⚠️ Unable to DM the user about the blacklist. Please inform them manually.' }));
        await logChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully blacklisted ${user} from applying.`)
                    .addFields(
                        { name: "Reason", value: reason },
                        { name: "Blacklist duration", value: duration }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'remove') {
        const userEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('Blacklist removed.')
            .setDescription('You have been unblacklisted from applying for the Chaos Forces Alliance.')
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('Blacklist removed.')
            .setDescription(`${interaction.user} has removed an applications blacklist from ${user}.`)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        if (reason) {
            userEmbed.setFields({ name: 'Reason', value: reason });
            logEmbed.setFields({ name: 'Reason', value: reason });
        }

        await user.roles.remove('1258820500046741524');
        await user.send({ embeds: [userEmbed] })
            .catch(async _ => await logChannel.send({ content: '## ⚠️ Unable to DM the user about the blacklist. Please inform them manually.' }));
        await logChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully unblacklisted ${user}.`)
                    .addFields({ name: "Reason", value: reason ?? 'No reason provided.' })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }
}
