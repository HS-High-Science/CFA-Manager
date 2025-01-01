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

        const allowedIDs = ["1226408360551645254", "427832787605782549", "597084523338924063"]

        if (interaction.member.roles.cache.hasAny(...allowedIDs) || allowedIDs.includes(interaction.member.id)) {
            const commandName = interaction.options.getString('command', true).toLowerCase();
            const command = interaction.client.commands.get(commandName);
            const commandPaths = ['../../command', '../../developer', '../../utility'];

            if (!command) {
                return await interaction.editReply(`There is no command with name \`${commandName}\`!`);
            };

            for (const path of commandPaths) {
                try {
                    delete require.cache[require.resolve(`${path}/${command.data.name}.js`)];

                    try {
                        const newCommand = require(`${path}/${command.data.name}.js`);

                        await interaction.client.commands.set(newCommand.data.name, newCommand);
                        return await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(Colors.Green)
                                    .setTitle('Reload Successful')
                                    .setDescription(`Successfully reloaded \`${command.data.name}\` command.`)
                                    .setTimestamp()
                                    .setFooter({
                                        text: interaction.guild.name,
                                        iconURL: interaction.guild.iconURL()
                                    })
                            ]
                        });
                    } catch (error) {
                        console.error(error);
                        return await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(Colors.Red)
                                    .setTitle('Reload Error')
                                    .setDescription(`An error has occured while reloading \`${command.data.name}\` command.`)
                                    .setFields({ name: 'Error message', value: `\`\`\`js\n${error}\n\`\`\`` })
                                    .setTimestamp()
                                    .setFooter({
                                        text: interaction.guild.name,
                                        iconURL: interaction.guild.iconURL()
                                    })
                            ]
                        });
                    };
                } catch {
                    continue;
                };
            };
        } else {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('Access Denied')
                        .setDescription('You do not have the required permissions to run this command.')
                        .setTimestamp()
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            });
        };
    }
};