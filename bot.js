require("node-fetch");

require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const fetch = require("node-fetch");
const oneLinerJoke = require("one-liner-joke");
const { createClient } = require("@supabase/supabase-js");
const { handleXP, getTopUsers, getXPData } = require("./handlers/xpHandler");
const ensureGuild = require("./db/ensureGuild");
const ensureUser = require("./db/ensureUser");
const ensureUserGuildStats = require("./db/ensureUserGuildStats");

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Handle XP on every message
client.on("messageCreate", handleXP);

// Notify when bot is ready
client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setPresence({
    activities: [{ name: "oopsvincent. type /help for fun", type: 2 }],
    status: "invisible",
  });
});

// Slash command definitions
const commands = [
  new SlashCommandBuilder()
    .setName("hi")
    .setDescription("Says Hello")
    .addUserOption((option) =>
      option.setName("user").setDescription("Greet a user").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays the avatar of a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select a user").setRequired(false)
    ),
  new SlashCommandBuilder().setName("joke").setDescription("Tells a joke"),
  new SlashCommandBuilder().setName("joke10").setDescription("Tells 10 jokes"),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays server information"),
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays your user information"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all bot commands"),
  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a yes/no question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends a random meme"),
  new SlashCommandBuilder().setName("quote").setDescription("Get a quote"),
  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder")
    .addStringOption((option) =>
      option.setName("time").setDescription("e.g., 10s, 1m").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Reminder text")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show your XP and level"),
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your coins"),
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show top users in this server"),
];

// Register the commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Refreshing slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands.map((command) => command.toJSON()),
    });
    console.log("Slash commands registered.");
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
})();

// Command handling
// bot.js
// const ensureUser = require("./db/ensureUser");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, user, guild } = interaction;

//   try {
//     await ensureUser(user, guild); // 👈 This now handles everything
//   } catch (error) {
//     console.error("User setup error:", error);
//     return interaction.reply({
//       content: "Failed to setup your profile.",
//       ephemeral: true,
//     });
//   }

  // Proceed with command logic...


  // Handle commands
  switch (commandName) {
    case "hi":
      return interaction.reply(`Hello, ${targetUser.username}!`);
    case "avatar":
      return interaction.reply(
        `${targetUser.username}'s avatar: ${targetUser.displayAvatarURL({
          dynamic: true,
          size: 512,
        })}`
      );
    case "joke":
      return interaction.reply(oneLinerJoke.getRandomJoke().body);
    case "joke10":
      return interaction.reply(
        Array.from(
          { length: 10 },
          () => oneLinerJoke.getRandomJoke().body
        ).join("\n\n")
      );
    case "ping":
      return interaction.reply("Pong!");
    case "serverinfo":
      return interaction.reply(
        `**Server Name:** ${guild.name}\n**Members:** ${guild.memberCount}\n**Owner ID:** ${guild.ownerId}`
      );
    case "userinfo":
      return interaction.reply(
        `**Username:** ${user.username}\n**User ID:** ${
          user.id
        }\n**Created On:** ${user.createdAt.toDateString()}`
      );
    case "8ball":
      const replies = [
        "Yes, definitely.",
        "It is decidedly so.",
        "Reply hazy, try again.",
        "Cannot predict now.",
        "Don't count on it.",
        "Very doubtful.",
        "Absolutely not.",
        "Without a doubt.",
      ];
      const answer = replies[Math.floor(Math.random() * replies.length)];
      return interaction.reply(`🎱 ${answer}`);
    case "help":
      return interaction.reply(
        `**Commands List:**\n${commands
          .map((cmd) => `/${cmd.name} - ${cmd.description}`)
          .join("\n")}`
      );
    case "meme":
      try {
        await interaction.deferReply();
        const res = await fetch("https://meme-api.com/gimme");
        const data = await res.json();
        return interaction.editReply({
          content: `**${data.title}**\n👍 ${data.ups} | 🧑‍💻 u/${data.author}\n${data.url}`,
        });
      } catch (err) {
        console.error("Meme fetch failed:", err);
        return interaction.editReply("Failed to fetch a meme.");
      }
    // Add cases for rank, balance, leaderboard, remind, quote, etc.
    case "rank":
        await interaction.deferReply(); // tells Discord "we'll respond later"
      try {
        await ensureGuild(interaction.guild);
        await ensureUser(interaction.user);
        await ensureUserGuildStats(interaction.user.id, interaction.guild.id);

        const xpData = await getXPData(user.id, guild.id);
        if (!xpData) return interaction.reply("No XP data found.");
        return interaction.reply(
          `**${user.username}'s Rank:**\nLevel: ${xpData.level}\nXP: ${xpData.xp}`
        );
      } catch (err) {
        console.error(err);
        return interaction.reply("Failed to fetch rank data.");
      }

        case "balance":
        await interaction.deferReply(); // tells Discord "we'll respond later"
      try {
        await ensureGuild(interaction.guild);
        await ensureUser(interaction.user);
        await ensureUserGuildStats(interaction.user.id, interaction.guild.id);

        const { data, error } = await supabase
          .from("user_guild_stats")
          .select("coins")
          .eq("user_id", interaction.user.id)
          .eq("guild_id", interaction.guild.id)
          .single();

        if (error || !data) {
          return interaction.reply("Could not retrieve your balance.");
        }

        return interaction.reply(`💰 You have **${data.coins} coins**.`);
      } catch (err) {
        console.error(err);
        return interaction.reply("Failed to fetch balance data.");
      }

        case "leaderboard":
      try {
        const { data, error } = await supabase
          .from("user_guild_stats")
          .select("user_id, xp")
          .eq("guild_id", interaction.guild.id)
          .order("xp", { ascending: false })
          .limit(10);

        if (error || !data || data.length === 0) {
          return interaction.reply("No leaderboard data available.");
        }

        const leaderboard = await Promise.all(
          data.map(async (entry, index) => {
            const user = await client.users.fetch(entry.user_id).catch(() => null);
            return `${index + 1}. **${user?.username || "Unknown User"}** - XP: ${entry.xp}`;
          })
        );

        return interaction.reply(`🏆 **Leaderboard:**\n${leaderboard.join("\n")}`);
      } catch (err) {
        console.error(err);
        return interaction.reply("Failed to fetch leaderboard.");
      }


    case "remind":
      const time = options.getString("time");
      const message = options.getString("message");
      const timeInMs = parseInt(time) * 1000; // Convert to milliseconds
      setTimeout(() => {
        interaction.user.send(`⏰ Reminder: ${message}`);
      }, timeInMs);
      return interaction.reply(`Reminder set for ${time} seconds.`);
    case "quote":
      try {
        const res = await fetch("https://api.quotable.io/random");
        const data = await res.json();
        return interaction.reply(`"${data.content}" - ${data.author}`);
      } catch (err) {
        console.error("Quote fetch failed:", err);
        return interaction.reply("Failed to fetch a quote.");
      }
    default:
      return interaction.reply("Command not yet implemented.");
  }
});

client.login(process.env.BOT_TOKEN);
