const supabase = require('../db');

async function ensureGuild(guild) {
  const { data, error } = await supabase
    .from("guilds")
    .select("id")
    .eq("guild_id", guild.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase select error in ensureGuild:", error);
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("guilds").insert({
      guild_id: guild.id,
      guild_name: guild.name,
    });

    if (insertError) {
      console.error("Error inserting guild:", insertError);
      throw insertError;
    }
  }
}

module.exports = ensureGuild;
