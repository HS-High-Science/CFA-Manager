import { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('strikes')
    .setDescription('Allows authorized users to manage CFA operatives\' strikes.')
    .addSubcommand(subcommand => subcommand
        .setName('issue')
        .setDescription('[COM+] Issue a strike to a CFA operative.')
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
        .setDescription('[COM+] Remove a strike from the CFA operative\'s record.')
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
            .setDescription('The user whose strikes you want to fetch (default to the user running this command).')
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
    );

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'fetch' || subcommand === 'fromid') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } else await interaction.deferReply();

    const elevatedAccessIds = ["1239137720669044766", "1255634139730935860"];
    const strikeLogsChannel = interaction.client.channels.cache.get(process.env.STRIKE_LOG_CHANNEL_ID);

    if (subcommand === 'fetch') {
        const user = interaction.options.getUser('user') ?? interaction.user;

        if (user !== interaction.user && !interaction.member.roles.cache.hasAny(...elevatedAccessIds)) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Access denied.')
                    .setDescription('You do not have the required permissions to view other people\'s strikes.')
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const strikes = await interaction.client.knex('strikes')
            .select('*')
            .where('rebel_id', user.id);

        if (strikes.length === 0) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('No strikes found.')
                    .setDescription(`No strikes for ${user} have been found in the database.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        let desc = ``;
        for (const strike of strikes) desc = desc.concat(`- **Strike ID**: ${strike.strike_id}\n  - **Issued on**: <t:${strike.date_issued}:f>\n  - **Reason**: ${strike.reason}\n\n`);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle(`Strikes found.`)
                    .setDescription(`Found ${strikes.length} strike(s) for ${user}\n\n${desc}`)
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

        if (!strike) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('Strike not found.')
                    .setDescription(`No strike with ID \`${id}\` has been found in the database.`)
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
                    .setDescription('You do not have the required permissions to view other people\'s strikes.')
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
                    .setTitle('Strike found.')
                    .setDescription(`Successfully retrieved a strike from the database.\n\n- **Strike ID**: ${strike.strike_id}\n  - **Issued on**: <t:${strike.date_issued}:f>\n  - **Reason**: ${strike.reason}`)
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

        await interaction.client.knex('strikes')
            .insert({
                strike_id: uuid,
                rebel_id: user.id,
                reason: reason,
                responsible_hr: interaction.user.id,
                date_issued: Math.round(Date.now() / 1000)
            });

        const userEmbed = new EmbedBuilder()
            .setTitle('Strike notice.')
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
            .setTitle(`Strike issued.`)
            .setDescription(`${interaction.user} has issued a strike to ${user}.`)
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
        }

        await user.send({ embeds: [userEmbed] })
            .catch(async _ => await strikeLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the strike. Please inform them manually.' }));
        await strikeLogsChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Strike issued.')
                    .setDescription(`Successfully issued a strike to ${user}.`)
                    .setColor(Colors.Green)
                    .setFields({ name: 'Strike ID', value: uuid })
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

        if (!strike) return await interaction.editReply({
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
        });

        const strikeReason = strike.reason;
        const userId = strike.rebel_id;

        await interaction.client.knex('strikes')
            .del()
            .where('strike_id', id);

        const userEmbed = new EmbedBuilder()
            .setTitle('Strike notice.')
            .setDescription(`A strike with ID \`${id}\` has been removed from your record by CFA Command.`)
            .setColor(Colors.Green)
            .setFields({ name: 'Original strike reason', value: strikeReason })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        const logEmbed = new EmbedBuilder()
            .setTitle(`Strike removed.`)
            .setDescription(`${interaction.user} has removed a strike from <@${userId}>'s record.`)
            .setColor(Colors.Green)
            .setFields({ name: 'Original strike reason', value: strikeReason })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        if (reason) {
            logEmbed.addFields({ name: 'Strike removal reason', value: reason });
            userEmbed.addFields({ name: 'Strike removal reason', value: reason });
        }

        const user = interaction.client.users.cache.get(userId);

        if (user) await user.send({ embeds: [userEmbed] })
            .catch(async _ => await strikeLogsChannel.send({ content: '## ⚠️ Unable to DM the user about the strike. Please inform them manually.' }));

        await strikeLogsChannel.send({ embeds: [logEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Strike removed.')
                    .setDescription(`Successfully removed a strike from <@${userId}>'s record.`)
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
