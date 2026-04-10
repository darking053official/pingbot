const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const client = new Client({
  intents: 3276799 // Tüm intent'ler
});

// ─── HTTP SUNUCU (Render için) ─────────────────────────────────────
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ 
      status: "online", 
      bot: client.user?.username || "PingBot",
      uptime: process.uptime(),
      guilds: client.guilds?.size || 0
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🌐 HTTP sunucu ${PORT} portunda çalışıyor`);
});

// ─── BOT BAŞLANGIÇ ZAMANI ─────────────────────────────────────────
const botStartTime = Date.now();

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
    arch: os.arch()
  };
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────
function createProgressBar(percent) {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// ─── UPTIME FORMAT ────────────────────────────────────────────────
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  return parts.join(" ") || "0d";
}

// ─── READY OLAYI ──────────────────────────────────────────────────
client.on("ready", () => {
  console.log(`✅ ${client.user?.username} hazır!`);
  console.log(`📊 ${client.guilds.size} sunucu`);
  console.log(`🆔 Bot ID: ${client.user?.id}`);
  console.log(`📍 by DRK`);
})
});

// ─── MESAJ OLAYI ──────────────────────────────────────────────────
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("!")) return;
  
  const cmd = msg.content.slice(1).trim().toLowerCase();
  
  // PING
  if (cmd === "ping") {
    const start = Date.now();
    const m = await msg.reply("🏓 Ölçülüyor...");
    const ping = Date.now() - start;
    await m.edit(`🏓 Pong! by DRK \`${ping}ms\``);
  }
  
  // BOTMONITOR
  if (cmd === "botmonitor" || cmd === "monitor") {
    const stats = getSystemStats();
    const cpuBar = createProgressBar(parseFloat(stats.cpu));
    const ramBar = createProgressBar(parseFloat(stats.ram));
    
    const embed = new EmbedBuilder()
      .setTitle("🖥️ PingBot Server Monitor by DRK")
      .setColor(Colors.Blue)
      .addFields(
        { name: "⏱️ Uptime", value: `\`${stats.uptime}\``, inline: false },
        { name: "🖥️ CPU", value: `\`${stats.cpu}%\` ${cpuBar}`, inline: true },
        { name: "💾 RAM", value: `\`${stats.ram}%\` ${ramBar}\n${stats.ramUsed}GB / ${stats.ramTotal}GB`, inline: true },
        { name: "💿 Sistem", value: `\`${stats.platform} ${stats.arch}\``, inline: true }
      )
      .setTimestamp();
    
    await msg.reply({ embeds: [embed] });
  }
  
  // BOTISTATISTIK
  if (cmd === "botistatistik" || cmd === "botstats") {
    const botUptime = Date.now() - botStartTime;
    const stats = getSystemStats();
    
    const embed = new EmbedBuilder()
      .setTitle("📊 PingBot İstatistikleri")
      .setColor(Colors.Gold)
      .addFields(
        { name: "📊 Sunucu", value: `\`${client.guilds.size}\``, inline: true },
        { name: "⏱️ Bot Uptime", value: `\`${formatUptime(botUptime)}\``, inline: true },
        { name: "🖥️ CPU", value: `\`${stats.cpu}%\``, inline: true },
        { name: "💾 RAM", value: `\`${stats.ram}%\``, inline: true },
        { name: "🆔 Bot ID", value: `\`${client.user?.id}\``, inline: true }
      )
      .setTimestamp();
    
    await msg.reply({ embeds: [embed] });
  }
  
  // YARDIM
  if (cmd === "yardim" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📖 PingBot Komutları")
      .setColor(Colors.Purple)
      .addFields(
        { name: "🏓 !ping", value: "Bot gecikmesi", inline: true },
        { name: "🖥️ !botmonitor", value: "Sistem durumu", inline: true },
        { name: "📊 !botistatistik", value: "Bot istatistik", inline: true },
        { name: "❓ !yardim", value: "Bu menü", inline: true }
      )
      .setTimestamp();
    await msg.reply({ embeds: [embed] });
  }
});

// ─── HATA YAKALAMA ────────────────────────────────────────────────
client.on("error", (err) => console.error("❌ Client error:", err.message));
process.on("unhandledRejection", (err) => console.error("❌ Unhandled rejection:", err));

// ─── BOTU BAŞLAT ──────────────────────────────────────────────────
console.log("🚀 PingBot başlatılıyor...");
client.login(process.env.BOT_TOKEN);
