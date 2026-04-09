const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const TOKEN = process.env.BOT_TOKEN;

// HTTP sunucu (Jubbio platformu için zorunlu değil ama çalıştığında sorun olmaz)
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online" }));
}).listen(10000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent  // Bu çok önemli!
  ]
  // gatewayUrl ve apiUrl kaldırıldı, varsayılanları kullan
});

client.on("ready", () => {
  console.log(`✅ ${client.user.username} hazır!`);
  console.log(`📊 ${client.guilds.size} sunucu`);
});

client.on("messageCreate", async (message) => {
  // SADECE TEST İÇİN: gelen her mesajı logla
  console.log(`Mesaj: ${message.content} | Kanal: ${message.channel?.name}`);

  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith("!")) return;

  const cmd = message.content.slice(1).trim().toLowerCase();

  if (cmd === "ping") {
    const start = Date.now();
    const msg = await message.reply("🏓 Ölçülüyor...");
    const ping = Date.now() - start;
    await msg.edit(`🏓 Pong! \`${ping}ms\``);
  }
});

client.login(TOKEN).catch(err => console.error("Login hatası:", err));
