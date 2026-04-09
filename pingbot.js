const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const TOKEN = process.env.BOT_TOKEN;

// ─── HTTP Sunucu (Port 10000) ─────────────────────────────────────
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: "PingBot", platform: "Jubbio" }));
}).listen(10000, () => console.log("🌐 HTTP sunucu port 10000'de çalışıyor."));

// ─── Sistem Bilgileri Toplama ─────────────────────────────────────
function getSystemStats() {
  const totalMem = os.totalmem() / 1024 / 1024 / 1024; // GB
  const freeMem = os.freemem() / 1024 / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const memPercent = (usedMem / totalMem) * 100;
  
  const cpuUsage = os.loadavg()[0]; // 1 dakikalık load average
  const cpuPercent = Math.min(100, (cpuUsage / os.cpus().length) * 100);
  
  const uptime = os.uptime();
  const uptimeDays = Math.floor(uptime / 86400);
  const uptimeHours = Math.floor((uptime % 86400) / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  
  return {
    cpu: cpuPercent.toFixed(1),
    ram: memPercent.toFixed(1),
    ramUsed: usedMem.toFixed(1),
    ramTotal: totalMem.toFixed(1),
    uptime: `${uptimeDays}g ${uptimeHours}s ${uptimeMinutes}d`,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
  };
}

// ─── Jubbio Client ────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  gatewayUrl: "wss://realtime.jubbio.com/ws/bot",
  apiUrl: "https://gateway.jubbio.com/api/v1",
});

// Bot başlangıç zamanı
const botStartTime = Date.now();

// ─── Ready Event ──────────────────────────────────────────────────
client.on("ready", async () => {
  console.log(`✅ ${client.user?.username} çevrimiçi!`);
  console.log(`📊 ${client.guilds.size} sunucuda aktif.`);
  console.log(`🆔 Bot ID: ${client.user?.id}`);
});

// ─── Message Create Event ─────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  // ─── PING KOMUTU ────────────────────────────────────────────────
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

  // ─── BOT MONİTOR (Sistem Durumu) ────────────────────────────────
  if (cmd === "botmonitor" || cmd === "monitor") {
    const stats = getSystemStats();
    
    // CPU ve RAM için progress bar oluştur
    const cpuBar = createProgressBar(parseFloat(stats.cpu));
    const ramBar = createProgressBar(parseFloat(stats.ram));
    
    const embed = new EmbedBuilder()
      .setTitle("🖥️ PingBot Server Monitor")
      .setColor(Colors.Blue)
      .addFields(
        { name: "⏱️ Uptime", value: `\`${stats.uptime}\``, inline: false },
        { name: "🖥️ CPU", value: `\`${stats.cpu}%\` ${cpuBar}`, inline: true },
        { name: "💾 RAM", value: `\`${stats.ram}%\` ${ramBar}\n${stats.ramUsed}GB / ${stats.ramTotal}GB`, inline: true },
        { name: "💿 Sistem", value: `\`${stats.platform}\` \`${stats.arch}\``, inline: true },
        { name: "🖧 Hostname", value: `\`${stats.hostname}\``, inline: true }
      )
      .setFooter({ text: "PingBot • Jubbio" })
      .setTimestamp();
    
    return message.reply({ embeds: [embed] });
  }

// ─── BOT MONİTOR (Sistem Durumu) ────────────────────────────────
if (cmd === "botmonitor" || cmd === "monitor") {
  const stats = getSystemStats();
  
  // CPU ve RAM için progress bar oluştur (düzeltilmiş)
  const cpuBar = createProgressBar(parseFloat(stats.cpu));
  const ramBar = createProgressBar(parseFloat(stats.ram));
  
  const embed = new EmbedBuilder()
    .setTitle("🖥️ PingBot Server Monitor")
    .setColor(Colors.Blue)
    .addFields(
      { name: "⏱️ Uptime", value: `\`${stats.uptime}\``, inline: false },
      { name: "🖥️ CPU", value: `\`${stats.cpu}%\` ${cpuBar}`, inline: true },
      { name: "💾 RAM", value: `\`${stats.ram}%\` ${ramBar}\n${stats.ramUsed}GB / ${stats.ramTotal}GB`, inline: true },
      { name: "💿 Sistem", value: `\`${stats.platform}\` \`${stats.arch}\``, inline: true },
      { name: "🖧 Hostname", value: `\`${stats.hostname}\``, inline: true }
    )
    .setFooter({ text: "PingBot • Jubbio" })
    .setTimestamp();
  
  return message.reply({ embeds: [embed] });
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────
function createProgressBar(percent) {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  // █ = dolu, ░ = boş (veya 🟩 ve ⬜ kullan)
  return "█".repeat(filled) + "░".repeat(empty);
}
  
  // ─── YARDIM KOMUTU ──────────────────────────────────────────────
  if (cmd === "yardim" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📖 PingBot Komutları")
      .setDescription("Sade ve hızlı bir ping botu")
      .setColor(Colors.Purple)
      .addFields(
        { name: "🏓 !ping / !ms", value: "Botun gecikme süresini ölçer", inline: true },
        { name: "🖥️ !botmonitor / !monitor", value: "Sistem durumunu gösterir (CPU, RAM, Uptime)", inline: true },
        { name: "📊 !botistatistik / !botstats", value: "Bot istatistiklerini gösterir", inline: true },
        { name: "❓ !yardim / !help", value: "Bu yardım menüsünü gösterir", inline: true }
      )
      .setFooter({ text: "AIRBOT • Jubbio" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }
});

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────
function createProgressBar(percent) {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  const bar = "▰".repeat(filled) + "▱".repeat(empty);
  return bar;
}

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

// ─── Hata Yakalama ────────────────────────────────────────────────
client.on("error", (err) => console.error("[CLIENT HATA]", err.message));
process.on("unhandledRejection", (err) => console.error("[UNHANDLED REJECTION]", err));
process.on("uncaughtException", (err) => console.error("[UNCAUGHT EXCEPTION]", err));

// ─── Botu Başlat ──────────────────────────────────────────────────
console.log("🤖 PingBot başlatılıyor...");
client.login(TOKEN);
