const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const TOKEN = process.env.BOT_TOKEN;

// ─── HTTP SUNUCU (Jubbio'nun beklentisi için) ─────────────────────
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: "PingBot", platform: "Jubbio" }));
}).listen(10000, () => console.log("✅ HTTP sunucu port 10000'de çalışıyor."));

// ─── SİSTEM BİLGİLERİ ─────────────────────────────────────────────
function getSystemStats() {
  const totalMem = os.totalmem() / 1024 / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const memPercent = (usedMem / totalMem) * 100;
  
  const cpuUsage = os.loadavg()[0];
  const cpuPercent = Math.min(100, (cpuUsage / os.cpus().length) * 100);
  
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  return {
    cpu: cpuPercent.toFixed(1),
    ram: memPercent.toFixed(1),
    ramUsed: usedMem.toFixed(1),
    ramTotal: totalMem.toFixed(1),
    uptime: `${days}g ${hours}s ${minutes}d`,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
  };
}

// ─── PROGRESS BAR (DÜZGÜN ÇALIŞAN) ────────────────────────────────
function createProgressBar(percent) {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  // Basit ama her yerde görünen karakterler
  return "█".repeat(filled) + "░".repeat(empty);
}

// ─── BOTUN ÇALIŞMA SÜRESİ ─────────────────────────────────────────
const botStartTime = Date.now();

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  if (secs > 0 && parts.length === 0) parts.push(`${secs}sn`);
  return parts.join(" ") || "0sn";
}

// ─── JUBBIO CLIENT ─────────────────────────────────────────────────
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

// ─── READY OLAYI ───────────────────────────────────────────────────
client.on("ready", () => {
  console.log(`✅ ${client.user?.username} çevrimiçi!`);
  console.log(`📊 ${client.guilds.size} sunucuda aktif.`);
  console.log(`🆔 Bot ID: ${client.user?.id}`);
});

// ─── MESAJ OLAYI (KOMUTLAR) ───────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // 1. PİNG KOMUTU
  if (cmd === "ping" || cmd === "ms") {
    const start = Date.now();
    const msg = await message.reply("🏓 Ölçülüyor...");
    const ping = Date.now() - start;
    const embed = new EmbedBuilder()
      .setTitle("🏓 PONG!")
      .setDescription(`**Mesaj Gecikmesi:** \`${ping}ms\``)
      .addFields(
        { name: "🤖 Bot Gecikmesi", value: `\`${Math.round(ping - 10)}ms\``, inline: true },
        { name: "📊 Sunucular", value: `\`${client.guilds.size}\``, inline: true }
      )
      .setColor(ping < 100 ? Colors.Green : ping < 300 ? Colors.Yellow : Colors.Red)
      .setTimestamp();
    return msg.edit({ content: null, embeds: [embed] });
  }

  // 2. BOT MONİTÖR (Sistem durumu)
  if (cmd === "botmonitor" || cmd === "monitor") {
    const stats = getSystemStats();
    const cpuBar = createProgressBar(parseFloat(stats.cpu));
    const ramBar = createProgressBar(parseFloat(stats.ram));
    
    const embed = new EmbedBuilder()
      .setTitle("🖥️ PingBot Server Monitor")
      .setColor(Colors.Blue)
      .addFields(
        { name: "⏱️ Sistem Uptime", value: `\`${stats.uptime}\``, inline: false },
        { name: "🖥️ CPU Kullanımı", value: `\`${stats.cpu}%\` ${cpuBar}`, inline: true },
        { name: "💾 RAM Kullanımı", value: `\`${stats.ram}%\` ${ramBar}\n${stats.ramUsed}GB / ${stats.ramTotal}GB`, inline: true },
        { name: "💿 İşletim Sistemi", value: `\`${stats.platform} ${stats.arch}\``, inline: true },
        { name: "🖧 Hostname", value: `\`${stats.hostname}\``, inline: true }
      )
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // 3. BOT İSTATİSTİK
  if (cmd === "botistatistik" || cmd === "botstats") {
    const botUptime = Date.now() - botStartTime;
    const stats = getSystemStats();
    const embed = new EmbedBuilder()
      .setTitle("📊 PingBot İstatistikleri")
      .setColor(Colors.Gold)
      .setThumbnail(client.user?.avatarURL())
      .addFields(
        { name: "📊 Sunucu Sayısı", value: `\`${client.guilds.size}\``, inline: true },
        { name: "⏱️ Bot Çalışma Süresi", value: `\`${formatUptime(botUptime)}\``, inline: true },
        { name: "🖥️ Sistem CPU", value: `\`${stats.cpu}%\``, inline: true },
        { name: "💾 Sistem RAM", value: `\`${stats.ram}%\``, inline: true },
        { name: "🆔 Bot ID", value: `\`${client.user?.id}\``, inline: true },
        { name: "📅 Başlatılma", value: `<t:${Math.floor(botStartTime / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // 4. YARDIM KOMUTU
  if (cmd === "yardim" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📖 PingBot Komutları")
      .setDescription("Sade ve hızlı bir ping botu")
      .setColor(Colors.Purple)
      .addFields(
        { name: "🏓 `!ping` / `!ms`", value: "Bot gecikmesini ölçer", inline: true },
        { name: "🖥️ `!botmonitor`", value: "Sistem durumunu gösterir (CPU, RAM, uptime)", inline: true },
        { name: "📊 `!botistatistik`", value: "Bot istatistiklerini gösterir", inline: true },
        { name: "❓ `!yardim`", value: "Bu menüyü gösterir", inline: true }
      )
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }
});

// ─── HATA YAKALAMA ─────────────────────────────────────────────────
client.on("error", (err) => console.error("❌ Client hatası:", err.message));
process.on("unhandledRejection", (err) => console.error("❌ Yakalanmamış hata:", err));
process.on("uncaughtException", (err) => console.error("❌ Yakalanmamış exception:", err));

// ─── BOTU BAŞLAT ───────────────────────────────────────────────────
console.log("🤖 PingBot başlatılıyor...");
if (!TOKEN) console.error("❌ BOT_TOKEN ortam değişkeni ayarlanmamış!");
client.login(TOKEN);
