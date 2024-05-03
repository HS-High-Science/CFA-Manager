// Made by @Danonienko

const { SlashCommandBuilder, EmbedBuilder, Colors, embedLength } = require('discord.js');

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
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const client = await interaction.client;
        const raidID = interaction.options.getString('id');
        const allowedIDs = ["1157806062070681600", "846692755496763413"]
        if (!interaction.member.roles.cache.hasAny(...allowedIDs)) {
            await interaction.editReply({
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
            return;
        }
        const subCommand = interaction.options.getSubcommand();
        const uuid = crypto.randomUUID();
        const raidChannel = interaction.guild.channels.cache.get('1235906938470928507');
        switch (subCommand) {
            case 'schedule':
                try {
                    const time = interaction.options.getInteger('time');
                    const scheduleEmbed = new EmbedBuilder()
                        .setTitle('Incoming Raid Announcement!')
                        .setColor("#2B2D31")
                        .setDescription(`This is a test, the full description will be written later`)
                        .setFields({
                            name: "Raid Host",
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
                        content: "<@&846692755496763413>",
                        embeds: [scheduleEmbed]
                    });

                    await message.react('✅')

                    await client.knex('raids')
                        .insert({
                            raid_id: uuid,
                            host_username: interaction.member.nickname,
                            message_id: message.id,
                            raid_date: time,
                            is_concluded: false
                        })

                    await interaction.editReply({
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
                } catch (error) {
                    console.log(error)
                    await interaction.editReply({
                        embeds:
                            [
                                new EmbedBuilder()
                                    .setTitle('Error!')
                                    .setDescription('There was an arror while scheduling the raid!')
                                    .setColor(Colors.Red)
                                    .setFooter({
                                        text: `Chaos Forces Alliance`,
                                        iconURL: interaction.guild.iconURL()
                                    })
                                    .setTimestamp()
                            ]
                    })
                }
                break;
            case 'start':
                try {
                    const result = await client.knex("raids")
                        .select("*")
                        .where("raid_id", raidID)
                    const isConcluded = result.map((id) => id.is_concluded);

                    if (result.length === 0) {
                        await interaction.editReply({
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
                        return;
                    }
                    if (isConcluded[0] === 1) {
                        await interaction.editReply({
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
                        return;
                    }
                    const msgID = result.map((id) => id.message_id);
                    const raidMsg = await raidChannel.messages.fetch(`${msgID[0]}`)

                    const startEmbed = new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle(`Chaos Forces Alliance - Raid Commencing`)
                        .setDescription(`A scheduled raid is now commencing. Please ensure that you:
- STS at the spawn.
- Have no avatar that massively alters your hitbox.
- Remain quiet unless you're asking a question.`)
                        .setTimestamp()
                        .setFooter({
                            text: `Raid ID: ${raidID}`,
                            iconURL: interaction.user.avatarURL()
                        })

                    await raidMsg.reply({
                        allowedMentions: { parse: ["roles"] },
                        content: '<@&846692755496763413>',
                        embeds: [startEmbed]
                    })
                    await interaction.editReply({
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
                } catch (error) {
                    console.log(error);
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Error!')
                                .setDescription('There was an error while starting the raid!')
                                .setColor(Colors.Red)
                                .setFooter({
                                    text: `Chaos Forces Alliance`,
                                    iconURL: interaction.guild.iconURL()
                                })
                                .setTimestamp()
                        ]
                    })
                }
                break;
            case 'cancel':
                break;
        }
    }
}