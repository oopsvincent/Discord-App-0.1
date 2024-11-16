// // Import the necessary libraries and modules
// require('dotenv').config();
// const { Client, GatewayIntentBits } = require('discord.js');
// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// // Log in to the Discord bot
// client.once('ready', () => {
//     console.log('Bot is ready!');
// });

// client.login(process.env.DISCORD_TOKEN); // Make sure your token is in your .env file

// // Command handling
// client.on('messageCreate', message => {
//     if (!message.content.startsWith('!') || message.author.bot) return;

//     const args = message.content.slice(1).split(/ +/); // Remove '!' and split by spaces
//     const command = args.shift().toLowerCase();

//     // Command to show the avatar
//     if (command === 'avatar') {
//         const user = message.mentions.users.first() || message.author; // Get mentioned user or the command sender
//         message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true, size: 512 })}`);
//     }

//     // Command to tell a joke
//     else if (command === 'joke') {
//         const jokes = [
//             "Why did the scarecrow win an award? Because he was outstanding in his field!",
//             "Why don't scientists trust atoms? Because they make up everything!",
//             "Why did the bicycle fall over? Because it was two-tired!"
//         ];
//         const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
//         message.channel.send(randomJoke);
//     }
// });


require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const oneLinerJoke = require('one-liner-joke');

// Initialize the client
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
        .setDescription('Replies with a random joke')
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
