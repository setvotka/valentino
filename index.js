const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "v!";
const GUILD_ID = "1510001451533991968";
const SERVER_NAME = "Valentino";

// sistem ayarları
let logChannel = null;
let ticketCategory = null;

// GÜVENLİK: sadece bu sunucu
function securityCheck(message) {
  if (!message.guild) return false;
  if (message.guild.id !== GUILD_ID) return false;
  return true;
}

client.once("ready", () => {
  console.log(`${client.user.tag} aktif`);
});

// JOIN / LEAVE LOG
client.on("guildMemberAdd", member => {
  if (logChannel) {
    const ch = member.guild.channels.cache.get(logChannel);
    if (ch) ch.send(`[JOIN] ${member.user.tag}`);
  }
});

client.on("guildMemberRemove", member => {
  if (logChannel) {
    const ch = member.guild.channels.cache.get(logChannel);
    if (ch) ch.send(`[LEAVE] ${member.user.tag}`);
  }
});

// MESSAGE SYSTEM
client.on("messageCreate", async (message) => {
  if (!securityCheck(message)) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // LOG AYAR
  if (cmd === "log") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("yetkin yok");

    const ch = message.mentions.channels.first();
    if (!ch) return message.reply("kanal etiketle");

    logChannel = ch.id;
    return message.reply("log ayarlandı");
  }

  // BAN
  if (cmd === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("yetkin yok");

    const user = message.mentions.members.first();
    if (!user) return message.reply("kullanıcı etiketle");

    await user.ban();
    return message.reply("banlandı");
  }

  // KICK
  if (cmd === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("yetkin yok");

    const user = message.mentions.members.first();
    if (!user) return message.reply("kullanıcı etiketle");

    await user.kick();
    return message.reply("atıldı");
  }

  // CLEAR
  if (cmd === "clear") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("yetkin yok");

    const amount = parseInt(args[0]);
    if (!amount || amount > 100) return message.reply("1-100 arası");

    await message.channel.bulkDelete(amount);
    return message.reply("silindi").then(m => setTimeout(() => m.delete(), 2000));
  }

  // TICKET PANEL (BUTONLU)
  if (cmd === "ticketpanel") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("yetkin yok");

    const embed = new EmbedBuilder()
      .setTitle("Ticket Sistemi")
      .setDescription("Ticket açmak için butona bas")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("Ticket Aç")
        .setStyle(ButtonStyle.Primary)
    );

    return message.channel.send({ embeds: [embed], components: [row] });
  }
});

// BUTON SİSTEMİ
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // TICKET AÇ
  if (interaction.customId === "ticket_open") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Ticket Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `${interaction.user} ticket açtı`,
      components: [closeBtn]
    });

    return interaction.reply({ content: "ticket açıldı", ephemeral: true });
  }

  // TICKET KAPAT
  if (interaction.customId === "ticket_close") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "yetkin yok", ephemeral: true });

    await interaction.channel.delete();
  }
});

client.login(process.env.TOKEN);
