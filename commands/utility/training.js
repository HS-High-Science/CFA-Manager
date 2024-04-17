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
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const allowedIDs = ["1208839121682833548"];
        if (!interaction.member.roles.cache.hasAny(...allowedIDs)) {
            await interaction.editReply({
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
            return;
        }
        const subcommand = interaction.options.getSubcommand();
        const uuid = crypto.randomUUID();
        const trainingChannel = interaction.guild.channels.cache.get('1094324114245824694');
        let response = null;
        switch (subcommand) {
            case 'schedule':
                try {
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
                        content: "<@&1226408360551645254>",
                        embeds: [scheduleEmbed]
                    });

                    await message.react('✅')

                    await interaction.editReply({
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
                } catch (err) {
                    console.log(err)
                }

                break;
            case 'start':
                const startID = interaction.options.getString('id');
                response = `The training with ID ${startID} has been started!`;
                break;
            case 'end':
                const endID = interaction.options.getString('id');
                response = `The training with ID ${endID} has been ended!`;
                break;
            case 'cancel':
                const cancelID = interaction.options.getString('id');
                response = `The training with ID ${cancelID} has been cancelled!`;
                break;
            default:
                response = "Invalid subcommand!";
                break;
        }
    }

}
