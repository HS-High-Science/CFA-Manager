const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Allows authorized users to manage CFA operatives\' formal warnings.')
        .addSubcommand(subcommand => subcommand
            .setName('issue')
            .setDescription('Issue a formal warning to a CFA operative.')
            .addUserOption(option => option
                .setName('member')
                .setDescription('The server member you want to issue the warning to.')
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
                .setDescription('The user whose formal warnings you want to fetch.')
                .setRequired(true)
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
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro
        const subcommand = interaction.options.getSubcommand();

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const warnLogsChannel = await interaction.client.channels.cache.get(process.env.WARNING_LOG_CHANNEL_ID);

            if (subcommand === 'issue') {
                const uuid = crypto.randomUUID();
                const user = interaction.options.getUser('member', true);
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
                    .setTitle('Formal warning notice')
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
                    .setTitle(`Warning issued!`)
                    .setDescription(`<@${interaction.user.id}> has issued a formal warning to <@${user.id}>`)
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
                };

                try {
                    await user.send({ embeds: [userEmbed] });
                    await warnLogsChannel.send({ embeds: [logEmbed] });
                } catch (error) {
                    if (error.code === 50007) {
                        await warnLogsChannel.send({
                            content: '## ⚠️ Unable to DM the user about the warning. Please inform them manually.',
                            embeds: [logEmbed]
                        });
                    };
                };

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Warning issued!')
                            .setDescription(`Successfully issued a formal warning to <@${user.id}>.`)
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
            } else if (subcommand === 'remove') {
                const id = interaction.options.getString('warning_id', true);
                const reason = interaction.options.getString('reason') ?? 'None.';
                const warning = await interaction.client.knex('warns')
                    .select('*')
                    .where('warning_id', id)
                    .first();

                if (!warning) {
                    return await interaction.editReply({
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
                    })
                };

                const warningReason = warning.reason;
                const userId = warning.rebel_id;

                await interaction.client.knex('warns')
                    .del()
                    .where('warning_id', id);

                const userEmbed = new EmbedBuilder()
                    .setTitle('Formal Warning Notice')
                    .setDescription(`A formal warning with ID \`${id}\` has been removed from your record by CFA Command.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Original Warning Reason', value: warningReason })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                const logEmbed = new EmbedBuilder()
                    .setTitle(`Formal Warning Removed!`)
                    .setDescription(`<@${interaction.user.id}> has removed a formal warning from <@${userId}>'s record.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Original Warning Reason', value: warningReason })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                if (reason !== 'None.') {
                    logEmbed.addFields({ name: 'Warning Removal Reason', value: reason });
                    userEmbed.addFields({ name: 'Warning Removal Reason', value: reason });
                };

                await warnLogsChannel.send({ embeds: [logEmbed] });

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Formal Warning Removed!')
                            .setDescription(`Successfully removed a formal warning from <@${userId}>'s record.`)
                            .setColor(Colors.Green)
                            .setFields({ name: 'Removal Reason', value: reason })
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })
                    ]
                });

                const user = await interaction.client.users.cache.get(userId);
                if (!user) return;

                try {
                    await user.send({ embeds: [userEmbed] });
                } catch (error) {
                    if (error.code === 50007) {
                        return await warnLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the warning. Please inform them manually.' });
                    };
                };
            } else if (subcommand === 'fetch') {
                const user = interaction.options.getUser('user', true);
                const warnings = await interaction.client.knex('warns')
                    .select('*')
                    .where('rebel_id', user.id);

                if (warnings.length === 0) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Grey)
                                .setTitle('No Warnings Found')
                                .setDescription(`No formal warnings for <@${user.id}> have been found in the database.`)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    })
                };

                let desc = ``;
                for (const warning of warnings) {
                    desc = desc.concat(`- **Warning ID**: ${warning.warning_id}\n  - **Issued on**: <t:${warning.date_issued}:f>\n  - **Reason**: ${warning.reason}\n\n`);
                }

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Aqua)
                            .setTitle(`Warnings Found`)
                            .setDescription(`Found ${warnings.length} formal warning(s) for <@${user.id}>\n\n${desc}`)
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

                if (!warning) {
                    return await interaction.editReply({
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
                    })
                };

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Aqua)
                            .setTitle('Formal Warning Found')
                            .setDescription(`Successfully retrieved a formal warning from the database.\n\n- **Warning ID**: ${warning.warning_id}\n  - **Issued on**: <t:${warning.date_issued}:f>\n  - **Reason**: ${warning.reason}`)
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })
                    ]
                });
            };
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