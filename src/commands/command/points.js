import { SlashCommandBuilder, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('points')
    .setDescription('Allows users to interact with the points module.')
    .addSubcommand(sc => sc
        .setName('fetch')
        .setDescription(`Fetch user's CFA points.`)
        .addUserOption(option => option
            .setName('user')
            .setDescription(`The user to fetch (defaults to the user running this command).`)
        )
    )
    .addSubcommand(sc => sc
        .setName('alter')
        .setDescription(`[COM+] Alter user's point balance.`)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user whose point balance should be altered.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('action')
            .setDescription('The action to be performed.')
            .setChoices(
                { name: 'Add', value: 'add' },
                { name: 'Subtract', value: 'subtract' },
                { name: 'Set', value: 'set' }
            )
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('The amount of points to add/subtract/set.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason behind this action.')
        )
    )
    .addSubcommand(sc => sc
        .setName('leaderboard')
        .setDescription('[COM+] Show points leaderboard.')
    )
    .addSubcommand(sc => sc
        .setName('wipe')
        .setDescription('[HICOM+] Wipe EVERYONE\'s points.')
    )

export async function execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const subcommand = interaction.options.getSubcommand();
    const allowedIds = ['1239137720669044766', '1255634139730935860']; // command, high command
    const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle('Error.')
        .setTimestamp()
        .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL()
        });

    if (subcommand === 'fetch') {
        const user = interaction.options.getUser('user') ?? interaction.user;

        if (user !== interaction.user && !interaction.member.roles.cache.hasAny(...allowedIds)) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Access denied.')
                    .setDescription('You do not have the required permissions to view other people\'s points.')
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

        const result = await client.knex('points')
            .select('*')
            .where('discord_id', user.id)
            .first();

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Point stats.')
                    .setDescription(`${user} has ${result?.amount ?? 0} point(s).`)
                    .setThumbnail(user.avatarURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });

    }

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

    if (subcommand === 'alter') {
        const user = interaction.options.getUser('user', true);
        const action = interaction.options.getString('action', true);
        const amount = interaction.options.getInteger('amount', true);
        const reason = interaction.options.getString('reason');
        const pointLogChannel = client.channels.cache.get('1365689009376071721');
        const result = await client.knex('points')
            .select('*')
            .where('discord_id', user.id)
            .first();
        let newAmount;

        switch (action) {
            case 'add':
                newAmount = result ? result.amount + amount : amount;
                break;
            case 'subtract':
                newAmount = result ? result.amount - amount : -amount;
                break;
            case 'set':
                newAmount = amount;
                break;
        }

        if (newAmount === (result?.amount ?? 0)) return await interaction.editReply({ embeds: [errorEmbed.setDescription('Point balance has not been modified.')] });

        result ?
            await client.knex('points')
                .update({ amount: newAmount })
                .where('discord_id', user.id) :
            await client.knex('points')
                .insert({
                    discord_id: user.id,
                    amount: newAmount
                });

        await user.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Point balance altered.')
                    .setDescription(`Your point balance has been altered. If you have any questions, contact a member of CFA Command or above.`)
                    .setFields(
                        { name: 'Before', value: `${result?.amount ?? 0} pts`, inline: true },
                        { name: 'After', value: `${newAmount} pts`, inline: true },
                        { name: 'Reason', value: reason ?? 'No reason provided.' }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        })
            .catch(_ => console.log());

        await pointLogChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Point balance altered.')
                    .setDescription(`${interaction.user} has altered ${user}'s point balance.`)
                    .setFields(
                        { name: 'Before', value: `${result?.amount ?? 0} pts`, inline: true },
                        { name: 'After', value: `${newAmount} pts`, inline: true },
                        { name: 'Reason', value: reason ?? 'No reason provided.' }
                    )
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
                    .setDescription(`Successfully altered ${user}'s point balance.`)
                    .setFields(
                        { name: 'Before', value: `${result?.amount ?? 0} pts`, inline: true },
                        { name: 'After', value: `${newAmount} pts`, inline: true },
                        { name: 'Reason', value: reason ?? 'No reason provided.' }
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'leaderboard') {
        const points = await client.knex('points')
            .select('*')
            .orderBy('amount', 'desc');
        let desc = ``;

        for (let i = 0; i < points.length; i++) desc = desc.concat(`${i}. <@${points[i].discord_id}>: ${points[i].amount} point(s).\n`);

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Points leaderboard.')
                    .setDescription(`Here is the points leaderboard for Chaos Forces Alliance.\n\n${desc}`)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    } else if (subcommand === 'wipe') {
        if (!interaction.member.roles.cache.hasAny(...['1255634139730935860'])) return await interaction.editReply({
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

        const existingPoints = await client.knex('points').select('*');
        if (existingPoints.length === 0) return await interaction.editReply({ embeds: [errorEmbed.setDescription('No one currently has points.')] });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Abort wipe')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji({ name: '❌' }),
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm wipe')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji({ name: '✅' })
            );

        const response = await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Are you sure?')
                    .setDescription(`Are you sure you want to wipe **EVERYONE'S** points? **This action cannot be undone.**\nIf you would like to only reset a few people's points, please use the \`/points alter\` command instead.`)
                    .setColor(Colors.Orange)
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ],
            components: [row]
        });

        try {
            const confirmation = await response.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 15_000 })

            if (confirmation.customId === 'confirm') {
                await confirmation.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Wiping...')
                            .setDescription(`Points wipe in progress. Please wait...`)
                            .setColor(Colors.Yellow)
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })

                    ],
                    components: []
                });
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Wipe cancelled.')
                            .setDescription(`Points have not been wiped.`)
                            .setColor(Colors.DarkRed)
                            .setTimestamp()
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL()
                            })

                    ],
                    components: []
                });
                return;
            }
        } catch (e) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Confirmation prompt timed out.')
                        .setDescription(`No interaction received within 15 seconds, aborting...`)
                        .setColor(Colors.DarkRed)
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ],
                components: []
            });
        }

        await client.knex('points').del();

        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Success.')
                    .setDescription('Successfully wiped everyone\'s points.')
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild.name,
                        iconURL: interaction.guild.iconURL()
                    })
            ]
        });
    }
}
