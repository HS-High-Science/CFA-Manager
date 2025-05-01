import { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('st')
    .setDescription('Strike Team related commands.')
    .addSubcommandGroup(group => group
        .setName('tryouts')
        .setDescription('Manage Strike Team tryouts.')
        .addSubcommand(sc => sc
            .setName('schedule')
            .setDescription('Schedule a Strike Team tryout.')
            .addIntegerOption(option => option
                .setName('time')
                .setDescription('The time at which the tryout is going to be hosted (UNIX).')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('ping_role')
                .setDescription('The role to ping for this announcement')
                .setRequired(true)
            )
        )
        .addSubcommand(sc => sc
            .setName('start')
            .setDescription('Start a Strike Team tryout.')
            .addStringOption(option => option
                .setName('tryout_id')
                .setDescription('ID of a tryout to be started.')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('ping_role')
                .setDescription('The role to ping for this announcement')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('venue_link')
                .setDescription('The link for joining this tryout.')
            )
        )
        .addSubcommand(sc => sc
            .setName('lock')
            .setDescription('Lock a Strike Team tryout.')
            .addStringOption(option => option
                .setName('tryout_id')
                .setDescription('ID of a tryout to be locked.')
                .setRequired(true)
            )
        )
        .addSubcommand(sc => sc
            .setName('conclude')
            .setDescription('Conclude a Strike Team tryout.')
            .addStringOption(option => option
                .setName('tryout_id')
                .setDescription('ID of a tryout to be concluded.')
                .setRequired(true)
            )
        )
        .addSubcommand(sc => sc
            .setName('cancel')
            .setDescription('Cancel a Strike Team tryout.')
            .addStringOption(option => option
                .setName('tryout_id')
                .setDescription('ID of a tryout to be cancelled.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for this tryout to be cancelled.')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('ping_role')
                .setDescription('The role to ping for this announcement')
                .setRequired(true)
            )
        )
        .addSubcommand(sc => sc
            .setName('update')
            .setDescription('Update a Strike Team tryout.')
            .addStringOption(option => option
                .setName('tryout_id')
                .setDescription('ID of a tryout to be updated.')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('new_time')
                .setDescription('Updated tryout time (UNIX).')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('ping_role')
                .setDescription('The role to ping for this announcement')
                .setRequired(true)
            )
        )
    );

export async function execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const allowedIds = ['1257065226403188826']; // strike team leader
    const client = await interaction.client;

    if (!interaction.member.roles.cache.hasAny(...allowedIds)) return await interaction.editReply({
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

    const now = Math.floor(Date.now() / 1000);
    const subcommand = interaction.options.getSubcommand();
    const uuid = crypto.randomUUID();
    const tryoutChannel = interaction.guild.channels.cache.get('1362491967967203408');
    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle('Error.')
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    if (subcommand === 'schedule') {
        const time = await interaction.options.getInteger('time', true);

        if (time <= now) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Tryout cannot be scheduled in the past.')] });

        const tryoutAtThisTime = await client.knex('stTryouts')
            .select('*')
            .where('tryout_date', time)
            .first();

        if (tryoutAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a tryout scheduled for this time.')] });

        const message = await tryoutChannel.send({
            allowedMentions: { parse: ["roles"] },
            content: `${interaction.options.getRole('ping_role', true)}`,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`A CFA Strike Team tryout has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setColor(Colors.DarkButNotBlack)
                    .setDescription(`CFA Strike Team leadership has decided to host a tryout for the subdivision.
If you feel like you are skilled enough to be a part of our elite team, consider attending.

## Tryout rules
- You are required to listen to orders from the tryout host and co-host(s).
- PTS is active. Speaking without permission will result in a kick.
- Your avatar must be blocky, excessive accessories should be removed.
- Disrupting the tryout will result in a kick and a temporary blacklist from the department.

**If you are able to attend this tryout, please react with ✅ to mark your attendance.**
**You are to always attend a tryout you reacted to.**`)
                    .setFields(
                        { name: "Tryout host", value: `${interaction.user}`, inline: true },
                        { name: "Tryout ID", value: uuid, inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        await message.react('✅');

        await client.knex('stTryouts')
            .insert({
                tryout_id: uuid,
                host_id: interaction.user.id,
                message_id: message.id,
                tryout_date: time
            });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully scheduled a tryout.`)
                    .addFields({ name: "Tryout ID", value: `\`\`\`ini\n[ ${uuid} ]\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'start') {
        const tryoutId = interaction.options.getString('tryout_id', true);
        const venueLink = interaction.options.getString('venue_link');
        let desc = ``;
        if (venueLink) desc = `\n## Join the tryout [here](${venueLink}).`;

        const tryout = await client.knex("stTryouts")
            .select("*")
            .where("tryout_id", tryoutId)
            .first();

        if (!tryout || tryout.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Tryout with ID \`${tryoutId}\` is already concluded or does not exist in the database.`)] });

        const tryoutMsg = await tryoutChannel.messages.fetch(tryout.message_id);

        await tryoutMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: `${interaction.options.getRole('ping_role', true)}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`CFA Strike Team - Tryout commencing.`)
                    .setDescription(`A scheduled Strike Team tryout is commencing now. Please ensure that you:
- STS on the spawn pads.
- Have a blocky avatar that does not massively alter your hitboxes.
- Always listen to the host's instructions.
- Show your best!

**You have around 10 minutes to join the tryout.**${desc}`)
                    .setFields({ name: 'Tryout ID', value: tryoutId })
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
                    .setTitle('Success.')
                    .setDescription(`Successfully started the tryout.`)
                    .addFields({ name: "Tryout ID", value: `\`\`\`ini\n[ ${tryoutId} ]\n\`\`\`` })
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'lock') {
        const tryoutId = interaction.options.getString('tryout_id', true);
        const tryout = await client.knex("stTryouts")
            .select("*")
            .where("tryout_id", tryoutId)
            .first();

        if (!tryout || tryout.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Tryout with ID \`${tryoutId}\` is already concluded or does not exist in the database.`)] });

        const msg = await tryoutChannel.messages.fetch(tryout.message_id);

        await msg.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle('CFA Strike Team - Tryout locked.')
                    .setDescription(`A scheduled tryout has been locked and is now in progress!

If you disconnected, please contact the host or co-host to be let back in.
If you didn't make it in time, **attend another tryout.**`)
                    .setFields({ name: 'Tryout ID', value: tryoutId })
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
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('Successfully locked the tryout.')
                    .setFields({ name: 'Tryout ID', value: `\`\`\`ini\n[ ${tryoutId} ]\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'cancel') {
        const tryoutId = interaction.options.getString('tryout_id', true);
        const reason = interaction.options.getString('reason', true);
        const tryout = await client.knex("stTryouts")
            .select("*")
            .where("tryout_id", tryoutId)
            .first();

        if (!tryout || tryout.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Tryout with ID \`${tryoutId}\` is already concluded or does not exist in the database.`)] });

        await client.knex("stTryouts")
            .where("tryout_id", tryoutId)
            .del();

        const msg = await tryoutChannel.messages.fetch(tryout.message_id);

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: `${interaction.options.getRole('ping_role', true)}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Tryout cancelled.')
                    .setDescription(`The above Strike Team tryout has been cancelled.
We sincerely apologize for any inconvenience that this might have caused.`)
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields({ name: "Reason", value: reason })
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
                    .setTitle('Success.')
                    .setDescription(`Successfully cancelled the tryout.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'conclude') {
        const tryoutId = interaction.options.getString('tryout_id', true);
        const tryout = await client.knex("stTryouts")
            .select("*")
            .where("tryout_id", tryoutId)
            .first();

        if (!tryout || tryout.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Tryout with ID \`${tryoutId}\` is already concluded or does not exist in the database.`)] });

        await client.knex("stTryouts")
            .update({ is_concluded: true })
            .where('tryout_id', tryoutId);

        const msg = await tryoutChannel.messages.fetch(tryout.message_id);

        await msg.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Tryout concluded.')
                    .setDescription(`The above CFA Strike Team tryout has been concluded. Thank you for attending!
Please wait while the results are being processed.`)
                    .setThumbnail(interaction.guild.iconURL())
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
                    .setTitle('Success.')
                    .setDescription('Successfully concluded the tryout.')
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'update') {
        const tryoutId = interaction.options.getString('tryout_id', true);
        const tryout = await client.knex("stTryouts")
            .select("*")
            .where("tryout_id", tryoutId)
            .first();

        if (!tryout || tryout.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Tryout with ID \`${tryoutId}\` is already concluded or does not exist in the database.`)] });

        const time = interaction.options.getInteger('new_time', true);

        if (time <= now) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Tryout cannot be rescheduled to the past.')] });

        if (time == tryout.tryout_date) return await interaction.editReply({ embeds: [errorEmbed.setDescription('New tryout time cannot be the same as the old tryout time.')] });

        const tryoutAtThisTime = await client.knex('stTryouts')
            .select('*')
            .where('tryout_date', time)
            .first();

        if (tryoutAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a tryout scheduled for this time.')] });

        await client.knex("stTryouts")
            .update({
                tryout_date: time,
                is_reminded: false
            })
            .where('tryout_id', tryoutId);

        const msg = await tryoutChannel.messages.fetch(tryout.message_id);

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: `${interaction.options.getRole('ping_role', true)}`,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Tryout time updated.')
                    .setDescription(`The above Strike Team tryout time has been updated, the tryout will now be on **<t:${time}:F>**.
Please adjust your availability accordingly.`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor(Colors.DarkAqua)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        await msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(msg.embeds[0].color)
                    .setTitle(`A CFA Strike Team has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setDescription(msg.embeds[0].description)
                    .setFields(msg.embeds[0].fields)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp(new Date(msg.embeds[0].timestamp))
                    .setFooter(msg.embeds[0].footer)
            ]
        });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription('Successfully updated the tryout time.')
                    .setColor(Colors.Green)
                    .addFields({ name: "Tryout ID", value: `\`\`\`ini\n[ ${tryoutId} ]\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }
}
