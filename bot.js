const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const axios = require("axios");
const Discord = require("discord.js");
const { Events, SlashCommandBuilder, GatewayIntentBits, Collection} = require('discord.js');

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})
client.on('ready', ()=>{
    console.log("logged in!!")
})
client.on("messageCreate", async (message) => {
    if (message.author.bot) return false; 
    
    let value = await axios.get(`https://jsonplaceholder.typicode.com/todos/${message.content}`)
    .then(res => res.data)
    .catch(err => err.data);
    console.log(value)
    message.reply(value.title)
    console.log("replied")
    // console.log(`Message from ${message.author.username}: ${message.content}`);
  });


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

  client.login(process.env.DISCORD_TOKEN);