const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const oneLinerJoke = require('one-liner-joke');

// Initialize the Discord bot client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register the slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of the mentioned user or yourself')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('Select a user to view their avatar')
            .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Replies with a random joke'),
];

// Register the commands with Discord’s API
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(command => command.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Ready event
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'avatar') {
        const user = interaction.options.getUser('user') || interaction.user;
        await interaction.reply(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true, size: 512 })}`);
    }

    else if (interaction.commandName === 'joke') {
        const joke = oneLinerJoke.getRandomJoke().body; // Get a random joke
        await interaction.reply(joke);
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// For Vercel's serverless environment
module.exports = (req, res) => {
    res.status(200).send('Bot is running!');
};
