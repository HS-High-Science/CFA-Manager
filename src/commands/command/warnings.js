import { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Allows authorized users to manage CFA operatives\' formal warnings.')
    .addSubcommand(subcommand => subcommand
        .setName('issue')
        .setDescription('Issue a formal warning to a CFA operative.')
        .addUserOption(option => option
            .setName('member')
            .setDescription('The server member you want to warn.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the warning.')
            .setRequired(true)
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('The IMAGE attachment to be included with the warning message.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('remove')
        .setDescription('Remove a formal warning from the CFA operative\'s record.')
        .addStringOption(option => option
            .setName('warning_id')
            .setDescription('ID of the warning you want to remove.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Optional reason for warning removal.')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('fetch')
        .setDescription('Fetch the CFA operative\'s formal warnings.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user whose warnings you want to fetch (default to the user running this command).')
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('fromid')
        .setDescription('Retrieve a formal warning by its ID.')
        .addStringOption(option => option
            .setName('warning_id')
            .setDescription('The ID of the warning to be retrieved.')
            .setRequired(true)
        )
    );

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'fetch' || subcommand === 'fromid') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } else await interaction.deferReply();

    const elevatedAccessIds = ["1239137720669044766", "1255634139730935860"];
    const warnLogsChannel = interaction.client.channels.cache.get(process.env.WARNING_LOG_CHANNEL_ID);

    if (subcommand === 'fetch') {
        const user = interaction.options.getUser('user') ?? interaction.user;

        if (user !== interaction.user && !interaction.member.roles.cache.hasAny(...elevatedAccessIds)) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Access denied.')
                    .setDescription('You do not have the required permissions to view other people\'s formal warnings.')
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const warnings = await interaction.client.knex('warns')
            .select('*')
            .where('rebel_id', user.id);

        if (warnings.length === 0) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('No warnings found.')
                    .setDescription(`No formal warnings for ${user} have been found in the database.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        let desc = ``;
        for (const warning of warnings) desc = desc.concat(`- **Warning ID**: ${warning.warning_id}\n  - **Issued on**: <t:${warning.date_issued}:f>\n  - **Reason**: ${warning.reason}\n\n`);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle(`Warnings found.`)
                    .setDescription(`Found ${strikes.length} formal warning(s) for ${user}\n\n${desc}`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'fromid') {
        const id = interaction.options.getString('warning_id', true);
        const warning = await interaction.client.knex('warns')
            .select('*')
            .where('warning_id', id)
            .first();

        if (!warning) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('Warning not found.')
                    .setDescription(`No formal warning with ID \`${id}\` has been found in the database.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        if (interaction.user.id !== strike.rebel_id && !interaction.member.roles.cache.hasAny(...elevatedAccessIds)) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Access denied.')
                    .setDescription('You do not have the required permissions to view other people\'s formal warnings.')
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle('Warning found.')
                    .setDescription(`Successfully retrieved a formal warning from the database.\n\n- **Warning ID**: ${warning.warning_id}\n  - **Issued on**: <t:${warning.date_issued}:f>\n  - **Reason**: ${warning.reason}`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }

    if (!(interaction.member.roles.cache.hasAny(...elevatedAccessIds))) return await interaction.editReply({
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

    if (subcommand === 'issue') {
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

        const uuid = crypto.randomUUID();
        const reason = interaction.options.getString('reason', true);
        const attachment = interaction.options.getAttachment('attachment');

        await interaction.client.knex('warns')
            .insert({
                warning_id: uuid,
                rebel_id: user.id,
                reason: reason,
                responsible_hr: interaction.user.id,
                date_issued: Math.round(Date.now() / 1000)
            });

        const userEmbed = new EmbedBuilder()
            .setTitle('Formal warning notice.')
            .setDescription('You have been issued a formal warning by CFA Command.\nIt can most likely be appealed in the [Internal Relations Department Discord](https://discord.gg/xsB3xPnsVG).')
            .setColor(Colors.Red)
            .setFields(
                { name: 'Reason', value: reason },
                { name: 'Warning ID', value: uuid }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        const logEmbed = new EmbedBuilder()
            .setTitle(`Warning issued.`)
            .setDescription(`${interaction.user} has issued a formal warning to ${user}.`)
            .setColor(Colors.Red)
            .setFields(
                { name: 'Reason', value: reason },
                { name: 'Warning ID', value: uuid }
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
        }

        await user.send({ embeds: [userEmbed] })
            .catch(async _ => await warnLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the warning. Please inform them manually.' }));
        await warnLogsChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Warning issued.')
                    .setDescription(`Successfully issued a formal warning to ${user}.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Warning ID', value: uuid })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'remove') {
        const id = interaction.options.getString('warning_id', true);
        const reason = interaction.options.getString('reason');
        const warning = await interaction.client.knex('warns')
            .select('*')
            .where('warning_id', id)
            .first();

        if (!warning) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('Error.')
                    .setDescription(`No formal warning with ID \`${id}\` has been found in the database.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const warnReason = warning.reason;
        const userId = warning.rebel_id;

        await interaction.client.knex('warns')
            .del()
            .where('warning_id', id);

        const userEmbed = new EmbedBuilder()
            .setTitle('Warning notice.')
            .setDescription(`A formal warning with ID \`${id}\` has been removed from your record by CFA Command.`)
            .setColor(Colors.Green)
            .setFields({ name: 'Original warning reason', value: warnReason })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        const logEmbed = new EmbedBuilder()
            .setTitle(`Warning removed.`)
            .setDescription(`${interaction.user} has removed a formal warning from <@${userId}>'s record.`)
            .setColor(Colors.Green)
            .setFields({ name: 'Original warning reason', value: warnReason })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        if (reason) {
            logEmbed.addFields({ name: 'Warning removal reason', value: reason });
            userEmbed.addFields({ name: 'Warning removal reason', value: reason });
        }

        const user = interaction.client.users.cache.get(userId);

        if (user) await user.send({ embeds: [userEmbed] })
            .catch(async _ => await warnLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the warning. Please inform them manually.' }));

        await warnLogsChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Warning removed.')
                    .setDescription(`Successfully removed a formal warning from <@${userId}>'s record.`)
                    .setColor(Colors.Green)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }
}
