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

const Intents = Discord.GatewayIntentBits;
const Partials = Discord.Partials;

const client = new Discord.Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],//'MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.DirectMessages, Intents.DirectMessageReactions, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.Guilds, Intents.MessageContent],//'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS'],
});

const ConnectedGuilds = {};
const CommandHandlers = {};

// ** Functions **

/**
 * 
 * @param {Guild} guild 
 */
function InitializeGuildData(guild) {
    return new Promise((resolve, reject) => {
        let ds = new DatastoreHandler(guild, true);
        ConnectedGuilds[guild.id] = ds;
        let ch = new CommandHandler(client, guild);
        ch.Initialize(ds);
        CommandHandlers[guild.id] = ch;
        resolve();
    });
}

client.on("ready", () => {
    client.user.setPresence({ activities: [{ name: 'in development', type: Discord.ActivityType.Playing }], status: 'idle' });
    console.log("Bot online");
});

client.on("error", error => {
    console.warn(`\n\n\nWARN: An unhandled error occured at client.on('error'):\n${error}\n\n`);
});

client.on("guildCreate", guild => {
    InitializeGuildData(guild);
})

client.on('messageCreate', async (message) => {
    const guild = message.guild;

    if (!guild) {
        console.log("No guild found");
        return;
    };

    if (ConnectedGuilds[guild.id] == undefined || ConnectedGuilds[guild.id] == null) await InitializeGuildData(guild);

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
