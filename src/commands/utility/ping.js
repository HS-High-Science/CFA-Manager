import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the heart beat!');

export async function execute(interaction) {
    const embed = new EmbedBuilder().setDescription("`Pinging...`").setColor(Colors.Blue);
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    const timestamp = interaction.createdTimestamp;
    const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
    const apiLatency = `\`\`\`ini\n[ ${Math.round(interaction.client.ws.ping)}ms ]\`\`\``;

    embed
        .setTitle(`Pong! 🏓`)
        .addFields(
            { name: "Latency", value: latency, inline: true },
            { name: "API latency", value: apiLatency, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "CFA Manager Bot" });

    await msg.edit({ embeds: [embed] });
}
