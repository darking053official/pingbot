const { Client, GatewayIntentBits } = require("@jubbio/core");

// Tüm intent'leri dene
const client = new Client({
  intents: 3276799 // Tüm intent'lerin bit mask'i
});

client.on("ready", () => {
  console.log("Bot hazır!");
  console.log("Bot ID:", client.user?.id);
});

client.on("messageCreate", (msg) => {
  console.log("MESAJ:", msg.content);
  if (msg.content === "!ping") {
    msg.reply("Pong!").catch(console.error);
  }
});

client.login(process.env.BOT_TOKEN);
