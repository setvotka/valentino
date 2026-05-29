const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// TOKEN BURADA YOK
// hosting sağlayıcıdan gelecek

const PREFIX = "v!";
const GUILD_ID = "1510001451533991968";

client.once("ready", () => {
  console.log(`${client.user.tag} aktif`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.guild.id !== GUILD_ID) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "ping") {
    return message.reply("pong");
  }

  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("yetki yok");

    const user = message.mentions.members.first();
    if (!user) return message.reply("etiketle");

    await user.ban();
    return message.reply("banlandı");
  }
});
