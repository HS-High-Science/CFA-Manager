// Made by @Danonienko

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid')
        .setDescription('Allows you to schedule, start, end and cancel a Chaos Forces raid on CPUF')
        .addSubcommand(subCommand => subCommand
            .setName('schedule')
            .setDescription('Schedule a raid on CPUF')
            .addIntegerOption(option => option
                .setName('time')
                .setDescription('The time at which the raid will take place')
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
                .setName('winner')
                .setDescription('Which side won the raid?')
                .setRequired(true)
                .setChoices(
                    { name: 'Chaos Forces', value: 'chaos' },
                    { name: 'High Science Private Security', value: 'security' },
                    { name: 'Stalemate', value: 'stalemate' }
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
            .setName('change-time')
            .setDescription('Allows you to change the time of the raid')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The ID of the raid you want to change')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('time')
                .setDescription('New time for the raid')
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const client = await interaction.client;
            const raidID = interaction.options.getString('id');
            const allowedIDs = ["1157806062070681600", "846692755496763413"]

            if (!interaction.member.roles.cache.hasAny(...allowedIDs)) {
                return interaction.editReply({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setTitle('Permission Denied!')
                                .setDescription('You do not have the required permissions to use this command!')
                                .setColor(Colors.Red)
                                .setFooter({
                                    text: `Chaos Forces Alliance`,
                                    iconURL: interaction.guild.iconURL()
                                })
                                .setTimestamp()
                        ]
                })
            }

            const subCommand = await interaction.options.getSubcommand();
            const uuid = crypto.randomUUID();
            const raidChannel = await interaction.guild.channels.cache.get('1116696712061394974');
            const hspsRaidChannel = await client.channels.cache.get('1055486389250162779');

            switch (subCommand) {
                case 'schedule':
                    {
                        const time = await interaction.options.getInteger('time');
                        const scheduleEmbed = new EmbedBuilder()
                            .setTitle('Chaos Forces Alliance Raid')
                            .setColor(Colors.DarkButNotBlack)
                            .setDescription(`A raid has been scheduled on <t:${time}:f>. Before joining at the designated time, please review all the raid rules listed below. Once done, kindly react to the :white_check_mark: emoji to confirm your attendance. **Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the raid you reacted to. Breaking any of these 2 rules can lead to a warning/strike.** 

## Raid Rules
- Prior to joining, ensure that you have enough time available at least an hour before the raid begins. We request this to avoid last-minute cancellations within the final 10-30 minutes.
- When you join, enter the Raiding tribune (you are not obligated to talk, but you must still be there to at least listen to your teammates). After that, STS on the Chaos Forces spawn and await intructions from the host.
- During the raid, do NOT go AFK or/and leave without notifying the host. Otherwise, you will be removed from the raid and will be punished when it ends. **Don't worry: disconnecting due to a WI-FI/Electricity problem will not get you punished if you rejoin when you can and notify the host about that issue.**
- Always listen to the orders of higher ranks. You can talk freely during the raid, but **please do not talk while the host explains the plan.**
- All CF rules apply to the raid, including the ban of any toxicity.`)
                            .setFields({
                                name: "Raid Scheduled By",
                                value: `<@${interaction.user.id}>`
                            })
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .setFooter({
                                text: "Raid ID: " + uuid,
                                iconURL: interaction.user.avatarURL()
                            })

                        const message = await raidChannel.send({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1094305864317419632>",
                            embeds: [scheduleEmbed]
                        });

                        await message.react('✅')

                        const hspsScheduleEmbed = new EmbedBuilder()
                            .setTitle('Chaos Forces Alliance Raid')
                            .setColor(Colors.DarkButNotBlack)
                            .setDescription(`The High Science Intelligence Agency has gotten information from our spies inside Chaos Forces Alliance that they are planning to raid the Classified Underground Facility on <t:${time}:f>

High Science is requesting all available security to react with ✅ to confirm that you are going to deploy on the CPUF when raid commences and protect the facility at all cost.`)
                            .setFields({
                                name: "Raid Scheduled By",
                                value: `<@${interaction.user.id}>`
                            })
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .setFooter({
                                text: "Raid ID: " + uuid,
                                iconURL: interaction.user.avatarURL()
                            });

                        const hspsMessage = await hspsRaidChannel.send({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1233351676186853407>",
                            embeds: [hspsScheduleEmbed]
                        });

                        await hspsMessage.react('✅')


                        await client.knex('raids')
                            .insert({
                                raid_id: uuid,
                                host_username: interaction.member.nickname,
                                cfa_message_id: message.id,
                                hsps_message_id: hspsMessage.id,
                                raid_date: time,
                                is_concluded: false
                            })

                        return interaction.editReply({
                            embeds:
                                [
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
                    }
                case 'start':
                    {
                        const result = await client.knex("raids")
                            .select("*")
                            .where("raid_id", raidID)
                        const isConcluded = await result.map((id) => id.is_concluded);

                        if (result.length === 0) {
                            return interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Error!')
                                        .setDescription(`No raid with raid ID \`${raidID}\` has been found in the database`)
                                        .setColor(Colors.Yellow)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                            })
                        }
                        if (isConcluded[0] === 1) {
                            return interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Error!')
                                        .setDescription(`The raid with raid ID \`${raidID}\` has already been concluded`)
                                        .setColor(Colors.Yellow)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                            })
                        }
                        const msgID = await result.map((id) => id.cfa_message_id);
                        const raidMsg = await raidChannel.messages.fetch(`${msgID[0]}`)

                        const startEmbed = new EmbedBuilder()
                            .setColor(Colors.DarkGreen)
                            .setThumbnail(interaction.guild.iconURL())
                            .setTitle(`Chaos Forces Alliance - Raid Commencing`)
                            .setDescription(`A scheduled raid is now commencing. Please ensure that you:
- STS at the spawn.
- Have no avatar that massively alters your hit-box.
- Join the Raiding tribune.`)
                            .setTimestamp()
                            .setFooter({
                                text: `Raid ID: ${raidID}`,
                                iconURL: interaction.user.avatarURL()
                            })

                        await raidMsg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: '<@&1094305864317419632>',
                            embeds: [startEmbed]
                        })

                        const hspsMsgID = result.map((id) => id.hsps_message_id);
                        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID[0]}`)

                        const hspsStartEmbed = new EmbedBuilder()
                            .setColor(Colors.DarkGreen)
                            .setThumbnail(interaction.guild.iconURL())
                            .setTitle(`🚨 CPUF IS UNDER ATTACK 🚨`)
                            .setDescription(`Chaos Forces commenced a raid on Classified Part Underground Facility! \nAll available security are to immediately deploy and fight off the raid.`)
                            .setTimestamp()
                            .setFooter({
                                text: `Raid ID: ${raidID}`,
                                iconURL: interaction.user.avatarURL()
                            })

                        await hspsRaidMsg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: '<@&1233351676186853407>',
                            embeds: [hspsStartEmbed]
                        })

                        return interaction.editReply({
                            embeds:
                                [
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
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.user.avatarURL()
                                        })
                                        .setTimestamp()
                                ]
                        });
                    }
                case 'cancel':
                    {
                        const result = await client.knex("raids")
                            .select("*")
                            .where("raid_id", raidID)

                        if (result.length === 0) {
                            return interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Error!')
                                        .setDescription(`No raid with raid ID \`${raidID}\` has been found in the database`)
                                        .setColor(Colors.Yellow)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                            })
                        }

                        const isConcluded = await result.map((id) => id.is_concluded);
                        if (isConcluded[0] === 1) {
                            return interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('Error!')
                                        .setDescription(`You cannot cancel a concluded raid`)
                                        .setColor(Colors.Aqua)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                            })
                        }

                        const msgID = await result.map((id) => id.cfa_message_id);
                        const msg = await raidChannel.messages.fetch(`${msgID[0]}`)
                        const cancelEmbed = new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('Raid Cancelled!')
                            .setDescription(`The above raid has been cancelled.
                    We sincerely apologize for any inconvenience that this might have caused.`)
                            .addFields({
                                name: "Reason",
                                value: interaction.options.getString("reason")
                            })
                            .setFooter({
                                text: `Chaos Forces Alliance`,
                                iconURL: interaction.guild.iconURL()
                            })
                            .setTimestamp()

                        await msg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1094305864317419632>",
                            embeds: [cancelEmbed]
                        });

                        const hspsMsgID = result.map((id) => id.hsps_message_id);
                        const hspsMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID}`);
                        const hspsCancelEmbed = new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('Raid Cancelled!')
                            .setDescription(`The High Science Intelligence Agency have gotten new information that Chaos Forces have cancelled their planned raid. \n\nThe CPUF is safe, for now...`)
                            .addFields({
                                name: "Reason",
                                value: interaction.options.getString("reason")
                            })
                            .setFooter({
                                text: `Chaos Forces Alliance`,
                                iconURL: interaction.guild.iconURL()
                            })
                            .setTimestamp()

                        await hspsMsg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1233351676186853407>",
                            embeds: [hspsCancelEmbed]
                        });

                        await client.knex("raids")
                            .select("*")
                            .where("raid_id", raidID)
                            .del()

                        return interaction.editReply({
                            embeds:
                                [
                                    new EmbedBuilder()
                                        .setTitle('Raid Cancelled!')
                                        .setDescription(`The raid has been successfully cancelled!`)
                                        .setColor(Colors.Green)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.user.avatarURL()
                                        })
                                        .setTimestamp()
                                ]
                        });
                    }
                case 'end': {
                    const result = await client.knex("raids")
                        .select("*")
                        .where("raid_id", raidID)

                    const isConcluded = await result.map((id) => id.is_concluded);
                    const msgID = await result.map((id) => id.cfa_message_id);
                    const msg = await raidChannel.messages.fetch(`${msgID[0]}`)
                    const hspsMsgID = await result.map((id) => id.hsps_message_id);
                    const hspsMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID[0]}`)

                    if (result.length === 0) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`No raid with raid ID \`${raidID}\` found in the database.`)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    } else if (isConcluded[0] === 1) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`Raid \`${raidID}\` has already concluded`)
                                    .setColor(Colors.Aqua)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    } else {
                        const winner = interaction.options.getString("winner");

                        switch (winner) {
                            case 'chaos':
                                await msg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1094305864317419632>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('⭐ Raid Concluded - Chaos Forces Victory ⭐')
                                                .setDescription(`The raid has been concluded with a victory of Chaos Forces! \nThe CPUF has been destroyed and the truth have been revealed. \nThank you for participating in the raid.`)
                                                .setColor(Colors.Green)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })

                                await hspsMsg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1233351676186853407>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('💀 Raid Concluded - Chaos Forces Victory 💾')
                                                .setDescription(`The raid has been concluded, HSPS have lost! \nThe CPUF has been destroyed and data have been breached. \nThank you for participating in the raid.`)
                                                .setColor(Colors.Red)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })
                                break;
                            case 'security':
                                await hspsMsg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1233351676186853407>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('⭐ Raid Concluded - HSPS Victory ⭐')
                                                .setDescription(`The raid has been concluded with a victory of HSPS! \nThe CPUF is now secured and data is safe. \nThank you for participating in the raid.`)
                                                .setColor(Colors.Green)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })

                                await msg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1094305864317419632>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('🛡️ Raid Concluded - HSPS Victory 🛡️')
                                                .setDescription(`The raid has been concluded, Chaos Forces have lost! \nThe CPUF is now secured and data is safe. \nThank you for participating in the raid.`)
                                                .setColor(Colors.Red)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })
                                break;
                            case 'stalemate':
                                await msg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1094305864317419632>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('⛓️ Raid Concluded - Stalemate ⛓️')
                                                .setDescription(`The raid has been concluded with a stalemate.
Chaos Forces were able to destroy the facility, but HSPS managed to protect the data!
With no data, we cannot reveal the truth about High Science.
Thank you for participating in the raid.`)
                                                .setColor(Colors.Aqua)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })

                                await hspsMsg.reply({
                                    allowedMentions: { parse: ["roles"] },
                                    content: "<@&1233351676186853407>",
                                    embeds:
                                        [
                                            new EmbedBuilder()
                                                .setTitle('⛓️ Raid Concluded - Stalemate ⛓️')
                                                .setDescription(`The raid has been concluded with a stalemate.
HSPS successfully protected the data, but Chaos Forces destroyed the facility!
Even though facility was destroyed, the data was secured, rendering Chaos Forces unable to reveal the truth.
Thank you for participating in the raid.`)
                                                .setColor(Colors.Aqua)
                                                .setFooter({
                                                    text: `Chaos Forces Alliance`,
                                                    iconURL: interaction.guild.iconURL()
                                                })
                                                .setTimestamp()
                                        ]
                                })
                                break;
                        }
                        await client.knex("raids")
                            .update({ is_concluded: true })
                            .where({ raid_id: raidID })

                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Conclusion Success!')
                                    .setDescription('Raid successfully concluded!')
                                    .setColor(Colors.Green)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }
                }
                case 'change-time':
                    {
                        const time = interaction.options.getInteger('time');
                        const msgID = await result.map((id) => id.cfa_message_id);
                        const msg = await raidChannel.messages.fetch(`${msgID[0]}`)
                        const hspsMsgID = result.map((id) => id.hsps_message_id);
                        const hspsRaidMsg = await hspsRaidChannel.messages.fetch(`${hspsMsgID[0]}`)


                        await client.knex("raids")
                            .update({ time: time })
                            .where({ raid_id: raidID })

                        await msg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1094305864317419632>",
                            embeds:
                                [
                                    new EmbedBuilder()
                                        .setTitle('Raid Time Changed')
                                        .setDescription(`The raid time has been changed, the raid will be on ${time}!`)
                                        .setColor(Colors.DarkAqua)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                        })

                        await hspsRaidMsg.reply({
                            allowedMentions: { parse: ["roles"] },
                            content: "<@&1233351676186853407>",
                            embeds:
                                [
                                    new EmbedBuilder()
                                        .setTitle('Raid Time Changed')
                                        .setDescription(`The raid time has been changed, the raid will be on ${time}!`)
                                        .setColor(Colors.DarkAqua)
                                        .setFooter({
                                            text: `Chaos Forces Alliance`,
                                            iconURL: interaction.guild.iconURL()
                                        })
                                        .setTimestamp()
                                ]
                        })

                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Time Change Success!')
                                    .setDescription('Raid time changed successfully!')
                                    .setColor(Colors.Green)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }
            }
        } catch (error) {
            console.log(error)

            await interaction.client.channels.cache.get('1258036097422852248').send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Bot encountered an error!')
                        .setDescription(`Someone ran a ${interaction.commandName} ${subCommand ? subCommand : ''} command and it errored!`)
                        .setColor(Colors.Red)
                        .setFields([
                            { name: 'Error message', value: `\`\`\`js\n${error}\`\`\`` }
                        ])
                        .setFooter({
                            text: `Chaos Forces Alliance`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ],
                allowedMentions: { parse: ["users"] },
                content: '<@427832787605782549>'
            })

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error!')
                        .setDescription('There was an error while executing this command! If the issue persists, please contact AstroHWeston.')
                        .setColor(Colors.Red)
                        .setFooter({
                            text: `Chaos Forces Alliance`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()
                ]
            })
        }
    }
}
