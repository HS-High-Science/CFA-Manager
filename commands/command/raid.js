// Made by @Danonienko && @StolarchukBoris

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
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
            .setDescription('Starts a raid')
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
            .setDescription('Ends a raid')
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
                    { name: 'ECFR Meltdown', value: 'meltdown' },
                    { name: 'ECFR freezedown', value: 'freezedown' }
                )
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('cancel')
            .setDescription('Cancels a raid')
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
            .setDescription('Allows you to change the time of the raid')
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
        ),

    async execute(interaction) {
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
            })
        };

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

            if (time <= Math.round(Date.now() / 1000)) {
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
                        .setTitle('Chaos Forces Alliance Raid')
                        .setColor(Colors.DarkButNotBlack)
                        .setDescription(`## A raid has been scheduled on <t:${time}:F>.
Before joining at the designated time, please review all the raid rules listed below. Once done, kindly react with the :white_check_mark: emoji to confirm your attendance. **Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the raid you reacted to. Breaking any of these rules can lead to a warning/strike.**

## Raid Rules
- Prior to joining, ensure that you have enough time available at least an hour before the raid begins. We request this to avoid last-minute cancellations within the final 10-30 minutes.
- When you join, enter the Raid tribune (you are not obligated to talk, but you must still be there to at least listen to your teammates). After that, STS on the Chaos Forces spawn and await instructions from the host.
- During the raid, do NOT go AFK or/and leave without notifying the host. Otherwise, you will be removed from the raid and will be punished when it ends. **Don't worry: disconnecting due to a WI-FI/Electricity problem will not get you punished if you rejoin when you can and notify the host about that issue.**
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
                        .setDescription(`The High Science Intelligence Agency has gotten information from our spies inside Chaos Forces Alliance that they are planning to raid the Classified Underground Facility on <t:${time}:F>!

High Science is requesting all available security to react with ✅ to confirm that you are going to deploy on the CPUF when the raid commences and protect the facility at all cost.`)
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
                    host_username: interaction.member.nickname,
                    cfa_message_id: message.id,
                    hsps_message_id: hspsMessage.id,
                    raid_date: time,
                    is_concluded: false
                });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Raid Scheduled!')
                        .setDescription(`The raid has been successfully scheduled!`)
                        .addFields(
                            {
                                name: "Raid ID",
                                value: `\`\`\`ini\n[ ${uuid} ] \`\`\``,
                                inline: true
                            }
                        )
                        .setColor(Colors.Green)
                        .setFooter({
                            text: `Chaos Forces Alliance`,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setTimestamp()
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
                            iconURL: interaction.user.avatarURL()
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
                        .setDescription(`Chaos Forces is commencing a raid on Classified Part Underground Facility! \nAll available security are to immediately deploy and fight off the raid.${desc}`)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                ]
            });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Raid Started!')
                        .setDescription(`The raid has been successfully started!`)
                        .addFields(
                            {
                                name: "Raid ID",
                                value: `\`\`\`ini\n[ ${uuid} ] \`\`\``,
                                inline: true
                            }
                        )
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
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
                        .setTitle('Raid Cancelled!')
                        .setDescription(`The raid has been successfully cancelled!`)
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                ]
            });
        } else if (subcommand === 'end') {
            const raidID = interaction.options.getString('id', true);
            const raid = await client.knex("raids")
                .select("*")
                .where("raid_id", raidID)
                .first();
            const isConcluded = raid.is_concluded;
            const msgID = raid.cfa_message_id;
            const msg = await raidChannel.messages.fetch(`${msgID}`);
            const hspsMsgID = raid.hsps_message_id;
            const hspsMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);

            if (!raid) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No raid with ID \`${raidID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`This raid is already concluded.`)] });
            };

            const outcome = interaction.options.getString("outcome", true);

            switch (outcome) {
                case 'chaos':
                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1094305864317419632>",
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('⭐ Raid Concluded - Chaos Forces Victory ⭐')
                                .setDescription(`The raid has been concluded with a victory of Chaos Forces! \nThe CPUF has been destroyed and the truth about High Science has been revealed. \nThank you for participating in the raid.`)
                                .setColor(Colors.Green)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    });

                    await hspsMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1258844664438718484>",
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('💀 Raid Concluded - Chaos Forces Victory 💾')
                                .setDescription(`The raid has been concluded, HSPS have lost! \nThe CPUF has been destroyed and the classified data has been breached. \nThank you for participating in the raid.`)
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    });
                    break;
                case 'security':
                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1094305864317419632>",
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🛡️ Raid Concluded - HSPS Victory 🛡️')
                                .setDescription(`The raid has been concluded, Chaos Forces have lost! \nThe CPUF is now secured and the classified data is safe. \nThank you for participating in the raid.`)
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    });

                    await hspsMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1258844664438718484>",
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('⭐ Raid Concluded - HSPS Victory ⭐')
                                .setDescription(`The raid has been concluded with a victory of HSPS! \nThe CPUF is now secured and the classified data is safe. \nThank you for participating in the raid.`)
                                .setColor(Colors.Green)
                                .setTimestamp()
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL()
                                })
                        ]
                    });
                    break;
                case 'stalemate':
                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1094305864317419632>",
                        embeds: [
                            new EmbedBuilder()
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
                                })
                        ]
                    });

                    await hspsMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1258844664438718484>",
                        embeds: [
                            new EmbedBuilder()
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
                                })
                        ]
                    });
                    break;
                case 'meltdown':
                    const outcomeEmbed = new EmbedBuilder()
                        .setTitle('🌋 Raid Concluded - ECFR Meltdown 🌋')
                        .setDescription(`The raid has ended as the ECFR has melted down.
The ECFR has entered the thermal runaway state, resulting in a meltdown and explosion!
Because of that, neither side has won this raid.
Thank you for participating in the raid.`)
                        .setColor(Colors.Orange)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        });

                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1094305864317419632>",
                        embeds: [outcomeEmbed]
                    });

                    await hspsMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1258844664438718484>",
                        embeds: [outcomeEmbed]
                    })
                    break;
                case 'freezedown': {
                    const outcomeEmbed = new EmbedBuilder()
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

                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1094305864317419632>",
                        embeds: [outcomeEmbed]
                    });

                    await hspsMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1258844664438718484>",
                        embeds: [outcomeEmbed]
                    })
                    break;
                }
            };

            await client.knex("raids")
                .update({ is_concluded: true })
                .where({ raid_id: raidID });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Conclusion Success!')
                        .setDescription('Raid successfully concluded!')
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
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

            if (time <= Math.round(Date.now() / 1000)) {
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
            const hspsRaidMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`)

            await client.knex("raids")
                .update({ raid_date: time })
                .where({ raid_id: raidID });

            const timeChangeEmbed = new EmbedBuilder()
                .setTitle('Raid Time Changed')
                .setDescription(`## The raid time has been changed, the raid will now be on <t:${time}:F>.
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

            await hspsRaidMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: "<@&1258844664438718484>",
                embeds: [timeChangeEmbed]
            });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Time Change Success!')
                        .setDescription('Raid time changed successfully!')
                        .setColor(Colors.Green)
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
