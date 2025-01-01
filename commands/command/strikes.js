const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strikes')
        .setDescription('Allows authorized users to manage CFA operatives\' strikes.')
        .addSubcommand(subcommand => subcommand
            .setName('issue')
            .setDescription('Issue a strike to a CFA operative.')
            .addUserOption(option => option
                .setName('member')
                .setDescription('The server member you want to strike.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for the strike.')
                .setRequired(true)
            )
            .addAttachmentOption(option => option
                .setName('attachment')
                .setDescription('The IMAGE attachment to be included with the strike message.')
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a strike from the CFA operative\'s record.')
            .addStringOption(option => option
                .setName('strike_id')
                .setDescription('ID of the strike you want to remove.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('reason')
                .setDescription('Optional reason for strike removal.')
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('fetch')
            .setDescription('Fetch the CFA operative\'s strikes.')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose strikes you want to fetch.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('fromid')
            .setDescription('Retrieve a strike by its ID.')
            .addStringOption(option => option
                .setName('strike_id')
                .setDescription('The ID of the strike to be retrieved.')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const allowedIDs = ["1239137720669044766", "1255634139730935860", "1071373709157351464"] //llasat one is astro
        const subcommand = interaction.options.getSubcommand();

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const strikeLogsChannel = await interaction.client.channels.cache.get(process.env.STRIKE_LOG_CHANNEL_ID);

            if (subcommand === 'issue') {
                const uuid = crypto.randomUUID();
                const user = interaction.options.getUser('member', true);
                const reason = interaction.options.getString('reason', true);
                const attachment = interaction.options.getAttachment('attachment');

                await interaction.client.knex('strikes')
                    .insert({
                        strike_id: uuid,
                        rebel_id: user.id,
                        reason: reason,
                        responsible_hr: interaction.user.id,
                        date_issued: Math.round(Date.now() / 1000)
                    });

                const userEmbed = new EmbedBuilder()
                    .setTitle('Strike notice')
                    .setDescription('You have been issued a strike by CFA Command.\nIt can most likely be appealed in the [Internal Relations Department Discord](https://discord.gg/xsB3xPnsVG).')
                    .setColor(Colors.Red)
                    .setFields(
                        { name: 'Reason', value: reason },
                        { name: 'Strike ID', value: uuid }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                const logEmbed = new EmbedBuilder()
                    .setTitle(`Strike issued!`)
                    .setDescription(`<@${interaction.user.id}> has issued a strike to <@${user.id}>`)
                    .setColor(Colors.Red)
                    .setFields(
                        { name: 'Reason', value: reason },
                        { name: 'Strike ID', value: uuid }
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
                    await strikeLogsChannel.send({ embeds: [logEmbed] });
                } catch (error) {
                    if (error.code === 50007) {
                        await strikeLogsChannel.send({
                            content: '## ⚠️ Unable to DM the user about the strike. Please inform them manually.',
                            embeds: [logEmbed]
                        });
                    };
                };

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Strike issued!')
                            .setDescription(`Successfully issued a strike to <@${user.id}>.`)
                            .setColor(Colors.Green)
                            .setFields(
                                { name: 'Reason', value: reason },
                                { name: 'Strike ID', value: uuid }
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
                const id = interaction.options.getString('strike_id', true);
                const reason = interaction.options.getString('reason');
                const strike = await interaction.client.knex('strikes')
                    .select('*')
                    .where('strike_id', id)
                    .first();

                if (!strike) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Yellow)
                                .setTitle('Error.')
                                .setDescription(`No strike with ID \`${id}\` has been found in the database.`)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    })
                };

                const strikeReason = strike.reason;
                const userId = strike.rebel_id;

                await interaction.client.knex('strikes')
                    .del()
                    .where('strike_id', id);

                const userEmbed = new EmbedBuilder()
                    .setTitle('Strike notice')
                    .setDescription(`A strike with ID \`${id}\` has been removed from your record by CFA Command.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Original Strike Reason', value: strikeReason })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                const logEmbed = new EmbedBuilder()
                    .setTitle(`Strike removed!`)
                    .setDescription(`<@${interaction.user.id}> has removed a strike from <@${userId}>'s record.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Original Strike Reason', value: strikeReason })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                if (reason) {
                    logEmbed.addFields({ name: 'Strike Removal Reason', value: reason });
                    userEmbed.addFields({ name: 'Strike Removal Reason', value: reason });
                };

                await strikeLogsChannel.send({ embeds: [logEmbed] });

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Strike removed!')
                            .setDescription(`Successfully removed a strike from <@${user.id}>'s record.`)
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
                        return await strikeLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the strike. Please inform them manually.' });
                    };
                };
            } else if (subcommand === 'fetch') {
                const user = interaction.options.getUser('user', true);
                const strikes = await interaction.client.knex('strikes')
                    .select('*')
                    .where('rebel_id', user.id);

                if (strikes.length === 0) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Grey)
                                .setTitle('No Strikes Found')
                                .setDescription(`No strikes for <@${user.id}> have been found in the database.`)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    })
                };

                let desc = ``;
                for (const strike of strikes) {
                    desc = desc.concat(`- **Strike ID**: ${strike.strike_id}\n  - **Issued on**: <t:${strike.date_issued}:f>\n  - **Reason**: ${strike.reason}\n\n`);
                }

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Aqua)
                            .setTitle(`Found ${strikes.length} strike(s) for <@${user.id}>`)
                            .setDescription(`${desc}`)
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })
                    ]
                });
            } else if (subcommand === 'fromid') {
                const id = interaction.options.getString('strike_id', true);

                const strike = await interaction.client.knex('strikes')
                    .select('*')
                    .where('strike_id', id)
                    .first();

                if (!strike) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Yellow)
                                .setTitle('Error.')
                                .setDescription(`No strike with ID \`${id}\` has been found in the database.`)
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
                            .setTitle('Strike Found')
                            .setDescription(`Successfully retrieved a strike from the database.\n\n- **Strike ID**: ${strike.strike_id}\n  - **Issued on**: <t:${strike.date_issued}:f>\n  - **Reason**: ${strike.reason}`)
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