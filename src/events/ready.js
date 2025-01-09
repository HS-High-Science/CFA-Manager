import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    await client.user.setActivity({
        name: 'with the Computer Core.',
        type: ActivityType.Playing,
    });
};