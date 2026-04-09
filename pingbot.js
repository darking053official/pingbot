const { JubbioClient, CommandBuilder } = require('@jubbio/core');
require('dotenv').config();
const os = require('os');

const client = new JubbioClient({
    name: "Ping Monitor",
    version: "1.0.0"
});

// --- 1. PING KOMUTU ---
const pingCommand = new CommandBuilder()
    .setName('ping')
    .setDescription('Sadece gecikme süresini ölçer.')
    .setExecute(async () => {
        const start = performance.now();
        // Ufak bir işlem simülasyonu
        const end = performance.now();
        return {
            message: "🏓 Pong!",
            latency: `${(end - start).toFixed(3)}ms`
        };
    });

// --- 2. BOTMONITOR KOMUTU ---
const monitorCommand = new CommandBuilder()
    .setName('botmonitor')
    .setDescription('Sistem ve Sunucu durumunu jilet gibi raporlar.')
    .setExecute(async () => {
        const ut_sec = os.uptime();
        const d = Math.floor(ut_sec / (3600 * 24));
        const h = Math.floor((ut_sec % (3600 * 24)) / 3600);
        const m = Math.floor((ut_sec % 3600) / 60);

        const ramPercent = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1);
        const cpuLoad = (os.loadavg()[0] * 10).toFixed(1);

        const createBar = (percent) => {
            const size = 10;
            const filled = Math.round((Math.min(percent, 100) / 100) * size);
            return '▰'.repeat(filled) + '▱'.repeat(size - filled);
        };

        return {
            title: "📊 SISTEM MONITORU",
            uptime: `${d}g ${h}s ${m}d`,
            cpu: `${createBar(cpuLoad)} %${cpuLoad}`,
            ram: `${createBar(ramPercent)} %${ramPercent}`,
            servers: "12 Aktif Sunucu",
            status: "Stabil"
        };
    });

// Komutları client'a manuel ekliyoruz
client.commands.set(pingCommand.name, pingCommand);
client.commands.set(monitorCommand.name, monitorCommand);

client.on('ready', () => {
    console.log(`──────────────────────────────────────────`);
    console.log(`🚀 ${client.name} Aktif!`);
    console.log(`📡 Kayıtlı Komutlar: ${Array.from(client.commands.keys()).join(', ')}`);
    console.log(`──────────────────────────────────────────`);
});

// Test için konsola çıktı veriyoruz
client.on('commandExecute', (command, result) => {
    console.log(`\n[KOMUT] !${command.name} çalıştırıldı.`);
    console.table(result);
});

client.connect(process.env.BOT_TOKEN);
