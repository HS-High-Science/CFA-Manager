// Made by @Danonienko && @StolarchukBoris

import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Allows you to interact with a Chaos Forces raid on CPUF')
    .addSubcommand(subCommand => subCommand
        .setName('schedule')
        .setDescription('Schedule a raid on CPUF')
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('The time at which the raid will take place (UNIX)')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('start')
        .setDescription('Start a raid.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the raid you want to start')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('venue_link')
            .setDescription(`The link to this raid's venue`)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('end')
        .setDescription('End a raid.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the raid that you want to end')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('outcome')
            .setDescription('What is the outcome of this raid?')
            .setRequired(true)
            .setChoices(
                { name: 'Chaos Forces Win', value: 'chaos' },
                { name: 'High Science Private Security Win', value: 'security' },
                { name: 'Stalemate', value: 'stalemate' },
                { name: 'ECFR Instability', value: 'instability' },
                { name: 'ECFR freezedown', value: 'freezedown' }
            )
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('cancel')
        .setDescription('Cancel a raid.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the raid that you want to cancel')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for cancelling the raid')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('update')
        .setDescription('Update the raid information.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the raid you want to change')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('new_time')
            .setDescription('New time for the raid (UNIX)')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_add')
        .setDescription('Create a raid log for a person.')
        .addStringOption(option => option
            .setName('raid_id')
            .setDescription('The ID of the raid you want to log.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('log')
            .setDescription('The log itself. You can add multiple logs by separating them with a semicolon ;')
            .setRequired(true)
        )
        .addUserOption(option => option
            .setName('participant')
            .setDescription('Raid participant. Ignore to submit a raid summary.')
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_remove')
        .setDescription('Delete a person\'s raid log.')
        .addStringOption(option => option
            .setName('log_id')
            .setDescription('The ID of the log you want to delete.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_edit')
        .setDescription('Edit a person\'s raid log. WARNING: this overwrites the log entirely.')
        .addStringOption(option => option
            .setName('log_id')
            .setDescription('The ID of the log you want to edit. WARNING: this overwrites the log entirely.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('updated_log')
            .setDescription('The updated log.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_view')
        .setDescription('View the raid log(s). Please use at least one search option.')
        .addStringOption(option => option
            .setName('log_id')
            .setDescription('View the log by its ID.')
        )
        .addStringOption(option => option
            .setName('raid_id')
            .setDescription('View the logs for a certain raid. You can combine this option with participant option.')
        )
        .addUserOption(option => option
            .setName('participant')
            .setDescription('View the person\'s raid logs. You can combine this option with raid_id option.')
        )
    );

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const client = await interaction.client;
    const allowedIDs = ["1268226274401193984", "1157806062070681600", "846692755496763413", "1066470548399468644", "1248632771900084286"]; // raid hosting perms, something else, lead insurgent, strike team

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

    const now = Math.floor(Date.now() / 1000);
    const subcommand = interaction.options.getSubcommand();
    const uuid = crypto.randomUUID();
    const raidChannel = interaction.guild.channels.cache.get('1116696712061394974');
    const hspsRaidChannel = client.channels.cache.get('1317426517302841424');
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

        if (time <= now) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Raid cannot be scheduled in the past.')] });

        const raidAtThisTime = await client.knex('raids')
            .select('*')
            .where('raid_date', time)
            .first();

        if (raidAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a raid scheduled for this time.')] });

        const message = await raidChannel.send({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1094305864317419632>",
            embeds: [
                new EmbedBuilder()
                    .setTitle(`A raid has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setColor(Colors.DarkButNotBlack)
                    .setDescription(`Before joining at the designated time, please review all the raid rules listed below. Once done, kindly react with the :white_check_mark: emoji to confirm your attendance. **Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the raid you reacted to. Breaking any of these rules can lead to a warning/strike.**

## Raid Rules
- Prior to joining, ensure that you have enough time available at least an hour before the raid begins. We request this to avoid last-minute cancellations within the final 10-30 minutes.
- When you join, enter the <#1235182782011932713> (you are not obligated to talk, but you must still be there to at least listen to your teammates). After that, STS at the Chaos Forces spawn and await instructions from the host.
- During the raid, do NOT go AFK and/or leave without notifying the host. Otherwise, you will be removed from the raid and will be punished when it ends. **Don't worry: disconnecting due to a WI-FI/Electricity problem will not get you punished if you rejoin when you can and if you notify the host about that issue.**
- Always listen to the orders of higher ranks. You can talk freely during the raid, but **please do not talk while the host explains the plan.**
- All CF rules apply to the raid, including the ban of any toxicity.`)
                    .setFields(
                        { name: "Raid host", value: `${interaction.user}`, inline: true },
                        { name: "Raid ID", value: uuid, inline: true }
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

        const hspsMessage = await hspsRaidChannel.send({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1258844664438718484>",
            embeds: [
                new EmbedBuilder()
                    .setTitle('Chaos Forces Alliance Raid')
                    .setColor(Colors.DarkButNotBlack)
                    .setDescription(`The High Science Intelligence Agency has gotten information from our spies inside Chaos Forces Alliance that they are planning to raid the Classified Underground Facility on **<t:${time}:F>**!

High Science is requesting all available security to react with ✅ to confirm that you are going to deploy on the CPUF when the raid commences and protect the facility at all costs.`)
                    .setFields({ name: "Raid host", value: `${interaction.user}` })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        await hspsMessage.react('✅');

        await client.knex('raids')
            .insert({
                raid_id: uuid,
                host_id: interaction.user.id,
                cfa_message_id: message.id,
                hsps_message_id: hspsMessage.id,
                raid_date: time,
                is_concluded: false
            });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully scheduled a raid.`)
                    .addFields({ name: "Raid ID", value: `\`\`\`ini\n[ ${uuid} ]\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'start') {
        const raidID = interaction.options.getString('id', true);
        const venueLink = interaction.options.getString('venue_link');
        let desc = ``;
        if (venueLink) desc = `\n## Join the raid [here](${venueLink}).`;

        const raid = await client.knex("raids")
            .select("*")
            .where("raid_id", raidID)
            .first();

        if (!raid || raid.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Raid with ID \`${raidID}\` is already concluded or does not exist in the database.`)] });

        const msgID = raid.cfa_message_id;
        const raidMsg = await raidChannel.messages.fetch(msgID);

        await raidMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1094305864317419632>',
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`Chaos Forces Alliance - Raid commencing.`)
                    .setDescription(`A scheduled raid is now commencing. Please ensure that you:
- STS at the spawn.
- Have no avatar that massively alters your hitboxes.
- Always listen to the host's instructions.
- Join the Raid tribune.${desc}`)
                    .setFields({ name: 'Raid ID', value: raidID })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const hspsMsgID = raid.hsps_message_id;
        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(hspsMsgID);

        await hspsRaidMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1258844664438718484>',
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`🚨 CPUF IS UNDER ATTACK 🚨`)
                    .setDescription(`Chaos Forces Alliance is commencing a raid on Classified Part Underground Facility! \nAll available security are to immediately deploy and fight off the attack.${desc}`)
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
                    .setDescription(`Successfully started the raid.`)
                    .addFields({ name: "Raid ID", value: `\`\`\`ini\n[ ${raidID} ]\n\`\`\`` })
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'cancel') {
        const raidID = interaction.options.getString('id', true);
        const reason = interaction.options.getString('reason', true);
        const raid = await client.knex("raids")
            .select("*")
            .where("raid_id", raidID)
            .first();

        if (!raid || raid.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Raid with ID \`${raidID}\` is already concluded or does not exist in the database.`)] });

        await client.knex("raids")
            .where("raid_id", raidID)
            .del();

        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(msgID);

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1094305864317419632>",
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Raid cancelled.')
                    .setDescription(`The above raid has been cancelled.
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

        const hspsMsgID = raid.hsps_message_id;
        const hspsMsg = await hspsRaidChannel.messages.fetch(hspsMsgID);

        await hspsMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1258844664438718484>",
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Raid cancelled.')
                    .setDescription(`The High Science Intelligence Agency have gotten new information that Chaos Forces have cancelled their planned raid. \n\nThe CPUF is safe, for now at least...`)
                    .addFields({ name: "Reason", value: reason })
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
                    .setDescription(`Successfully cancelled the raid.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'end') {
        const raidID = interaction.options.getString('id', true);
        const raid = await client.knex("raids")
            .select("*")
            .where("raid_id", raidID)
            .first();

        if (!raid || raid.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Raid with ID \`${raidID}\` is already concluded or does not exist in the database.`)] });

        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(msgID);
        const hspsMsgID = raid.hsps_message_id;
        const hspsMsg = await hspsRaidChannel.messages.fetch(hspsMsgID);

        await client.knex("raids")
            .update({ is_concluded: true })
            .where({ raid_id: raidID });

        const outcome = interaction.options.getString("outcome", true);
        let outcomeEmbed;
        let hspsOutcomeEmbed;

        switch (outcome) {
            case 'chaos':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('⭐ Raid concluded - Chaos Forces victory ⭐')
                    .setDescription(`The raid has been concluded with a victory of Chaos Forces Alliance! \nThe CPUF has been destroyed and the truth about High Science has been revealed. \nThank you for participating in the raid.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = new EmbedBuilder()
                    .setTitle('💀 Raid concluded - Chaos Forces victory 💾')
                    .setDescription(`The raid has been concluded, HSPS have lost! \nThe CPUF has been destroyed and the classified data has been breached. \nThank you for participating in the raid.`)
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                break;
            case 'security':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('🛡️ Raid concluded - HSPS victory 🛡️')
                    .setDescription(`The raid has been concluded, Chaos Forces have lost! \nThe CPUF is now secured and the classified data is safe. \nThank you for participating in the raid.`)
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = new EmbedBuilder()
                    .setTitle('⭐ Raid concluded - HSPS victory ⭐')
                    .setDescription(`The raid has been concluded with a victory of HSPS! \nThe CPUF is now secured and the classified data is safe. \nThank you for participating in the raid.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                break;
            case 'stalemate':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('⛓️ Raid concluded - Stalemate ⛓️')
                    .setDescription(`The raid has been concluded with a stalemate.
Chaos Forces were able to destroy the facility, but HSPS have managed to protect the data!
With no data, we cannot reveal the truth about High Science.
Thank you for participating in the raid.`)
                    .setColor(Colors.Aqua)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = new EmbedBuilder()
                    .setTitle('⛓️ Raid concluded - Stalemate ⛓️')
                    .setDescription(`The raid has been concluded with a stalemate.
HSPS have successfully protected the data, but Chaos Forces have destroyed the facility!
Even though the facility has been destroyed, the data is secure, rendering Chaos Forces unable to reveal the truth.
Thank you for participating in the raid.`)
                    .setColor(Colors.Aqua)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                break;
            case 'instability':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('🌋 Raid concluded - ECFR instability 🌋')
                    .setDescription(`The raid has ended as the ECFR has gone unstable.
The ECFR has entered the thermal runaway state, resulting in loss of stability and detonation!
Because of that, neither side has won this raid.
Thank you for participating in the raid.`)
                    .setColor(Colors.Orange)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = outcomeEmbed;

                break;
            case 'freezedown':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('❄️ Raid concluded - ECFR freezedown ❄️')
                    .setDescription(`The raid has ended with the ECFR freezedown!
The ECFR temperature has reached a point of no return, after which the reactor has turned into a giant black hole and consumed everything!
Because of that, neither side has won this raid.
Thank you for participating in the raid.`)
                    .setColor(Colors.Orange)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = outcomeEmbed;

                break;
        }

        await msg.reply({ embeds: [outcomeEmbed] });
        await hspsMsg.reply({ embeds: [hspsOutcomeEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription('Successfully concluded the raid.')
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'update') {
        const raidID = interaction.options.getString('id', true);
        const raid = await client.knex("raids")
            .select("*")
            .where("raid_id", raidID)
            .first();

        if (!raid || raid.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Raid with ID \`${raidID}\` is already concluded or does not exist in the database.`)] });

        const time = interaction.options.getInteger('new_time', true);

        if (time <= now) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Raid cannot be rescheduled to the past.')] });

        if (time == raid.raid_date) return await interaction.editReply({ embeds: [errorEmbed.setDescription('New raid time cannot be the same as the old raid time.')] });

        const raidAtThisTime = await client.knex('raids')
            .select('*')
            .where('raid_date', time)
            .first();

        if (raidAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a raid scheduled for this time.')] });

        await client.knex("raids")
            .update({ raid_date: time })
            .where({ raid_id: raidID });

        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(msgID);
        const hspsMsgID = raid.hsps_message_id;
        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(hspsMsgID);
        const timeChangeEmbed = new EmbedBuilder()
            .setTitle('Raid time updated.')
            .setDescription(`The above raid time has been updated, the raid will now be on **<t:${time}:F>**.
Please adjust your availability accordingly.`)
            .setThumbnail(interaction.guild.iconURL())
            .setColor(Colors.DarkAqua)
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1094305864317419632>",
            embeds: [timeChangeEmbed]
        });

        await msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(msg.embeds[0].color)
                    .setTitle(`A raid has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setDescription(msg.embeds[0].description)
                    .setFields(msg.embeds[0].fields)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp(new Date(msg.embeds[0].timestamp))
                    .setFooter(msg.embeds[0].footer)
            ]
        });

        await hspsRaidMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1258844664438718484>",
            embeds: [timeChangeEmbed]
        });

        await hspsRaidMsg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(hspsRaidMsg.embeds[0].color)
                    .setTitle(hspsRaidMsg.embeds[0].title)
                    .setDescription(`The High Science Intelligence Agency has gotten information from our spies inside Chaos Forces Alliance that they are planning to raid the Classified Underground Facility on **<t:${time}:F>**!

High Science is requesting all available security to react with ✅ to confirm that you are going to deploy on the CPUF when the raid commences and protect the facility at all costs.`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp(new Date(hspsRaidMsg.embeds[0].timestamp))
                    .setFooter(hspsRaidMsg.embeds[0].footer)
            ]
        });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription('Successfully updated the raid time.')
                    .setColor(Colors.Green)
                    .addFields({ name: "Raid ID", value: `\`\`\`ini\n[ ${raidID} ]\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'log_add') {
        // log commands are complicated, so i will leave comments
        const raidId = interaction.options.getString('raid_id', true);
        const existingRaid = await client.knex('raids') // check if the supplied raid id exists in the database
            .select('*')
            .where('raid_id', raidId)
            .first();

        if (!existingRaid) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidId}\` has been found in the database.`)] });

        const user = interaction.options.getUser('participant')?.id ?? 'summary';
        const content = interaction.options.getString('log', true);
        let uuid;

        // check for already existing raid log or summary
        const existingLog = await client.knex('raidlogs')
            .select('*')
            .where('raid_id', raidId)
            .andWhere('operative_id', user)
            .first();

        if (!existingLog) { // if no log exists, create one
            uuid = crypto.randomUUID();

            await client.knex('raidlogs')
                .insert({
                    log_id: uuid,
                    raid_id: raidId,
                    operative_id: user,
                    contents: content,
                    writer_id: interaction.user.id,
                    log_date: now
                });
        } else { // otherwise, edit it
            await client.knex('raidlogs')
                .update({
                    contents: existingLog.contents.concat(`;${content}`),
                    writer_id: interaction.user.id,
                    log_date: now
                })
                .where('log_id', existingLog.log_id);
        }

        // if user option is omitted, subject will be summary, otherwise it will be a user mentionable
        const subject = user === 'summary' ? 'summary' : `<@${user}>`;

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully added a raid log (${subject}).`)
                    .setFields(
                        { name: 'Log ID', value: existingLog?.log_id ?? uuid, inline: true },
                        { name: 'Raid ID', value: raidId, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'log_remove') {
        const logId = interaction.options.getString('log_id', true);
        const existingLog = await client.knex('raidlogs') // make sure the supplied log id exists in the database
            .select('*')
            .where('log_id', logId)
            .first();

        if (!existingLog) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid log with ID \`${logId}\` has been found in the database.`)] });

        await client.knex('raidlogs') // delete a log
            .del()
            .where('log_id', logId);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully deleted a log.`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'log_edit') {
        const logId = interaction.options.getString('log_id', true);
        const existingLog = await client.knex('raidlogs') // make sure the supplied log id exists in the database
            .select('*')
            .where('log_id', logId)
            .first();

        if (!existingLog) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid log with ID \`${logId}\` has been found in the database.`)] });

        const content = interaction.options.getString('updated_log', true);

        await client.knex('raidlogs') // update the existing log with new content
            .update({
                contents: content,
                writer_id: interaction.user.id,
                log_date: now
            })
            .where('log_id', logId);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully updated a raid log.`)
                    .setFields(
                        { name: 'Log ID', value: existingLog.log_id, inline: true },
                        { name: 'Raid ID', value: existingLog.raid_id, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'log_view') {
        const logId = interaction.options.getString('log_id');
        const raidId = interaction.options.getString('raid_id');
        const user = interaction.options.getUser('participant')?.id ?? 'summary';

        // if no options have been supplied, throw an error
        if (!(logId || raidId)) return await interaction.editReply({ embeds: [errorEmbed.setDescription('No raid ID or log ID have been provided.\nPlease specify either of these options.')] });

        if (logId) { // if log id option has been supplied, output the respective log if it exists
            const log = await client.knex('raidlogs')
                .select('*')
                .where('log_id', logId)
                .first();

            if (!log) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid log with ID \`${logId}\` has been found in the database.`)] });

            const contents = log.contents.split(';'); // split a database log string into multiple smaller ones

            let logs = ``;
            for (const fragment of contents) { // assemble all pieces of log into a single string
                logs = logs.concat(`\n${fragment}`);
            }

            // define who/what the log is about
            const subject = log.operative_id === 'summary' ? 'SUMMARY' : `<@${log.operative_id}>`;

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle('Raid log found.')
                        .setDescription(`Found a raid log with ID \`${logId}\`:

${subject} (By <@${log.writer_id}> @ <t:${log.log_date}:f>)
\`\`\`diff${logs}
\`\`\`
`)
                        .setFields({ name: 'Raid ID', value: log.raid_id })
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });
        } else if (raidId && user === 'summary') { // if only the raid id option has been supplied, display all logs for that raid, if it exists
            const logs = await client.knex('raidlogs')
                .select('*')
                .where('raid_id', raidId)
                .orderBy('operative_id', 'asc');

            if (logs.length === 0) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid logs have been found for raid with ID \`${raidId}\`.`)] });

            let desc = ``;
            for (const log of logs) { // make a string that contains all logs and info about them
                const contents = log.contents.split(';'); // split a database log string into smaller ones

                let logstring = ``; // i am running out of names here
                for (const fragment of contents) { // assemble a string list with all those smaller logs
                    logstring = logstring.concat(`\n${fragment}`);
                }

                // define who/what the log is about
                const subject = log.operative_id === 'summary' ? 'SUMMARY' : `<@${log.operative_id}>`;

                desc = desc.concat(`${subject} (By <@${log.writer_id}> @ <t:${log.log_date}:f>)
\`\`\`diff${logstring}
(${log.log_id})
\`\`\`
`)
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle('Raid logs found.')
                        .setDescription(`Found raid logs for raid \`${raidId}\`:\n\n${desc}`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        } else if (raidId && user !== 'summary') { // if raid id and user options have been supplied, select the logs that would satisfy both queries
            const logs = await client.knex('raidlogs')
                .select('*')
                .where('raid_id', raidId);

            if (logs.length === 0) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid logs have been found for raid with ID \`${raidId}\`.`)] });

            const personalLogs = [];

            for (const log of logs) { // if a log is about the supplied operative, append it to the personalLogs array
                if (log.operative_id === user) {
                    personalLogs.push(log);
                }
            }

            let desc = ``;
            for (const log of personalLogs) { // form a string list of collected logs
                const contents = log.contents.split(';'); // split a database log string into smaller ones

                let logstring = ``;
                for (const fragment of contents) { // assemble a string list with all those smaller logs
                    logstring = logstring.concat(`\n${fragment}`);
                }

                desc = desc.concat(`
\`\`\`diff${logstring}
(${log.log_id})
\`\`\`
By <@${log.writer_id}> @ <t:${log.log_date}:f>
`)
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle('Raid logs found.')
                        .setDescription(`Found raid logs for <@${user}> on raid \`${raidId}\`:\n${desc}`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        } else if (user !== 'summary' && !raidId) { // if only the user option has been supplied, select raid logs about that user
            const logs = await client.knex('raidlogs')
                .select('*')
                .where('operative_id', user);

            if (logs.length === 0) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid logs have been found for ${user}.`)] });

            let desc = ``;
            for (const log of logs) { // form a string list of all collected logs
                const contents = log.contents.split(';'); // split a database log string into smaller ones

                let logstring = ``;
                for (const fragment of contents) { // assemble a string list with all those smaller logs
                    logstring = logstring.concat(`\n${fragment}`);
                }

                desc = desc.concat(`\`\`\`diff${logstring}
(${log.log_id})
\`\`\`
By <@${log.writer_id}> @ <t:${log.log_date}:f>
`)
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle('Raid logs found.')
                        .setDescription(`Found raid logs for <@${user}>:\n${desc}`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });
        }
    }
}
