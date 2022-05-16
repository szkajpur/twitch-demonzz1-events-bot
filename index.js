const { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, replyToServerPing } = require('@kararty/dank-twitch-irc');
const chalk = require('chalk');
const { time } = require('console');
const fs = require('fs');
const editJsonFile = require("edit-json-file");
const reload = require('auto-reload');

var config = reload("./config.json", 3000);

let file = editJsonFile(`${__dirname}/config.json`, {
    autosave: true
});

// declare client
let client = new ChatClient({
    username: config.username,
    password: config.oauth,
    rateLimits: "default"
});

// events on client
client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 10));

client.on("ready", async () => {
	console.log(chalk.greenBright("Pomyślnie połączono do czatu:") + chalk.blueBright(` ${config.channels[0]}`));
    client.say(config.channels[0], `${config.connect}`);
});
client.on("close", async (error) => {
    if (error !== null){
        console.error(`Client closed due to error`, error);
    }
});

//demonzzbot events
client.on("PRIVMSG", async (msg) => {
    if (msg.senderUsername == config.bossBotName){
        if (msg.messageText.includes("Type !boss to join!")){
            client.say(msg.channelName, "!boss");
        }
        if (msg.messageText.includes("Type !ffa to join!")){
            client.say(msg.channelName, "!ffa");
        }
        if (msg.messageText.includes("-Everyone can Join!- In order to join type !heist (amount).")){
            client.say(msg.channelName, `!heist ${config.heist}`);
        }
    };
//commands
    if (msg.messageText.startsWith(config.prefix)){
        const args = msg.messageText.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        switch(command){
            case `${config.command}`:
                client.say(msg.channelName, `@${msg.senderUsername}, Bot działa prawidłowo ;)`);
                break;
            case "ustaw":
                if (msg.senderUsername != client.configuration.username){
                    return;
                };
                let heist = parseInt(args[0]);
                if (isNaN(heist)){
                    client.say(msg.channelName, `@${msg.senderUsername}, Podaj poprawną wartość! ${config.prefix}ustaw (liczba do max 10k)`);
                    return;
                } else if(heist > 10000){
                    client.say(msg.channelName, `@${msg.senderUsername}, Podaj liczbę do max 10k!`);
                    return;
                };
                file.set("heist", heist);
                client.say(msg.channelName, `@${msg.senderUsername}, Pomyślnie zmieniono ilość heista na ${heist}!`);
                break;
            case "jakiheist":
                if (msg.senderUsername != client.configuration.username){
                    return;
                };
                client.say(msg.channelName, `@${msg.senderUsername}, Masz aktualnie ustawione ${config.heist} heista ;)`);
                break;
        }
    }
});

client.connect();
client.joinAll(config.channels);
