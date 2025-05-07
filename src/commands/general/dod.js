import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('dod')
    .setDescription('Door of Dread related commands.')
    .addSubcommand(sc => sc
        .setName('requirements')
        .setDescription('Check if the requirements for activating the Door of Dread are met.')
    )

export async function execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const onDuty1 = await client.knex('hsps.shook').select('*');
    const onDuty2 = await client.knex('hsps.active_shifts').select('*');
    const ranks = ['Senior Guardsman', 'Elite Guardsman', 'Specialist', 'Senior Specialist', 'Officer', 'Junior Instructor', 'Instructor', 'Deputy Director', 'Director of Defense', 'Owner'];
    const sgPlus = [];

    for (const log of onDuty1) {
        const guard = await client.knex('hsps.guards')
            .select('*')
            .where('guard_id', log.guard_id)
            .first();

        if (ranks.includes(guard.hsps_rank)) sgPlus.push(`${guard.guard_username} (${guard.hsps_rank})`);
    }

    for (const log of onDuty2) {
        const guard = await client.knex('hsps.guards')
            .select('*')
            .where('guard_username', log.guard_username)
            .first();

        if (ranks.includes(guard.hsps_rank)) sgPlus.push(`${guard.guard_username} (${guard.hsps_rank})`);
    }

    if (sgPlus.length < 2) return await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Requirements not met.')
                .setDescription('The Door of Dread cannot be authorized right now because there are currently less than 2 Senior Guardsmen+ on-duty.')
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
                .setTitle('Requirements possibly met.')
                .setDescription(`The following HSPS members that suit the Door of Dread requirements *(2 or more Senior Guardsmen+)* are currently on-duty:
- ${sgPlus.join('\n- ')}

**Please make sure they are in the server with you before asking for authorization.**`)
                .setTimestamp()
                .setFooter({
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL()
                })
        ]
    });
}
