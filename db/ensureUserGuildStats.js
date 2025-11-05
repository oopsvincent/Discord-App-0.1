const supabase = require('../db');

async function ensureUserGuildStats(userId, guildId) {
  const { data, error } = await supabase
    .from("user_guild_stats")
    .select("id")
    .eq("user_id", userId)
    .eq("guild_id", guildId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase select error in ensureUserGuildStats:", error);
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("user_guild_stats").insert({
      user_id: userId,
      guild_id: guildId,
    });

    if (insertError) {
      console.error("Error inserting user_guild_stats:", insertError);
      throw insertError;
    }
  }
}

module.exports = ensureUserGuildStats;
