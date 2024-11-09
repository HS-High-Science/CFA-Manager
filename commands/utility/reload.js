const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { restart } = require('pm2');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The command you want to reload')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const allowedIDs = ["1226408360551645254", "427832787605782549"]

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const commandName = interaction.options.getString('command', true).toLowerCase();
            const command = interaction.client.commands.get(commandName);

            if (!command) {
                return interaction.reply(`There is no command with name \`${commandName}\`!`);
            }

            delete require.cache[require.resolve(`./${command.data.name}.js`)]

            try {
                interaction.client.commands.delete(command.data.name);
                const newCommand = require(`./${command.data.name}.js`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                return interaction.editReply({ content: `Command ${newCommand.data.name} reloaded!` });
            } catch (error) {
                console.error(error);

                return interaction.editReply({
                    embeds:
                        [
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle('Reload Failed')
                                .setDescription(`The program ran into error when trying to reload ${command.data.name} command`)
                                .setFields([
                                    { name: 'Error', value: `\`\`\`\n${error}\`\`\`` },
                                ])
                                .setTimestamp()
                                .setFooter({ text: interaction.guild.name })
                        ]
                });
            }
        } else {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }
    }
}