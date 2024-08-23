import { ChatClient, AlternateMessageModifier } from '@mastondzn/dank-twitch-irc';
import chalk from 'chalk';
import editJsonFile from "edit-json-file";
import reload from 'self-reload-json';

const __dirname = new URL('.', import.meta.url).pathname;

var config = new reload(__dirname + '/config.json');

let file = editJsonFile(__dirname + '/config.json', {
    autosave: true
});

// declare client
let client = new ChatClient({
    username: config.username,
    password: `oauth:${config.oauth}`,
    rateLimits: "default",
    connection: {
        type: "websocket",
        secure: true,
    },
});

// events on client
client.use(new AlternateMessageModifier(client));

client.on("connecting", async () => {
    console.log(chalk.blueBright("Łączenie..."));
});

client.on("ready", async () => {
	console.log(chalk.greenBright("Pomyślnie połączono do czatu:") + chalk.blueBright(` ${config.channels[0]}`));
    client.say(config.channels[0], `${config.connect}`);
});

client.on("close", async (error) => {
    if (error !== null){
        console.error(`Client closed due to error`, error);
    } else {
        console.log(chalk.redBright("Client closed"));
    }
});

//demonzzbot events
client.on("PRIVMSG", async (msg) => {
    if (msg.senderUsername === config.bossBotName){
        if (msg.messageText.includes("Type !boss to join!")){
            client.say(msg.channelName, "!boss");
        }
        if (msg.messageText.includes("Type !ffa to join!")){
            client.say(msg.channelName, "!ffa");
        }
        if (msg.messageText.includes("-Everyone can Join!- In order to join type !heist (amount).")){
            client.say(msg.channelName, `!heist ${config.heist}`);
        }
        console.log(chalk.cyanBright(`#${msg.channelName} `) + chalk.yellowBright(`${msg.senderUsername} `) + chalk.greenBright(`-> ${msg.messageText}`));
    };
//commands
    if (msg.messageText.startsWith(config.prefix)){
        const args = msg.messageText.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        switch(command){
            case `${config.command}`:
                client.say(msg.channelName, `@${msg.senderUsername}, Bot działa prawidłowo ;)`);
                console.log(chalk.cyanBright(`#${msg.channelName} `) + chalk.yellowBright(`${msg.senderUsername} -> `) + chalk.greenBright(`${msg.messageText}`));
                break;
            case "ustaw":
                if (msg.senderUsername !== client.configuration.username) { return };
                let heist = parseInt(args[0]);
                if (isNaN(heist)){
                    client.say(msg.channelName, `@${msg.senderUsername}, Podaj poprawną wartość! ${config.prefix}ustaw (liczba do max 10k)`);
                    return;
                } else if (heist > 10000 || heist <= 0){
                    client.say(msg.channelName, `@${msg.senderUsername}, Podaj liczbę od 1 do max 10k!`);
                    return;
                };
                file.set("heist", heist);
                client.say(msg.channelName, `@${msg.senderUsername}, Pomyślnie zmieniono ilość heista na ${heist}!`);
                console.log(chalk.cyanBright(`#${msg.channelName} `) + chalk.yellowBright(`${msg.senderUsername} -> `) + chalk.greenBright(`${msg.messageText}`));
                break;
            case "jakiheist":
                if (msg.senderUsername !== client.configuration.username) { return };
                client.say(msg.channelName, `@${msg.senderUsername}, Masz aktualnie ustawione ${config.heist} heista ;)`);
                console.log(chalk.cyanBright(`#${msg.channelName} `) + chalk.yellowBright(`${msg.senderUsername} -> `) + chalk.greenBright(`${msg.messageText}`));
                break;
        }
    }
});

client.on("CLEARCHAT", async (msg) => {
    if (msg.isPermaban() && config.BANDonperma === true){
        client.say(msg.channelName, "BAND");
    }
});

client.connect();
client.joinAll(config.channels);
