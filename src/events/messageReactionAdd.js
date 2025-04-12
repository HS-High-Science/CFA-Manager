import { EmbedBuilder, Events } from 'discord.js';

export const name = Events.MessageReactionAdd;

export async function execute(messageReaction) {
    try {
        if (!messageReaction.message.author === messageReaction.client.user) return;
        if (!messageReaction.emoji.name === '✅') return;

        const message = messageReaction.message;
        const client = messageReaction.client;
        const cfaTrainingsChannel = client.channels.cache.get('1203320915396530206');
        const hspsChannel = client.channels.cache.get('1317426517302841424');
        const trainingAnns = await client.knex('trainings')
            .select('*')
            .where('message_id', message.id)
            .orWhere('hsps_message_id', message.id)
            .andWhere('training_type', 'jt')
            .andWhere('is_concluded', false)
            .first();

        if (trainingAnns) {
            const cfaMessage = await cfaTrainingsChannel.messages.fetch(trainingAnns.message_id);
            const hspsMessage = await hspsChannel.messages.fetch(trainingAnns.hsps_message_id);
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
    } catch (error) {
        console.error(error);
    }
}
