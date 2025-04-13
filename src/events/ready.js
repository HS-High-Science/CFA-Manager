import { Events, ActivityType } from 'discord.js';
import reminderFunction from '../utils/function.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    await client.user.setActivity({
        name: 'with the Computer Core.',
        type: ActivityType.Playing,
    });

    const cfaTrainingsChannel = client.channels.cache.get('1203320915396530206');
    const hspsChannel = client.channels.cache.get('1317426517302841424');
    const cfaRaidChannel = client.channels.cache.get('1116696712061394974');

    await cfaTrainingsChannel.messages.fetch();
    await hspsChannel.messages.fetch();
    await cfaRaidChannel.messages.fetch();

    while (true) {
        await reminderFunction(client);

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
