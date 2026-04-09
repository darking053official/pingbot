const { Client, GatewayIntentBits } = require("@jubbio/core");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("ready", () => console.log("Bot hazır!"));

client.on("messageCreate", (msg) => {
  console.log("GELEN MESAJ:", msg.content);
});

client.login(process.env.BOT_TOKEN);
