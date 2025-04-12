import { Colors, EmbedBuilder } from "discord.js";

export default async (client) => {
    try {
        const reminderChannel = client.channels.cache.get('1305613090326581258');
        const guild = client.guilds.cache.get('1051410260641972304');
        const now = Math.floor(Date.now() / 1000);
        const tenMinsFromNow = now + 600;
        const training = await client.knex('trainings')
            .select('*')
            .where('training_date', '>=', now)
            .andWhere('training_date', '<=', tenMinsFromNow)
            .andWhere('is_concluded', false)
            .andWhere('is_reminded', false)
            .first();

        if (training) {
            await reminderChannel.send({
                allowedMentions: { parse: ['users'] },
                content: `<@${training.host_id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setTitle('Training reminder.')
                        .setDescription(`The training you have scheduled is starting <t:${training.training_date}:R>.
Make sure you are ready to host the training.

If you are unable to host it, you can use the \`/training cancel\` command to cancel and delete this training.`)
                        .setFields({ name: 'Training ID', value: training.training_id })
                        .setThumbnail(guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: guild.name,
                            iconURL: guild.iconURL()
                        })
                ]
            });

            await client.knex('trainings')
                .update({ is_reminded: true })
                .where('training_id', training.training_id);
        }

        const raid = await client.knex('raids')
            .select('*')
            .where('raid_date', '>=', now)
            .andWhere('raid_date', '<=', tenMinsFromNow)
            .andWhere('is_concluded', false)
            .andWhere('is_reminded', false)
            .first();

        if (raid) {
            await reminderChannel.send({
                allowedMentions: { parse: ['users'] },
                content: `<@${raid.host_id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setTitle('Raid reminder.')
                        .setDescription(`The raid you have scheduled is starting <t:${raid.raid_date}:R>.
Make sure you are ready to host the raid.

If you are unable to host it, you can use the \`/raid cancel\` command to cancel and delete this raid.`)
                        .setFields({ name: 'Raid ID', value: raid.raid_id })
                        .setThumbnail(guild.iconURL())
                        .setTimestamp()
                        .setFooter({
                            text: guild.name,
                            iconURL: guild.iconURL()
                        })
                ]
            });

            await client.knex('raids')
                .update({ is_reminded: true })
                .where('raid_id', raid.raid_id);
        }
    } catch (error) {
        console.error(error);
    }
}
