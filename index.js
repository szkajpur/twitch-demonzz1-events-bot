const { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, replyToServerPing } = require('@aidenhadisi/amazeful-twitch-irc');
const chalk = require('chalk');
const config = require("./config.json");

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
    if (msg.senderUsername == client.configuration.username){
        return;        
    }
    if (msg.senderUserID == '180654261'){
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

//sprawdzanie czy bot dziala
    if (msg.messageText.startsWith(config.prefix)){
        const komenda = msg.messageText.slice(config.prefix.length).split(" ")[0];
        switch(komenda){
            case `${config.command}`:
                client.say(msg.channelName, `@${message.senderUsername}, Bot działa prawidłowo ;)`);
                break;
        }
    }
});

client.connect();
client.joinAll(config.channels);
