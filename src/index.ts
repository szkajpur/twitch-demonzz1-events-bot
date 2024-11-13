import { ChatClient, AlternateMessageModifier, PrivmsgMessage, ClearchatMessage } from '@mastondzn/dank-twitch-irc';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

dotenv.config();

interface BotConfig {
    username: string;
    oauth: string;
    channel: string;
    prefix: string;
    command: string;
    connect: string;
    bossBotName: string;
    heist: number;
    BANDonperma: boolean;
}

interface BotResponse {
    [key: string]: string;
}

type CommandHandler = (msg: PrivmsgMessage, args: string[]) => void | Promise<void>;

class TwitchBot {
    private config: BotConfig;
    private client: ChatClient | null;
    private commands: Map<string, CommandHandler>;
    private envPath: string;

    constructor() {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        this.envPath = path.resolve(currentDir, '../.env');
        this.validateEnvVariables();
        this.config = this.loadConfig();
        this.client = null;
        this.commands = new Map();
        this.initializeCommands();
    }

    private updateEnvFile(key: string, value: string): void {
        try {
            let envContent = readFileSync(this.envPath, 'utf-8');
            
            const envLines = envContent.split('\n');
            const keyRegex = new RegExp(`^${key}=.*$`);
            
            let updated = false;
            const updatedLines = envLines.map(line => {
                if (keyRegex.test(line)) {
                    updated = true;
                    return `${key}=${value}`;
                }
                return line;
            });

            if (!updated) {
                updatedLines.push(`${key}=${value}`);
            }

            writeFileSync(this.envPath, updatedLines.join('\n'));
            
            process.env[key] = value;
            
        } catch (error) {
            console.error(chalk.redBright(`Failed to update .env file: ${error}`));
            throw error;
        }
    }

    private validateEnvVariables(): void {
        const requiredEnvVars = [
            'TWITCH_USERNAME',
            'TWITCH_OAUTH',
            'TWITCH_CHANNEL',
            'COMMAND_PREFIX',
            'STATUS_COMMAND',
            'CONNECT_MESSAGE',
            'BOSS_BOT_NAME',
            'HEIST_AMOUNT',
            'BAND_ON_PERMA'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
    }

    private loadConfig(): BotConfig {
        return {
            username: process.env.TWITCH_USERNAME!,
            oauth: process.env.TWITCH_OAUTH!,
            channel: process.env.TWITCH_CHANNEL!,
            prefix: process.env.COMMAND_PREFIX!,
            command: process.env.STATUS_COMMAND!,
            connect: process.env.CONNECT_MESSAGE!,
            bossBotName: process.env.BOSS_BOT_NAME!,
            heist: parseInt(process.env.HEIST_AMOUNT!) || 1000,
            BANDonperma: process.env.BAND_ON_PERMA === 'true'
        };
    }

    private initializeCommands(): void {
        this.commands.set(this.config.command, (msg: PrivmsgMessage, args: string[]) => this.handleStatusCommand(msg, args));
        this.commands.set('ustaw', (msg: PrivmsgMessage, args: string[]) => this.handleSetHeistCommand(msg, args));
        this.commands.set('jakiheist', (msg: PrivmsgMessage, args: string[]) => this.handleCheckHeistCommand(msg, args));
    }

    public initialize(): void {
        this.client = new ChatClient({
            username: this.config.username,
            password: `oauth:${this.config.oauth}`,
            rateLimits: 'default',
        });

        this.client.use(new AlternateMessageModifier(this.client));
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        this.client.on('connecting', () => {
            console.log(chalk.blueBright('Connecting to Twitch...'));
        });

        this.client.on('ready', () => {
            if (!this.client) return;
            console.log(
                chalk.greenBright('Successfully connected to Twitch channel:') +
                chalk.blueBright(` ${this.config.channel}`)
            );
            this.client.say(this.config.channel, this.config.connect);
        });

        this.client.on('close', (error: Error | undefined) => {
            if (error) {
                console.error('Client closed due to error:', error);
            } else {
                console.log(chalk.redBright('Client closed'));
            }
        });

        this.client.on('PRIVMSG', (msg: PrivmsgMessage) => this.handleMessage(msg));
        this.client.on('CLEARCHAT', (msg: ClearchatMessage) => this.handleClearChat(msg));
    }

    private handleMessage(msg: PrivmsgMessage): void {
        const { senderUsername, messageText, channelName } = msg;

        if (senderUsername === this.config.bossBotName) {
            this.handleBossBotMessage(messageText, channelName);
            this.logMessage(channelName, senderUsername, messageText);
            return;
        }

        if (messageText.startsWith(this.config.prefix)) {
            this.handleCommand(msg);
        }
    }

    private handleBossBotMessage(message: string, channel: string): void {
        const responses: BotResponse = {
            'Type !boss to join!': '!boss',
            'Type !ffa to join!': '!ffa',
            '-Everyone can Join!- In order to join type !heist (amount).': `!heist ${this.config.heist}`
        };

        for (const [trigger, response] of Object.entries(responses)) {
            if (message.includes(trigger)) {
                this.client?.say(channel, response);
                break;
            }
        }
    }

    private handleCommand(msg: PrivmsgMessage): void {
        const args = msg.messageText
            .slice(this.config.prefix.length)
            .trim()
            .split(/\s+/);
        const command = args.shift()?.toLowerCase();

        if (command) {
            const commandHandler = this.commands.get(command);
            if (commandHandler) {
                commandHandler(msg, args);
            }
        }
    }

    private handleStatusCommand(msg: PrivmsgMessage, args: string[]): void {
        this.client?.say(msg.channelName, `@${msg.senderUsername}, Bot działa prawidłowo ;)`);
        this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);
    }

    private async handleSetHeistCommand(msg: PrivmsgMessage, args: string[]): Promise<void> {
        if (!this.client) return;
        if (msg.senderUsername !== this.client.configuration.username) return;

        const heist = parseInt(args[0]);
        if (isNaN(heist) || heist <= 0 || heist > 10000) {
            this.client.say(
                msg.channelName,
                `@${msg.senderUsername}, Podaj liczbę od 1 do max 10k!`
            );
            return;
        }

        try {
            this.updateEnvFile('HEIST_AMOUNT', heist.toString());
            this.config.heist = heist;
            
            this.client.say(
                msg.channelName,
                `@${msg.senderUsername}, Pomyślnie zmieniono ilość heista na ${heist}!`
            );
            this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);
            
            console.log(chalk.greenBright(`Successfully updated HEIST_AMOUNT to ${heist} in .env file`));
            
        } catch (error) {
            this.client.say(
                msg.channelName,
                `@${msg.senderUsername}, Wystąpił błąd podczas aktualizacji wartości heist!`
            );
            console.error(chalk.redBright('Error updating heist amount:'), error);
        }
    }

    private handleCheckHeistCommand(msg: PrivmsgMessage, args: string[]): void {
        if (!this.client) return;
        if (msg.senderUsername !== this.client.configuration.username) return;
        
        this.client.say(
            msg.channelName,
            `@${msg.senderUsername}, Masz aktualnie ustawione ${this.config.heist} heista ;)`
        );
        this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);
    }

    private handleClearChat(msg: ClearchatMessage): void {
        if (msg.isPermaban() && this.config.BANDonperma) {
            this.client?.say(msg.channelName, 'BAND');
        }
    }

    private logMessage(channel: string, username: string, message: string): void {
        console.log(
            chalk.cyanBright(`#${channel} `) +
            chalk.yellowBright(`${username} -> `) +
            chalk.greenBright(message)
        );
    }

    public start(): void {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        try {
            this.client.connect();
            this.client.join(this.config.channel);
        } catch (error) {
            console.error('Failed to start the bot:', error);
            process.exit(1);
        }
    }
}

const bot = new TwitchBot();
bot.initialize();
bot.start();