// handlers/xpHandler.js
const supabase = require('../db');
const ensureUser = require('../db/ensureUser');
const ensureGuild = require('../db/ensureGuild');
const ensureUserGuildStats = require('../db/ensureUserGuildStats');

function getXpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

async function handleXP(message) {
  if (message.author.bot || !message.guild) return;

  const { author, guild } = message;
  const now = new Date();

  await ensureGuild(guild);
  await ensureUser(author);
  await ensureUserGuildStats(author.id, guild.id);

  const { data: stats, error } = await supabase
    .from("user_guild_stats")
    .select("xp, level, coins, last_message")
    .eq("user_id", author.id)
    .eq("guild_id", guild.id)
    .single();

  if (error || !stats) return;

  const lastMessage = stats.last_message ? new Date(stats.last_message) : null;
  if (lastMessage && now - lastMessage < 60_000) return; // 1-minute cooldown

  const xpToAdd = Math.floor(Math.random() * 6) + 5;
  const coinsToAdd = Math.floor(Math.random() * 5) + 1;
  const newXP = stats.xp + xpToAdd;
  const xpNeeded = getXpForLevel(stats.level);

  if (newXP >= xpNeeded) {
    await supabase
      .from("user_guild_stats")
      .update({
        xp: newXP - xpNeeded,
        level: stats.level + 1,
        coins: stats.coins + coinsToAdd + 10, // Bonus coins
        last_message: now.toISOString(),
      })
      .eq("user_id", author.id)
      .eq("guild_id", guild.id);

    message.channel.send(
      `${author}, you've reached **Level ${stats.level + 1}**! 🎉\n(+${xpToAdd} XP, +${coinsToAdd + 10} coins)`
    );
  } else {
    await supabase
      .from("user_guild_stats")
      .update({
        xp: newXP,
        coins: stats.coins + coinsToAdd,
        last_message: now.toISOString(),
      })
      .eq("user_id", author.id)
      .eq("guild_id", guild.id);
  }
}

async function getXPData(userId, guildId) {
  const { data, error } = await supabase
    .from("user_guild_stats")
    .select("xp, level, coins")
    .eq("user_id", userId)
    .eq("guild_id", guildId)
    .single();

  return data || { xp: 0, level: 1, coins: 0 };
}

async function getTopUsers(guildId) {
  const { data, error } = await supabase
    .from("user_guild_stats")
    .select("user_id, xp, level, coins")
    .eq("guild_id", guildId)
    .order("xp", { ascending: false })
    .limit(10);

  return data || [];
}

module.exports = { handleXP, getXPData, getTopUsers };
