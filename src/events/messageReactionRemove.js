import { Colors, EmbedBuilder, Events } from 'discord.js';

export const name = Events.MessageReactionRemove;

export async function execute(messageReaction, user) {
    try {
        if (!(messageReaction.message.author === messageReaction.client.user)) return;
        if (user === messageReaction.client.user) return;
        if (!(messageReaction.emoji.name === '✅')) return;

        const message = messageReaction.message;
        const client = messageReaction.client;
        const cfaReactionLogsChannel = client.channels.cache.get('1362830781621211197');
        const hspsReactionLogsChannel = client.channels.cache.get('1361350328443863092');
        const cfaTrainingsChannel = client.channels.cache.get('1203320915396530206');
        const cfaRaidChannel = client.channels.cache.get('1116696712061394974');
        const hspsChannel = client.channels.cache.get('1317426517302841424');
        const trainingAnns = await client.knex('trainings')
            .select('*')
            .where('message_id', message.id)
            .orWhere('hsps_message_id', message.id)
            .andWhere('is_concluded', false)
            .first();

        if (trainingAnns) {
            const isJointTraining = trainingAnns.training_type === 'jt';
            const isCfaMessage = message.id === trainingAnns.message_id;
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Training reaction removed.')
                .setDescription(`${user}'s ✅ reaction has been removed from the [training announcement](${message.url}).`)
                .setTimestamp();

            isCfaMessage ? await cfaReactionLogsChannel.send({ embeds: [embed] }) : await hspsReactionLogsChannel.send({ embeds: [embed] });

            if (isJointTraining) {
                const cfaMessage = await cfaTrainingsChannel.messages.fetch(trainingAnns.message_id);
                const cfaReactions = cfaMessage.reactions.resolve('✅').count;
                const hspsMessage = await hspsChannel.messages.fetch(trainingAnns.hsps_message_id);
                const hspsReactions = hspsMessage.reactions.resolve('✅').count;

                const cfaFields = cfaMessage.embeds[0].fields;
                cfaFields[cfaFields.findIndex(field => field.name === 'CFA reactions')].value = `${cfaReactions - 1 ?? 0} ✅`;
                cfaFields[cfaFields.findIndex(field => field.name === 'HSPS reactions')].value = `${hspsReactions - 1 ?? 0} ✅`;

                const hspsFields = hspsMessage.embeds[0].fields;
                hspsFields[hspsFields.findIndex(field => field.name === 'CFA reactions')].value = `${cfaReactions - 1 ?? 0} ✅`;
                hspsFields[hspsFields.findIndex(field => field.name === 'HSPS reactions')].value = `${hspsReactions - 1 ?? 0} ✅`;

                await cfaMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(cfaMessage.embeds[0].color)
                            .setTitle(cfaMessage.embeds[0].title)
                            .setDescription(cfaMessage.embeds[0].description)
                            .setThumbnail(cfaMessage.embeds[0].thumbnail.url)
                            .setFields(cfaFields)
                            .setTimestamp(new Date(cfaMessage.embeds[0].timestamp))
                            .setFooter(cfaMessage.embeds[0].footer)

                    ]
                });

                await hspsMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(hspsMessage.embeds[0].color)
                            .setTitle(hspsMessage.embeds[0].title)
                            .setDescription(hspsMessage.embeds[0].description)
                            .setThumbnail(hspsMessage.embeds[0].thumbnail.url)
                            .setFields(hspsFields)
                            .setTimestamp(new Date(hspsMessage.embeds[0].timestamp))
                            .setFooter(hspsMessage.embeds[0].footer)
                    ]
                });
            }
            return;
        }

        const raidAnns = await client.knex('raids')
            .select('*')
            .where('cfa_message_id', message.id)
            .orWhere('hsps_message_id', message.id)
            .andWhere('is_concluded', false)
            .first();

        if (raidAnns) {
            const isCfaMessage = message.id === raidAnns.cfa_message_id;
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Raid reaction removed.')
                .setDescription(`${user}'s ✅ reaction has been removed from the [raid announcement](${message.url}).`)
                .setTimestamp();

            isCfaMessage ? await cfaReactionLogsChannel.send({ embeds: [embed] }) : await hspsReactionLogsChannel.send({ embeds: [embed] });

            const cfaMessage = await cfaRaidChannel.messages.fetch(raidAnns.cfa_message_id);
            const hspsMessage = await hspsChannel.messages.fetch(raidAnns.hsps_message_id);
            const cfaReactions = cfaMessage.reactions.resolve('✅').count;
            const hspsReactions = hspsMessage.reactions.resolve('✅').count;

            const cfaFields = cfaMessage.embeds[0].fields;
            cfaFields[cfaFields.findIndex(field => field.name === 'CFA reactions')].value = `${cfaReactions - 1 ?? 0} ✅`;
            cfaFields[cfaFields.findIndex(field => field.name === 'HSPS reactions')].value = `${hspsReactions - 1 ?? 0} ✅`;

            const hspsFields = hspsMessage.embeds[0].fields;
            hspsFields[hspsFields.findIndex(field => field.name === 'CFA reactions')].value = `${cfaReactions - 1 ?? 0} ✅`;
            hspsFields[hspsFields.findIndex(field => field.name === 'HSPS reactions')].value = `${hspsReactions - 1 ?? 0} ✅`;

            await cfaMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(cfaMessage.embeds[0].color)
                        .setTitle(cfaMessage.embeds[0].title)
                        .setDescription(cfaMessage.embeds[0].description)
                        .setThumbnail(cfaMessage.embeds[0].thumbnail.url)
                        .setFields(cfaFields)
                        .setTimestamp(new Date(cfaMessage.embeds[0].timestamp))
                        .setFooter(cfaMessage.embeds[0].footer)

                ]
            });

            return await hspsMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(hspsMessage.embeds[0].color)
                        .setTitle(hspsMessage.embeds[0].title)
                        .setDescription(hspsMessage.embeds[0].description)
                        .setThumbnail(hspsMessage.embeds[0].thumbnail.url)
                        .setFields(hspsFields)
                        .setTimestamp(new Date(hspsMessage.embeds[0].timestamp))
                        .setFooter(hspsMessage.embeds[0].footer)
                ]
            });
        }
    } catch (error) {
        console.error(error);
    }
}
