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
        .addUserOption(option => option
            .setName('participant')
            .setDescription('The raid participant you want to add to a log.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('log')
            .setDescription('The log itself.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_remove')
        .setDescription('Delete a raid log for a person.')
        .addStringOption(option => option
            .setName('log_id')
            .setDescription('The ID of the log you want to delete.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName('log_edit')
        .setDescription('Edit a raid log for a person.')
        .addStringOption(option => option
            .setName('log_id')
            .setDescription('The ID of the raid you want to log.')
            .setRequired(true)
        )
        .addUserOption(option => option
            .setName('participant')
            .setDescription('The raid participant whose log you want to edit.')
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
            .setDescription('View the logs for a certain raid.')
        )
        .addUserOption(option => option
            .setName('participant')
            .setDescription('View the person\'s raid logs.')
        )
    );
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const client = await interaction.client;
    const allowedIDs = ["1157806062070681600", "846692755496763413", "1066470548399468644", "1248632771900084286"]; // raid hosting perms, something else, lead insurgent, strike team

    if (!interaction.member.roles.cache.hasAny(...allowedIDs)) {
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
        });
    };

    const now = Math.floor(Date.now() / 1000);
    const subcommand = interaction.options.getSubcommand();
    const uuid = crypto.randomUUID();
    const raidChannel = await interaction.guild.channels.cache.get('1116696712061394974');
    const hspsRaidChannel = await client.channels.cache.get('1317426517302841424');
    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle('Error!')
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    if (subcommand === 'schedule') {
        const time = await interaction.options.getInteger('time', true);

        if (time <= now) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription('Raid cannot be scheduled in the past.')] });
        };

        const raidAtThisTime = await client.knex('raids')
            .select('*')
            .where('raid_date', time)
            .first();

        if (raidAtThisTime) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a raid scheduled for this time.')] });
        };

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
                        { name: "Raid Host", value: `<@${interaction.user.id}>`, inline: true },
                        { name: "Raid ID", value: `${uuid}`, inline: true }
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
                    .setFields({ name: "Raid Host", value: `<@${interaction.user.id}>` })
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
                    .setTitle('Success!')
                    .setDescription(`The raid has been successfully scheduled!`)
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
        if (venueLink) {
            desc = `\n## Join the raid [here](${venueLink}).`;
        };

        const raid = await client.knex("raids")
            .select("*")
            .where("raid_id", raidID)
            .first();

        const isConcluded = raid.is_concluded;

        if (!raid) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidID}\` has been found in the database.`)] });
        };

        if (isConcluded === 1) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`This raid is already concluded.`)] });
        };

        const msgID = raid.cfa_message_id;
        const raidMsg = await raidChannel.messages.fetch(`${msgID}`);

        await raidMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1094305864317419632>',
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`Chaos Forces Alliance - Raid Commencing`)
                    .setDescription(`A scheduled raid is now commencing. Please ensure that you:
- STS at the spawn.
- Have no avatar that massively alters your hit-box.
- Always listen to the host's instructions.
- Join the Raid tribune.${desc}`)
                    .setFields({ name: 'Raid ID', value: `${raidID}` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const hspsMsgID = raid.hsps_message_id;
        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);

        await hspsRaidMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1258844664438718484>',
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(`🚨 CPUF IS UNDER ATTACK 🚨`)
                    .setDescription(`Chaos Forces is commencing a raid on Classified Part Underground Facility! \nAll available security are to immediately deploy and fight off the attack.${desc}`)
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
                    .setTitle('Success!')
                    .setDescription(`The raid has been successfully started!`)
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
        const isConcluded = raid.is_concluded;

        if (!raid) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidID}\` has been found in the database.`)] });
        };

        if (isConcluded === 1) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`This raid is already concluded.`)] });
        };

        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(`${msgID}`);

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1094305864317419632>",
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Raid Cancelled!')
                    .setDescription(`The above raid has been cancelled.
We sincerely apologize for any inconvenience that this might have caused.`)
                    .setThumbnail(interaction.guild.iconURL())
                    .addFields({ name: "Reason", value: `${reason}` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const hspsMsgID = raid.hsps_message_id;
        const hspsMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);

        await hspsMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1258844664438718484>",
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Raid Cancelled!')
                    .setDescription(`The High Science Intelligence Agency have gotten new information that Chaos Forces have cancelled their planned raid. \n\nThe CPUF is safe, for now at least...`)
                    .addFields({ name: "Reason", value: `${reason}` })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        await client.knex("raids")
            .where("raid_id", raidID)
            .del();

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription(`The raid has been successfully cancelled!`)
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

        if (!raid) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidID}\` has been found in the database.`)] });
        };

        const isConcluded = raid.is_concluded;
        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(`${msgID}`);
        const hspsMsgID = raid.hsps_message_id;
        const hspsMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);

        if (isConcluded === 1) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription(`This raid is already concluded.`)] });
        };

        await client.knex("raids")
            .update({ is_concluded: true })
            .where({ raid_id: raidID });

        const outcome = interaction.options.getString("outcome", true);
        let outcomeEmbed;
        let hspsOutcomeEmbed;

        switch (outcome) {
            case 'chaos':
                outcomeEmbed = new EmbedBuilder()
                    .setTitle('⭐ Raid Concluded - Chaos Forces Victory ⭐')
                    .setDescription(`The raid has been concluded with a victory of Chaos Forces! \nThe CPUF has been destroyed and the truth about High Science has been revealed. \nThank you for participating in the raid.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = new EmbedBuilder()
                    .setTitle('💀 Raid Concluded - Chaos Forces Victory 💾')
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
                    .setTitle('🛡️ Raid Concluded - HSPS Victory 🛡️')
                    .setDescription(`The raid has been concluded, Chaos Forces have lost! \nThe CPUF is now secured and the classified data is safe. \nThank you for participating in the raid.`)
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });

                hspsOutcomeEmbed = new EmbedBuilder()
                    .setTitle('⭐ Raid Concluded - HSPS Victory ⭐')
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
                    .setTitle('⛓️ Raid Concluded - Stalemate ⛓️')
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
                    .setTitle('⛓️ Raid Concluded - Stalemate ⛓️')
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
                    .setTitle('🌋 Raid Concluded - ECFR Instability 🌋')
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
                    .setTitle('❄️ Raid Concluded - ECFR Freezedown ❄️')
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
        };

        await msg.reply({ embeds: [outcomeEmbed] });
        await hspsMsg.reply({ embeds: [hspsOutcomeEmbed] });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription('Raid successfully concluded!')
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
        const time = interaction.options.getInteger('new_time', true);

        if (time == raid.raid_date) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription('New raid time cannot be the same as the old raid time.')] });
        }

        if (time <= now) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription('Raid cannot be rescheduled to the past.')] });
        };

        const raidAtThisTime = await client.knex('raids')
            .select('*')
            .where('raid_date', time)
            .first();

        if (raidAtThisTime) {
            return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a raid scheduled for this time.')] });
        };

        const msgID = raid.cfa_message_id;
        const msg = await raidChannel.messages.fetch(`${msgID}`);
        const hspsMsgID = raid.hsps_message_id;
        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);

        await client.knex("raids")
            .update({ raid_date: time })
            .where({ raid_id: raidID });

        const timeChangeEmbed = new EmbedBuilder()
            .setTitle('Raid Time Updated')
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
                    .setThumbnail(interaction.guild.iconURL())
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
                    .setFooter(hspsRaidMsg.embeds[0].footer)
            ]
        });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription('Raid time updated successfully!')
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
        const raidId = interaction.options.getString('raid_id', true);
        const existingRaid = await client.knex('raids')
            .select('*')
            .where('raid_id', raidId)
            .first();

        if (!existingRaid) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidId}\` has been found in the database.`)] });

        const user = interaction.options.getUser('participant', true);
        const content = interaction.options.getString('log', true);
        const existingLog = await client.knex('raidlog') // check for already existing log for that user on that raid
            .select('*')
            .where('raid_id', raidId)
            .andWhere('operative_id', user.id)
            .first();

        if (existingLog) return await interaction.editReply({
                embeds: [
                    errorEmbed
                        .setDescription('A log for this person on this raid already exists.\nPlease use "/raid log_edit" command if you wish to edit this log.')
                        .addFields({ name: 'Log ID', value: existingLog.id })
                ]
            });

        const uuid = crypto.randomUUID();

        await client.knex('raidlogs')
            .insert({
                log_id: uuid,
                raid_id: raidId,
                operative_id: user.id,
                log_contents: content,
                log_writer: interaction.user.id,
                log_date: now
            });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully added a log for ${user}.`)
                    .setFields(
                        { name: 'Log ID', value: uuid, inline: true },
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
        const existingLog = await client.knex('raidlogs')
            .select('*')
            .where('log_id', logId)
            .first();

        if (!existingLog) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid log with ID \`${logId} has been found in the database.`)] });

        await client.knex('raidlogs')
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
        const user = interaction.options.getUser('participant', true);
        const existingLog = await client.knex('raidlogs')
            .select('*')
            .where('log_id', logId)
            .andWhere('operative_id', user.id)
            .first();

        if (!existingLog) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid log with ID \`${logId} for ${user} has been found in the database.`)] });

        const content = interaction.options.getString('updated_log', true);

        await client.knex('raidlogs')
            .update({
                log_contents: content,
                log_writer: interaction.user.id,
                log_date: now
            })
            .where('log_id', logId);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription(`Successfully updated a raid log for ${user}.`)
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
        const user = interaction.options.getUser('participant');

        if (!(logId || raidId || user)) return await interaction.editReply({ embeds: [errorEmbed.setDescription('No options have been specified for log search.\nPlease specify at least one option.')] });

        let log;
        if (logId) {
            log = await client.knex('raidlogs')
                .select('*')
                .where('log_id', logId)
                .first();

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle('Raid log found')
                        .setDescription(`Found a raid log with ID \`${logId}.
This log is for <@${log.operative_id}>.
\`\`\`diff
${log.log_contents}
\`\`\`
Written by ${log.log_writer} on <t:${log.log_date}:f>.`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        }

        // TODO: search logic for raidId and user options
    }
}