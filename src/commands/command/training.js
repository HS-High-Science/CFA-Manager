import { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('training')
    .setDescription('Allows authorized users to schedule the CFA training.')
    .addSubcommand(subcommand => subcommand
        .setName('schedule')
        .setDescription('[TH] Schedule a training.')
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('The time at which the training will take place.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('type')
            .setDescription('The type of the training to be scheduled.')
            .addChoices(
                { name: 'Essential Training', value: 'et' },
                { name: 'Combat Training', value: 'ct' },
                { name: 'Joint Training', value: 'jt' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('start')
        .setDescription('[TH] Start a training.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the training that you want to start.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('venue_link')
            .setDescription(`The link to this training's venue.`)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('lock')
        .setDescription('[TH] Inform others of training lock.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the training that you want to lock.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('end')
        .setDescription('[TH] End a training.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the training that you want to end.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('cancel')
        .setDescription('[TH] Cancel a training.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the training that you want to cancel.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for cancelling the training.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('update')
        .setDescription('[TH] Update the training time.')
        .addStringOption(option => option
            .setName('id')
            .setDescription('The ID of the training that you want to update.')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('new_time')
            .setDescription('The time at which the training is going to take place now.')
            .setRequired(true)
        )
    );

export async function execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const client = await interaction.client;
    const allowedIDs = ["1208839121682833548"];

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

    const subcommand = interaction.options.getSubcommand();
    const uuid = crypto.randomUUID();
    const trainingChannel = interaction.guild.channels.cache.get('1203320915396530206');
    const hspsChannel = interaction.client.channels.cache.get('1317426517302841424');
    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle('Error.')
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    if (subcommand === 'schedule') {
        const time = interaction.options.getInteger('time', true);
        const type = interaction.options.getString('type', true);
        let scheduleEmbed;

        if (time <= Math.round(Date.now() / 1000)) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Cannot schedule a training in the past.')] });

        const trainingAtThisTime = await client.knex('trainings')
            .select('*')
            .where('training_date', time)
            .first();

        if (trainingAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a training scheduled at this time.')] });

        switch (type) {
            case 'et':
                scheduleEmbed = new EmbedBuilder()
                    .setTitle(`An Essential Training has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setColor("#2B2D31")
                    .setDescription(`Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of these rules can lead to a warning/strike.
## Essential Training Rules
* When you join, enter the <#1320466795882217552>. After that, STS at the spawn and await instructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (example: "PTS, ${interaction.user}?")`)
                    .setFields(
                        { name: "Training host", value: `${interaction.user}`, inline: true },
                        { name: 'Training ID', value: uuid, inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });
                break;

            case 'ct':
                scheduleEmbed = new EmbedBuilder()
                    .setTitle(`A Combat Training has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setColor("#2B2D31")
                    .setDescription(`Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of these rules can lead to a warning/strike.
## Combat Training Rules
* When you join, enter the <#1320466795882217552>. After that, STS at the spawn and await instructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (example: "PTS, ${interaction.user}?")`)
                    .setFields(
                        { name: "Training host", value: `${interaction.user}`, inline: true },
                        { name: 'Training ID', value: uuid, inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });
                break;

            case 'jt':
                scheduleEmbed = new EmbedBuilder()
                    .setTitle(`A CFA x HSPS Joint Training has been scheduled on <t:${time}:F>. This is in your local time.`)
                    .setColor("#2B2D31")
                    .setDescription(`Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of these rules can lead to a warning/strike.
## Joint Training Rules
* When you join, enter the <#1320466795882217552>. After that, STS at the spawn and await instructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Do not harass security.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (example: "PTS, ${interaction.user}?")`)
                    .setFields(
                        { name: "Training host", value: `${interaction.user}`, inline: true },
                        { name: 'Training ID', value: uuid, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true },
                        { name: 'HSPS reactions', value: '0 ✅', inline: true },
                        { name: 'CFA reactions', value: '0 ✅', inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    });
                break;
        }

        const message = await trainingChannel.send({
            allowedMentions: { parse: ["roles"] },
            content: "<@&1208467485104406619>",
            embeds: [scheduleEmbed]
        });

        await message.react('✅');

        let hspsMessageId;
        if (type === 'jt') {
            const hspsScheduleEmbed = new EmbedBuilder()
                .setTitle(`An HSPS x CFA Joint Training has been scheduled on <t:${time}:F>. This is in your local time.`)
                .setColor("#2B2D31")
                .setDescription(`Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Breaking any of these rules can land you in a punishment.
## Joint Training Rules
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission to speak.`)
                .setFields(
                    { name: "Training host", value: `${interaction.user}`, inline: true },
                    { name: 'HSPS reactions', value: '0 ✅', inline: true },
                    { name: 'CFA reactions', value: '0 ✅', inline: true }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                });

            const hspsMessage = await hspsChannel.send({
                embeds: [hspsScheduleEmbed],
                allowedMentions: { parse: ['roles'] },
                content: '<@&1329145116644085790>'
            });

            hspsMessageId = hspsMessage.id;

            await hspsMessage.react('✅');
        }

        await client.knex('trainings')
            .insert({
                training_id: uuid,
                host_id: interaction.user.id,
                message_id: message.id,
                hsps_message_id: hspsMessageId,
                training_date: time,
                training_type: type
            });

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription(`Successfully scheduled a training.`)
                    .setFields({ name: 'Training ID', value: `\`\`\`ini\n[ ${uuid} ]\n\`\`\`` })
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'start') {
        const trainingID = interaction.options.getString('id', true);
        const venueLink = interaction.options.getString('venue_link', true);
        const training = await client.knex("trainings")
            .select("*")
            .where("training_id", trainingID)
            .first();

        if (!training || training.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Training with ID \`${trainingID}\` is already concluded or does not exist in the database.`)] });

        const msgID = training.message_id;
        const trainingMsg = await trainingChannel.messages.fetch(msgID);
        const startEmbed = new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setThumbnail(interaction.guild.iconURL())
            .setTitle('Chaos Forces Alliance - Training commencing.')
            .setDescription(`A scheduled training is now commencing. Please ensure that you:
- STS at the spawn.
- Listen to host's instructions.
- Have no avatar that massively alters your hitboxes.
- Remain quiet unless you're requesting a permission to speak.
- Show your best!

## Join the Training [here](${venueLink}).`)
            .setFields({ name: 'Training ID', value: trainingID })
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await trainingMsg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1208467485104406619>',
            embeds: [startEmbed]
        });

        if (training.training_type === 'jt') {
            const hspsMsgId = training.hsps_message_id;
            const hspsTrainingMsg = await hspsChannel.messages.fetch(hspsMsgId);

            await hspsTrainingMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: '<@&1329145116644085790>',
                embeds: [startEmbed]
            });
        }

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription(`Successfully started the training.`)
                    .setFields({ name: 'Training ID', value: `\`\`\`ini\n[ ${trainingID} ]\n\`\`\`` })
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'lock') {
        const trainingID = interaction.options.getString('id', true);
        const training = await client.knex("trainings")
            .select("*")
            .where("training_id", trainingID)
            .first();
        
        if (!training || training.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Training with ID \`${trainingID}\` is already concluded or does not exist in the database.`)] });

        const msgID = training.message_id;
        const trainingMsg = await trainingChannel.messages.fetch(msgID);
        const lockEmbed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setThumbnail(interaction.guild.iconURL())
            .setTitle('Chaos Forces Alliance - Training locked.')
            .setDescription(`A scheduled training has been locked and is now in progress!

If you disconnected, please contact the host or co-host to be let back in.
If you didn't make it in time, **attend another training.**`)
            .setFields({ name: 'Training ID', value: trainingID })
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await trainingMsg.reply({ embeds: [lockEmbed] });

        if (training.training_type === 'jt') {
            const hspsMsgId = training.hsps_message_id;
            const hspsTrainingMsg = await hspsChannel.messages.fetch(hspsMsgId);

            await hspsTrainingMsg.reply({ embeds: [lockEmbed] });
        }

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription(`Successfully locked the training.`)
                    .setFields({ name: 'Training ID', value: `\`\`\`ini\n[ ${trainingID} ]\n\`\`\`` })
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'cancel') {
        const trainingID = interaction.options.getString('id', true);
        const training = await client.knex("trainings")
            .select("*")
            .where("training_id", trainingID)
            .first();

        if (!training || training.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Training with ID \`${trainingID}\` is already concluded or does not exist in the database.`)] });

        const msgID = training.message_id;
        const msg = await trainingChannel.messages.fetch(msgID);
        const cancelEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Training cancelled.')
            .setDescription(`The above training has been cancelled.
We sincerely apologize for any inconvenience that this might have caused.`)
            .addFields({ name: "Reason", value: interaction.options.getString("reason", true) })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1208467485104406619>',
            embeds: [cancelEmbed]
        });

        if (training.training_type === 'jt') {
            const hspsMsgId = training.hsps_message_id;
            const hspsTrainingMsg = await hspsChannel.messages.fetch(hspsMsgId);

            await hspsTrainingMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: '<@&1329145116644085790>',
                embeds: [cancelEmbed]
            });
        }

        await client.knex("trainings")
            .where("training_id", trainingID)
            .del();

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription(`Successfully cancelled the training.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'end') {
        const trainingID = interaction.options.getString('id', true);
        const training = await client.knex("trainings")
            .select("*")
            .where("training_id", trainingID)
            .first();

        if (!training || training.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Training with ID \`${trainingID}\` is already concluded or does not exist in the database.`)] });

        const msgID = training.message_id;
        const msg = await trainingChannel.messages.fetch(msgID);

        await client.knex("trainings")
            .update({ is_concluded: true })
            .where({ training_id: trainingID });

        const concludeEmbed = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setTitle('Training concluded.')
            .setDescription(`The above training has been concluded.\nThank you for attending!`)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await msg.reply({ embeds: [concludeEmbed] });

        if (training.training_type === 'jt') {
            const hspsMsgId = training.hsps_message_id;
            const hspsTrainingMsg = await hspsChannel.messages.fetch(hspsMsgId);

            await hspsTrainingMsg.reply({ embeds: [concludeEmbed] });
        }

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription('Successfully concluded the training.')
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'update') {
        const trainingID = interaction.options.getString('id', true);
        const newTime = interaction.options.getInteger('new_time', true);
        const training = await client.knex("trainings")
            .select("*")
            .where("training_id", trainingID)
            .first();

        if (!training || training.is_concluded) return await interaction.editReply({ embeds: [errorEmbed.setDescription(`Training with ID \`${trainingID}\` is already concluded or does not exist in the database.`)] });

        if (newTime == training.training_date) return await interaction.editReply({ embeds: [errorEmbed.setDescription('New training time cannot be the same as the old training time.')] });

        const trainingAtThisTime = await client.knex('trainings')
            .select('*')
            .where('training_date', newTime)
            .first();

        if (trainingAtThisTime) return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a training scheduled at this time.')] });

        if (newTime <= Math.round(Date.now() / 1000)) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Cannot reschedule a training to the past.')] });

        const msgID = training.message_id;
        const msg = await trainingChannel.messages.fetch(msgID);

        await client.knex("trainings")
            .update({
                training_date: newTime,
                is_reminded: false
            })
            .where('training_id', trainingID);

        const updateEmbed = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setTitle('Training time updated.')
            .setDescription(`The above training's time has been changed. The training will now be on **<t:${newTime}:f>**.
Please adjust your availability accordingly.`)
            .setFields({ name: 'Training ID', value: trainingID })
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        await msg.reply({
            allowedMentions: { parse: ["roles"] },
            content: '<@&1208467485104406619>',
            embeds: [updateEmbed]
        });

        await msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(msg.embeds[0].color)
                    .setTitle(`A CFA x HSPS Joint Training has been scheduled on <t:${newTime}:F>. This is in your local time.`)
                    .setDescription(msg.embeds[0].description)
                    .setFields(msg.embeds[0].fields)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp(new Date(msg.embeds[0].timestamp))
                    .setFooter(msg.embeds[0].footer)
            ]
        });

        if (training.training_type === 'jt') {
            const hspsMsgId = training.hsps_message_id;
            const hspsTrainingMsg = await hspsChannel.messages.fetch(hspsMsgId);

            await hspsTrainingMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: '<@&1329145116644085790>',
                embeds: [updateEmbed]
            });

            await hspsTrainingMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(hspsTrainingMsg.embeds[0].color)
                        .setTitle(`An HSPS x CFA Joint Training has been scheduled on <t:${newTime}:F>. This is in your local time.`)
                        .setDescription(hspsTrainingMsg.embeds[0].description)
                        .setFields(hspsTrainingMsg.embeds[0].fields)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp(new Date(hspsTrainingMsg.embeds[0].timestamp))
                        .setFooter(hspsTrainingMsg.embeds[0].footer)
                ]
            });
        }

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Success.')
                    .setDescription('Successfully updated the training.')
                    .setColor(Colors.Green)
                    .setFields({ name: 'Training ID', value: `\`\`\`ini\n[ ${trainingID} ]\n\`\`\`` })
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }
}
