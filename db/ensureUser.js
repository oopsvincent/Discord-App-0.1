const supabase = require('../db');

async function ensureUser(user) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase select error in ensureUser:", error);
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("users").insert([
      {
        discord_id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      },
    ]);

    if (insertError) {
      console.error("Error inserting user:", insertError);
      throw insertError;
    }
  }
}

module.exports = ensureUser;
