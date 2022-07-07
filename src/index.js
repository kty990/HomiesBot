// ** Bot Dependancies **
const Discord = require('discord.js');
const { Guild } = require('discord.js');

// ** Local Dependancies **

const auth = require("../auth.json");

// ** Modules **

const { CommandHandler } = require('./cmdh.js');
// const { Track, Subscription } = require('./music/musicHandler.js'); // Not used here, used within CommandHandler (cmdh.js)
const { DatastoreHandler } = require('./Datastore.js');

// ** Misc. Variables **

var d = new Date();
var botOnlineSince;

const Intents = Discord.Intents;
const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES],
});

const ConnectedGuilds = {};
const CommandHandlers = {};

// ** Functions **

/**
 * 
 * @param {Guild} guild 
 */
function InitializeGuildData(guild) {
    let ds = new DatastoreHandler(guild, true);
    ConnectedGuilds[guild.id] = ds;
    let ch = new CommandHandler(client);
    ch.Initialize(ds);
    CommandHandlers[guild.id] = ch;
}

client.on("ready", () => {
    client.user.setPresence({ activities: [{ name: 'in development' }], status: 'idle' });
    console.log("Bot online");
});

client.on("error", error => {
    console.warn(`\n\n\nWARN: An unhandled error occured at client.on('error'):\n${error}\n\n`);
});

client.on("guildCreate", guild => {
    InitializeGuildData(guild);
})

client.on('messageCreate', message => {
    const guild = message.guild;

    if (ConnectedGuilds[guild.id] == undefined || ConnectedGuilds[guild.id] == null) InitializeGuildData(guild);

    let prefix = ConnectedGuilds[guild.id].Get("prefix");

    let splitString = message.content.split(" ");
    let testforCommand = splitString[0].search(prefix);

    if (testforCommand !== -1) {
        let cmd = splitString[0].replace(prefix, "");
        if (CommandHandlers[guild.id].Exists(cmd)) {
            splitString.splice(0, 1);
            CommandHandlers[guild.id].Run(message, cmd, splitString);
        } else {
            console.warn(`No command called "${cmd}" exists`);
        }
    }

});

client.login(auth.token);
