const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Allows authorized users to schedule the CFA training.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedules a training.')
                .addIntegerOption(option =>
                    option
                        .setName('time')
                        .setDescription('The time at which the training will take place.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('The type of the training to be scheduled.')
                        .addChoices(
                            { name: 'Essential Training', value: 'et' },
                            { name: 'Combat Training', value: 'ct' }
                        )
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
                .addStringOption(option =>
                    option
                        .setName('venue_link')
                        .setDescription(`The link to this training's venue.`)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription('Informs others of training lock.')
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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Updates the training time.')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The ID of the training that you want to update.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('new_time')
                        .setDescription('The time at which the training is going to take place now.')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const client = await interaction.client;
        const allowedIDs = ["1208839121682833548"];
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
        const trainingChannel = interaction.guild.channels.cache.get('1203320915396530206');
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle('Error!')
            .setTimestamp()
            .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL()
            });

        if (subcommand === 'schedule') {
            const time = interaction.options.getInteger('time', true);
            const type = interaction.options.getString('type', true);
            let scheduleEmbed;

            if (time <= Math.round(Date.now() / 1000)) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('Cannot schedule a training in the past.')] });
            };

            const trainingAtThisTime = await client.knex('trainings')
                .select('*')
                .where('training_date', time)
                .first();

            if (trainingAtThisTime) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a training scheduled at this time.')] });
            };

            switch (type) {
                case 'et':
                    scheduleEmbed = new EmbedBuilder()
                        .setTitle('Incoming Essential Training Announcement!')
                        .setColor("#2B2D31")
                        .setDescription(`## An essential training has been scheduled on <t:${time}:F>.
Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of the rules below can lead to a warning/strike.
## Essential Training Rules
* When you join, enter the <#1320466795882217552>. After that, STS at the spawn and await instructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (example: "PTS, ${interaction.member.nickname}.")`)
                        .setFields(
                            { name: "Training Host", value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Training ID', value: `${uuid}`, inline: true }
                        )
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                    break;

                case 'ct':
                    scheduleEmbed = new EmbedBuilder()
                        .setTitle('Incoming Combat Training Announcement!')
                        .setColor("#2B2D31")
                        .setDescription(`## A combat training has been scheduled on <t:${time}:F>.
Before joining at the designated time, please review all the training rules listed below. Once done, kindly react with ✅ to confirm your attendance. 
Do note that if you reacted, you can not unreact without notifying the host and having an objective reason for that. Adding to that, you must always join the training you reacted to.
Breaking any of the rules below can lead to a warning/strike.
## Combat Training Rules
* When you join, enter the <#1320466795882217552>. After that, STS at the spawn and await instructions from the host.
* Do not go AFK or/and leave without notifying the host. Don't worry: disconnecting due to an internet/electricity problem will not get you punished if you notify the host about that issue.
* Always listen to the orders issued by the host.
* Use avatars that do not significantly alter your hitboxes.
* Do not talk unless allowed to, however, you can ask for a permission (example: "PTS, ${interaction.member.nickname}.")`)
                        .setFields(
                            { name: "Training Host", value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Training ID', value: `${uuid}`, inline: true }
                        )
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                    break;
            };

            const message = await trainingChannel.send({
                allowedMentions: { parse: ["roles"] },
                content: "<@&1208467485104406619>",
                embeds: [scheduleEmbed]
            });

            await message.react('✅');

            await client.knex('trainings')
                .insert({
                    training_id: uuid,
                    host_username: interaction.member.nickname,
                    message_id: message.id,
                    training_date: time,
                    training_type: type,
                    is_concluded: false
                });

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Training Scheduled!')
                        .setDescription(`The training has been successfully scheduled!`)
                        .addFields({ name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true })
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.id,
                            iconURL: interaction.user.avatarURL()
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
            const isConcluded = training.is_concluded;

            if (!training) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No training with ID \`${trainingID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('This training has already been concluded.')] });
            };

            const msgID = training.message_id;
            const trainingMsg = await trainingChannel.messages.fetch(`${msgID}`);

            await trainingMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: '<@&1208467485104406619>',
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle('Chaos Forces Alliance - Training Commencing')
                        .setDescription(`A scheduled training is now commencing. Please ensure that you;
- STS at the front lines.
- Have no avatar that massively alters your hitboxes.
- Remain quiet unless you're asking a question.

## Join the Training [here](${venueLink}).`)
                        .setTimestamp()
                        .setFooter({
                            text: `Training ID: ${trainingID}.`,
                            iconURL: interaction.user.avatarURL()
                        })
                ]
            });
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Training Started!')
                        .setDescription(`The training has been successfully started!`)
                        .addFields({ name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true })
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                ]
            });
        } else if (subcommand === 'lock') {
            const trainingID = interaction.options.getString('id', true);
            const training = await client.knex("trainings")
                .select("*")
                .where("training_id", trainingID)
                .first();
            const isConcluded = training.is_concluded;

            if (!training) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No training with ID \`${trainingID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('This training has already been concluded.')] });
            };

            const msgID = training.message_id;
            const trainingMsg = await trainingChannel.messages.fetch(`${msgID}`);

            await trainingMsg.reply({
                allowedMentions: { parse: ["roles"] },
                content: '<@&1208467485104406619>',
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setThumbnail(interaction.guild.iconURL())
                        .setTitle('Chaos Forces Alliance - Training Locked')
                        .setDescription(`A scheduled training has been locked and is now in progress!
                                
If you disconnected, please contact the host or co-host to be let back in. 
If you didn't make it in time, **attend another training.**`)
                        .setFields({ name: 'Training ID', value: `${trainingID}` })
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
                        .setTitle('Training Locked!')
                        .setDescription(`The training has been successfully locked!`)
                        .addFields(
                            { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
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
            const trainingID = interaction.options.getString('id', true);
            const training = await client.knex("trainings")
                .select("*")
                .where("training_id", trainingID)
                .first();
            const isConcluded = training.is_concluded;

            if (!training) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No training with ID \`${trainingID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('This training has already been concluded.')] });
            };

            const msgID = training.message_id;
            const msg = await trainingChannel.messages.fetch(`${msgID}`);

            await msg.reply({
                allowedMentions: { parse: ["roles"] },
                content: "<@&1208467485104406619>",
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('Training Cancelled!')
                        .setDescription(`The above training has been canceled.
We sincerely apologize for any inconvenience that this might have caused.`)
                        .addFields({ name: "Reason", value: interaction.options.getString("reason", true) })
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });

            await client.knex("trainings")
                .where("training_id", trainingID)
                .del();

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Training cancelled!')
                        .setDescription(`The training has been successfully cancelled!`)
                        .addFields(
                            { name: "Training ID", value: `\`\`\`ini\n[ ${uuid} ] \`\`\``, inline: true }
                        )
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.user.avatarURL()
                        })
                ]
            });
        } else if (subcommand === 'end') {
            const trainingID = interaction.options.getString('id', true);
            const training = await client.knex("trainings")
                .select("*")
                .where("training_id", trainingID)
                .first();

            const isConcluded = training.is_concluded;
            const msgID = training.message_id;
            const msg = await trainingChannel.messages.fetch(`${msgID}`);

            if (!training) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No training with ID \`${trainingID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('This training has already been concluded.')] });
            };

            await client.knex("trainings")
                .update({ is_concluded: true })
                .where({ training_id: trainingID });

            await msg.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle('Training Concluded')
                        .setDescription(`The above training has been concluded.\nThank you for attending!`)
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
                        .setTitle('Conclusion Success!')
                        .setDescription('Training successfully concluded!')
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        } else if (subcommand === 'update') {
            const trainingID = interaction.options.getString('id', true);
            const newTime = interaction.options.getInteger('new_time', true);
            const training = await client.knex("trainings")
                .select("*")
                .where("training_id", trainingID)
                .first();

            const isConcluded = training.is_concluded;
            const msgID = training.message_id;
            const msg = await trainingChannel.messages.fetch(`${msgID}`);

            if (!training) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription(`No training with ID \`${trainingID}\` has been found in the database.`)] });
            };

            if (isConcluded === 1) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('This training has already been concluded.')] });
            };

            if (newTime == training.training_date) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('New training time cannot be the same as the old training time.')] });
            };

            const trainingAtThisTime = await client.knex('trainings')
                .select('*')
                .where('training_date', newTime)
                .first();

            if (trainingAtThisTime) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('There is already a training scheduled at this time.')] });
            };

            if (newTime <= Math.round(Date.now() / 1000)) {
                return await interaction.editReply({ embeds: [errorEmbed.setDescription('Cannot reschedule a training to the past.')] });
            };

            await client.knex("trainings")
                .update({ training_date: newTime })
                .where({ training_id: trainingID });

            await msg.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle('Training Time Updated')
                        .setDescription(`The above training's time has been changed. The training will now be on <t:${newTime}:f>.
Please adjust your availability accordingly.`)
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
                        .setTitle('Update Success!')
                        .setDescription('Training successfully updated!')
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