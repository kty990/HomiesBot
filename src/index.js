// ** Bot Dependancies **
const Discord = require('discord.js');
const { Guild } = require('discord.js');

// ** Local Dependancies **

const auth = require("../auth.json");
const token = auth.token;
const development_status = auth.development;

// ** Modules **

const { CommandHandler } = require('./cmdh.js');
// const { Track, Subscription } = require('./music/musicHandler.js'); // Not used here, used within CommandHandler (cmdh.js)
const { DatastoreHandler } = require('./Datastore.js');

// ** Misc. Variables **

const Intents = Discord.GatewayIntentBits;
const Partials = Discord.Partials;

const client = new Discord.Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],//'MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Intents.DirectMessages,
        Intents.DirectMessageReactions,
        Intents.GuildMessages,
        Intents.GuildMessageReactions,
        Intents.GuildMembers,
        Intents.GuildPresences,
        Intents.Guilds,
        Intents.MessageContent,
        Intents.GuildVoiceStates
    ],//'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS'],
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
    if (development_status == "false") {
        client.user.setPresence({ activities: [{ name: 'the homies song!', type: Discord.ActivityType.Streaming, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" }], status: 'idle' });
    } else {
        client.user.setPresence({ activities: [{ name: 'in development', type: Discord.ActivityType.Playing }], status: 'idle' });
    }
    console.log("Bot online");
});

client.on("error", console.error);

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

client.login(token);
