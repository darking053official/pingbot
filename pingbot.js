const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");

// ─── Ortam Değişkenleri ───────────────────────────────────────────
const TOKEN = process.env.BOT_TOKEN;

// ─── HTTP Sunucu (Port 10000) ─────────────────────────────────────
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: "PingBot", platform: "Jubbio" }));
}).listen(10000, () => console.log("🌐 HTTP sunucu port 10000'de çalışıyor."));

// ─── Jubbio Client ────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  gatewayUrl: "wss://realtime.jubbio.com/ws/bot",
  apiUrl: "https://gateway.jubbio.com/api/v1",
});

// ─── Ready Event ──────────────────────────────────────────────────
client.on("ready", async () => {
  console.log(`✅ ${client.user?.username} çevrimiçi!`);
  console.log(`📊 ${client.guilds.size} sunucuda aktif.`);
  console.log(`🆔 Bot ID: ${client.user?.id}`);
});

// ─── Message Create Event ─────────────────────────────────────────
client.on("messageCreate", async (message) => {
  // Bot mesajlarını ve DM'leri ignore et
  if (message.author.bot) return;
  if (!message.guild) return;

  // Sadece !ping ve !ms komutlarını dinle
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // ─── PING KOMUTU ────────────────────────────────────────────────
  if (cmd === "ping" || cmd === "ms") {
    const start = Date.now();
    const msg = await message.reply("🏓 Ölçülüyor...");
    const ping = Date.now() - start;

    // Botun uptime'ı
    const uptime = client.uptime;
    const uptimeStr = uptime
      ? `${Math.floor(uptime / 86400000)}g ${Math.floor((uptime % 86400000) / 3600000)}s ${Math.floor((uptime % 3600000) / 60000)}d`
      : "N/A";

    // Embed oluştur
    const embed = new EmbedBuilder()
      .setAuthor({ 
        name: client.user?.username, 
        iconURL: client.user?.avatarURL() 
      })
      .setTitle("🏓 PONG!")
      .setDescription(`**Mesaj Gecikmesi:** \`${ping}ms\``)
      .addFields(
        { name: "🤖 Bot Gecikmesi", value: `\`${Math.round(ping - 10)}ms\``, inline: true },
        { name: "⏱️ Çalışma Süresi", value: uptimeStr, inline: true },
        { name: "📊 Sunucular", value: `\`${client.guilds.size}\``, inline: true }
      )
      .setColor(ping < 100 ? Colors.Green : ping < 300 ? Colors.Yellow : Colors.Red)
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();

    return msg.edit({ content: null, embeds: [embed] });
  }

  // ─── YARDIM KOMUTU ──────────────────────────────────────────────
  if (cmd === "yardim" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📖 PingBot Komutları")
      .setDescription("Sade ve hızlı bir ping botu")
      .setColor(Colors.Blue)
      .addFields(
        { name: "🏓 !ping / !ms", value: "Botun gecikme süresini ölçer", inline: true },
        { name: "❓ !yardim / !help", value: "Bu yardım menüsünü gösterir", inline: true }
      )
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }
});

// ─── Hata Yakalama ────────────────────────────────────────────────
client.on("error", (err) => console.error("[CLIENT HATA]", err.message));
process.on("unhandledRejection", (err) => console.error("[UNHANDLED REJECTION]", err));
process.on("uncaughtException", (err) => console.error("[UNCAUGHT EXCEPTION]", err));

// ─── Botu Başlat ──────────────────────────────────────────────────
console.log("🤖 PingBot başlatılıyor...");
client.login(TOKEN);
