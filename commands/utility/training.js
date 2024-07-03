const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Replies with the training schedule!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedules a training!')
                .addIntegerOption(option =>
                    option
                        .setName('time')
                        .setDescription('The time at which the training will take place.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Starts a training.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the training that you want to start.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription('Locks a training.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the training that you want to lock.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('Ends a training.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the training that you want to end.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('Cancels a training.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the training that you want to cancel.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('The reason for cancelling the training.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const client = await interaction.client;
            const trainingID = interaction.options.getString('id');
            const allowedIDs = ["1208839121682833548"];
            if (!interaction.member.roles.cache.hasAny(...allowedIDs)) {
                return interaction.editReply({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setTitle('Permission Denied!')
                                .setDescription('You do not have the required permissions to use this command!')
                                .setColor(Colors.Red)
                                .setFooter({
                                    text: `Chaos Forces Alliance.`,
                                    iconURL: interaction.guild.iconURL()
                                })
                                .setTimestamp()
                        ]

                })
            }
            const subcommand = interaction.options.getSubcommand();
            const uuid = crypto.randomUUID();
            const trainingChannel = interaction.guild.channels.cache.get('1203320915396530206');
            switch (subcommand) {
                case 'schedule': {
                    const time = interaction.options.getInteger('time');
                    const scheduleEmbed = new EmbedBuilder()
                        .setTitle('Incoming Training Announcement!')
                        .setColor("#2B2D31")
                        .setDescription(`A training has been scheduled for <t:${time}:F>. Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of these 2 rules can lead to a warning/strike.
## Training Rules
* When you join, enter the Training tribune. After that, STS in spawn and await intructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to a Internet/Electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not change your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (e.x: "PTS, ${interaction.member.nickname}.").
* Do not complain about not recieving as much points as you wanted. If you have any reports/suggestions, please DM the <@&1092147548195668059> or <@&1066470538123415622>.`)
                        .setFields(
                            { name: "Training Host", value: `<@${interaction.user.id}>` }
                        )
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: "Training ID: " + uuid,
                            iconURL: interaction.user.avatarURL()
                        })
                    const message = await trainingChannel.send({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1208467485104406619>",
                        embeds: [scheduleEmbed]
                    });

                    await message.react('✅')

                    await client.knex('trainings')
                        .insert({
                            training_id: uuid,
                            host_username: interaction.member.nickname,
                            message_id: message.id,
                            training_date: time,
                            is_concluded: false
                        })

                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Training Scheduled!')
                                    .setDescription(`The training has been successfully scheduled!`)
                                    .addFields(
                                        { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
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
                case 'start': {
                    const result = await client.knex("trainings")
                        .select("*")
                        .where("training_id", trainingID)
                    const isConcluded = result.map((id) => id.is_concluded);

                    if (result.length === 0) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`No training with training id \`${trainingID}\` has been found in the database.`)
                                    .setColor(Colors.Yellow)
                                    .setFooter({
                                        text: `Chaos Forces Alliance.`,
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
                                    .setDescription(`The training with training id \`${trainingID}\` has already been concluded.`)
                                    .setColor(Colors.Yellow)
                                    .setFooter({
                                        text: `Chaos Forces Alliance.`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }
                    const msgID = result.map((id) => id.message_id);
                    const trainingMsg = await trainingChannel.messages.fetch(`${msgID[0]}`)

                    const startEmbed = new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle('Chaos Forces Alliance - Training Commencing')
                        .setDescription(`A scheduled training is now commencing. Please ensure that you;
- STS at the front lines
- Have no avatar that massively alters your hitbox.
- Remain quiet unless you're asking a question. 

## Join the Training Place [here](https://www.roblox.com/games/6456351776).`)
                        .setTimestamp()
                        .setFooter({
                            text: `Training ID: ${trainingID}.`,
                            iconURL: interaction.user.avatarURL()
                        })

                    await trainingMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: '<@&1208467485104406619>',
                        embeds: [startEmbed]
                    })
                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Training Started!')
                                    .setDescription(`The training has been successfully started!`)
                                    .addFields(
                                        { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
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
                case 'lock': {
                    const result = await client.knex("trainings")
                        .select("*")
                        .where("training_id", trainingID)
                    const isConcluded = result.map((id) => id.is_concluded);

                    if (result.length === 0) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`No training with training id \`${trainingID}\` has been found in the database.`)
                                    .setColor(Colors.Yellow)
                                    .setFooter({
                                        text: `Chaos Forces Alliance.`,
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
                                    .setDescription(`The training with training id \`${trainingID}\` has already been concluded.`)
                                    .setColor(Colors.Yellow)
                                    .setFooter({
                                        text: `Chaos Forces Alliance.`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }
                    const msgID = result.map((id) => id.message_id);
                    const trainingMsg = await trainingChannel.messages.fetch(`${msgID[0]}`)

                    const startEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle('Chaos Forces Alliance - Training Locked')
                        .setDescription(`A scheduled training has been locked and is now in progress!
                                
If you disconnected, please contact the host or co-host to be let back in. 
If you didn't make it in time, **attend another training.**`)
                        .setTimestamp()
                        .setFooter({
                            text: `Training ID: ${trainingID}.`,
                            iconURL: interaction.user.avatarURL()
                        })

                    await trainingMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: '<@&1208467485104406619>',
                        embeds: [startEmbed]
                    })
                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Training Locked!')
                                    .setDescription(`The training has been successfully locked!`)
                                    .addFields(
                                        { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
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
                case 'cancel': {
                    const result = await client.knex("trainings")
                        .select("*")
                        .where("training_id", trainingID)

                    if (result.length === 0) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`No training with training id \`${trainingID}\` has been found in the database.`)
                                    .setColor(Colors.Yellow)
                                    .setFooter({
                                        text: `Chaos Forces Alliance.`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }

                    const isConcluded = result.map((id) => id.is_concluded);
                    if (isConcluded[0] === 1) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`You cannot cancel a concluded training`)
                                    .setColor(Colors.Aqua)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    }

                    const msgID = result.map((id) => id.message_id);
                    const msg = await trainingChannel.messages.fetch(`${msgID[0]}`)
                    const cancelEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('Training Cancelled!')
                        .setDescription(`The above training has been canceled.
                        We sincerely apologize for any inconvenience that this might have caused.`)
                        .addFields({
                            name: "Reason", value: interaction.options.getString("reason")
                        })
                        .setFooter({
                            text: `Chaos Forces Alliance.`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()

                    await msg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: "<@&1208467485104406619>",
                        embeds: [cancelEmbed]
                    });

                    await client.knex("trainings")
                        .select("*")
                        .where("training_id", trainingID)
                        .del()

                    return interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Training cancelled!')
                                    .setDescription(`The training has been successfully cancelled!`)
                                    .addFields(
                                        { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
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
                case 'end': {
                    const result = await client.knex("trainings")
                        .select("*")
                        .where("training_id", trainingID)

                    const isConcluded = result.map((id) => id.is_concluded);
                    const msgID = result.map((id) => id.message_id);
                    const msg = await trainingChannel.messages.fetch(`${msgID[0]}`);

                    if (result.length === 0) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription(`No training with training id \`${trainingID}\` found in the database.`)
                                    .setColor(Colors.Yellow)
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
                                    .setDescription(`Training \`${trainingID}\` has already concluded.`)
                                    .setColor(Colors.Aqua)
                                    .setThumbnail(info)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                        })
                    } else {
                        const concludedEmbed = new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setTitle('Training Concluded')
                            .setDescription(`The above training has concluded.`)
                            .setTimestamp()
                            .setFooter({
                                text: `Chaos Forces Alliance`,
                                iconURL: interaction.guild.iconURL()
                            })

                        await msg.reply({
                            embeds: [concludedEmbed]
                        })

                        await client.knex("trainings")
                            .update({ is_concluded: true })
                            .where({ training_id: trainingID })

                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Conclusion Success!')
                                    .setDescription('Training successfully concluded!')
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
            }
        } catch (error) {
            console.log(error);

            await interaction.channels.cache.get('1258036097422852248').send({
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
                        .setDescription('There was an error while executing this command! If the issue persists, please contact Danonienko.')
                        .setThumbnail(failure)
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