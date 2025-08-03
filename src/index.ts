import { readFileSync, writeFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
	AlternateMessageModifier,
	ChatClient,
	type ClearchatMessage,
	type PrivmsgMessage,
} from "@mastondzn/dank-twitch-irc";
import chalk from "chalk";
import dotenv from "dotenv";

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

type CommandHandler = (
	msg: PrivmsgMessage,
	args: string[],
) => void | Promise<void>;

class TwitchBot {
	private config: BotConfig;
	private client: ChatClient | null = null;
	private commands = new Map<string, CommandHandler>();
	private readonly envPath: string;

	private readonly bossBotResponses = new Map<string, string | (() => string)>([
		["Type !boss to join!", "!boss"],
		["Type !ffa to join!", "!ffa"],
		[
			"-Everyone can Join!- In order to join type !heist (amount).",
			() => `!heist ${this.config.heist}`,
		],
	]);

	private readonly requiredEnvVars = [
		"TWITCH_USERNAME",
		"TWITCH_OAUTH",
		"TWITCH_CHANNEL",
		"COMMAND_PREFIX",
		"STATUS_COMMAND",
		"CONNECT_MESSAGE",
		"BOSS_BOT_NAME",
		"HEIST_AMOUNT",
		"BAND_ON_PERMA",
	] as const;

	constructor() {
		const currentDir = dirname(fileURLToPath(import.meta.url));
		this.envPath = path.resolve(currentDir, "../.env");
		this.validateEnvVariables();
		this.config = this.loadConfig();
		this.initializeCommands();
	}

	private validateEnvVariables(): void {
		const missingVars = this.requiredEnvVars.filter(
			(varName) => !process.env[varName],
		);
		if (missingVars.length > 0) {
			throw new Error(
				`Missing required environment variables: ${missingVars.join(", ")}`,
			);
		}
	}

	private loadConfig(): BotConfig {
		const env = process.env;
		return {
			username: env.TWITCH_USERNAME!,
			oauth: env.TWITCH_OAUTH!,
			channel: env.TWITCH_CHANNEL!,
			prefix: env.COMMAND_PREFIX!,
			command: env.STATUS_COMMAND!,
			connect: env.CONNECT_MESSAGE!,
			bossBotName: env.BOSS_BOT_NAME!,
			heist: parseInt(env.HEIST_AMOUNT!) || 1000,
			BANDonperma: env.BAND_ON_PERMA === "true",
		};
	}

	private initializeCommands(): void {
		this.commands.set(this.config.command, this.handleStatusCommand.bind(this));
		this.commands.set("ustaw", this.handleSetHeistCommand.bind(this));
		this.commands.set("jakiheist", this.handleCheckHeistCommand.bind(this));
	}

	private updateEnvFile(key: string, value: string): void {
		try {
			const envContent = readFileSync(this.envPath, "utf-8");
			const envLines = envContent.split("\n");
			const keyRegex = new RegExp(`^${key}=.*$`);

			let updated = false;
			const updatedLines = envLines.map((line) => {
				if (keyRegex.test(line)) {
					updated = true;
					return `${key}=${value}`;
				}
				return line;
			});

			if (!updated) {
				updatedLines.push(`${key}=${value}`);
			}

			writeFileSync(this.envPath, updatedLines.join("\n"));
			process.env[key] = value;
		} catch (error) {
			console.error(chalk.redBright(`Failed to update .env file: ${error}`));
			throw error;
		}
	}

	public initialize(): void {
		this.client = new ChatClient({
			username: this.config.username,
			password: `oauth:${this.config.oauth}`,
			rateLimits: "default",
		});

		this.client.use(new AlternateMessageModifier(this.client));
		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		if (!this.client) throw new Error("Client not initialized");

		this.client.on("connecting", () =>
			console.log(chalk.blueBright("Connecting to Twitch...")),
		);

		this.client.on("ready", () => {
			console.log(
				chalk.greenBright("Successfully connected to Twitch channel:") +
					chalk.blueBright(` ${this.config.channel}`),
			);
			this.client?.say(this.config.channel, this.config.connect);
		});

		this.client.on("close", (error?: Error) => {
			if (error) {
				console.error("Client closed due to error:", error);
			} else {
				console.log(chalk.redBright("Client closed"));
			}
		});

		this.client.on("PRIVMSG", this.handleMessage.bind(this));
		this.client.on("CLEARCHAT", this.handleClearChat.bind(this));
	}

	private handleMessage(msg: PrivmsgMessage): void {
		const { senderUsername, messageText, channelName } = msg;

		if (senderUsername === this.config.bossBotName) {
			this.handleBossBotMessage(messageText, channelName);
		} else if (messageText.startsWith(this.config.prefix)) {
			this.handleCommand(msg);
		}
	}

	private handleBossBotMessage(message: string, channel: string): void {
		for (const [trigger, response] of this.bossBotResponses) {
			if (message.includes(trigger)) {
				const reply = typeof response === "function" ? response() : response;
				this.client?.say(channel, reply);
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
			this.commands.get(command)?.(msg, args);
		}
	}

	private handleStatusCommand(msg: PrivmsgMessage): void {
		this.client?.say(
			msg.channelName,
			`@${msg.senderUsername}, Bot działa prawidłowo ;)`,
		);
		this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);
	}

	private async handleSetHeistCommand(
		msg: PrivmsgMessage,
		args: string[],
	): Promise<void> {
		if (!this.client || !this.isOwner(msg.senderUsername)) return;

		const heist = parseInt(args[0]);
		if (!this.isValidHeistAmount(heist)) {
			this.client.say(
				msg.channelName,
				`@${msg.senderUsername}, Podaj liczbę od 1 do max 10k!`,
			);
			return;
		}

		try {
			this.updateEnvFile("HEIST_AMOUNT", heist.toString());
			this.config.heist = heist;

			this.client.say(
				msg.channelName,
				`@${msg.senderUsername}, Pomyślnie zmieniono ilość heista na ${heist}!`,
			);
			this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);

			console.log(
				chalk.greenBright(
					`Successfully updated HEIST_AMOUNT to ${heist} in .env file`,
				),
			);
		} catch (error) {
			this.client.say(
				msg.channelName,
				`@${msg.senderUsername}, Wystąpił błąd podczas aktualizacji wartości heist!`,
			);
			console.error(chalk.redBright("Error updating heist amount:"), error);
		}
	}

	private handleCheckHeistCommand(msg: PrivmsgMessage): void {
		if (!this.client || !this.isOwner(msg.senderUsername)) return;

		this.client.say(
			msg.channelName,
			`@${msg.senderUsername}, Masz aktualnie ustawione ${this.config.heist} heista ;)`,
		);
		this.logMessage(msg.channelName, msg.senderUsername, msg.messageText);
	}

	private handleClearChat(msg: ClearchatMessage): void {
		if (msg.isPermaban() && this.config.BANDonperma) {
			this.client?.say(msg.channelName, "BAND");
		}
	}

	private isOwner(username: string): boolean {
		return username === this.client?.configuration.username;
	}

	private isValidHeistAmount(amount: number): boolean {
		return !Number.isNaN(amount) && amount > 0 && amount <= 10000;
	}

	private logMessage(channel: string, username: string, message: string): void {
		console.log(
			chalk.cyanBright(`#${channel} `) +
				chalk.yellowBright(`${username} -> `) +
				chalk.greenBright(message),
		);
	}

	public start(): void {
		if (!this.client) throw new Error("Client not initialized");

		try {
			this.client.connect();
			this.client.join(this.config.channel);
		} catch (error) {
			console.error("Failed to start the bot:", error);
			process.exit(1);
		}
	}
}

const bot = new TwitchBot();
bot.initialize();
bot.start();
