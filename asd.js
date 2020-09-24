const tmi = require('dank-twitch-irc');

const client = new tmi.Client({
	options: { debug: true },
	connection: {
		secure: true,
		reconnect: true
	},
	identity: {
		username: 'szkajpur',
		password: ''
	},
	channels: [ 'demonzz1' ]
});

client.connect();

client.on('connected', (address, port) => {
	client.action('demonzz1', 'demonzX guwno');
});

client.on('chat', function(channel, user, message, self) {
	if(message === 'The arena has been cleaned up... Want to go again?! Type !boss to start!') {
		client.say('demonzz1', '!boss')
	};
	if(message === 'The arena is now open! Type !ffa to join!') {
		client.say('demonzz1', '!ffa')
	};
	if(message === 'The cops have given up! If you want to get a team together type !heist (amount).') {
		client.say('demonzz1', '!heist 10000')
	};
});

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return;

	if(message.toLowerCase() === '!testszkajpur') {
		client.say(channel, `@${tags.username}, bot dziala ;)`);
	}
});