const { Client, GatewayIntentBits } = require("@jubbio/core");
const http = require("http");

const TOKEN = process.env.BOT_TOKEN;

// Token kontrolü
if (!TOKEN) {
  console.error("❌ BOT_TOKEN bulunamadı!");
  process.exit(1);
}

console.log(`✅ Token alındı, uzunluk: ${TOKEN.length}`);

// HTTP sunucu (Render için)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP sunucu ${PORT} portunda çalışıyor`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`✅ ${client.user?.username} çevrimiçi!`);
  console.log(`📊 ${client.guilds.size} sunucu`);
  console.log(`🆔 Bot ID: ${client.user?.id}`);
});

client.on("messageCreate", async (message) => {
  // Debug için
  console.log(`📨 Mesaj: ${message.content} | Kanal: ${message.channel?.name}`);
  
  if (message.author?.bot) return;
  if (!message.guild) return;
  if (!message.content?.startsWith("!")) return;

  const cmd = message.content.slice(1).trim().toLowerCase();
  console.log(`🎯 Komut: ${cmd}`);

  if (cmd === "ping") {
    console.log("🏓 Ping komutu çalıştı!");
    try {
      const start = Date.now();
      const msg = await message.reply("🏓 Ölçülüyor...");
      const ping = Date.now() - start;
      await msg.edit(`🏓 Pong! \`${ping}ms\``);
      console.log(`✅ Ping yanıtı gönderildi: ${ping}ms`);
    } catch (err) {
      console.error("❌ Ping hatası:", err.message);
    }
  }
});

client.on("error", (err) => console.error("❌ Client error:", err.message));
client.on("disconnect", () => console.log("❌ Bağlantı kesildi!"));
client.on("reconnecting", () => console.log("🔄 Yeniden bağlanıyor..."));

console.log("🚀 Bot başlatılıyor...");
client.login(TOKEN).catch(err => {
  console.error("❌ Login hatası:", err.message);
});
