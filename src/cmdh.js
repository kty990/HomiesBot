// ** Dependancies **

const fs = require('fs'); // File I/O
const embed = require('./homiesEmbed');

const aliases = { // also edit the aliases in the aliases.js command module
    "play": ["p", "pl"],
    "skip": ["s"],
    "nowplaying": ["np"],
    "resume": ["res", "r"],
    "pause": ["pp"],
    "join": ["enter", "fuckon", "waxon", "appear"],
    "leave": ["fuckoff", "waxoff", "disappear"],
    "queue": ["q"],
    "say": [],
    "cmds": ["commands"],
    "aliases": ["als"],
    "help": [],
    "info": [],
    "serverinfo": [],
    "settings": ["alter", "change"],
    "cah": [],
};

/**
 * Checks if the provided string is an alias of a valid command.
 * 
 * @param {string | null} cmd 
 * @returns string | null
 */
function IsAliasOf(cmd) {
    for (const [c, als] of Object.entries(aliases)) {
        for (const [i, v] of Object.entries(als)) {
            if (v === cmd) {
                return c;
            }
        }
    }
    return null;
}

class CommandHandler {
    constructor(client) {
        this.LoadedCommands = {};
        this.client = client;
        this.subscription = null;
        this.voiceConnection = null;

        /**
         * Handle the bot being forceably removed from a voice channel by admin.
         */
        let listener = client.on("voiceStateUpdate", (oldState, newState) => {
            if (newState.member) {
                if (newState.channel === null && newState.member.user === client.user) {
                    if (this.subscription) {
                        this.subscription.destroy()
                        this.voiceConnection.destroy()
                        this.subscription = null;
                        this.voiceConnection = null;
                    }
                }
            }
        })
    };

    /**
     * Initializes the CommandHandler with command data.
     * 
     * @param {*} guildInfo
     * 
     * @returns void
     */
    Initialize(guildInfo) {
        this.guildInfo = guildInfo;
        let files = fs.readdirSync(__dirname + "/commands");
        files.forEach(file => {
            let filename = file.split('.');
            if (filename[1] == 'js') {
                const { command } = require(`./commands/${filename[0]}.js`);
                this.LoadedCommands[filename[0]] = new command(guildInfo);
            }
        })
    }

    /**
     * Sets the stored guild cache
     * 
     * @param {*} guildInfo
     * 
     * @returns void
     */
    SetGuildInfo(guildInfo) {
        this.guildInfo = guildInfo;
    }

    /**
     * 
     * @param {string} cmd 
     * 
     * @returns boolean
     */
    Exists(cmd) {
        return (this.LoadedCommands[cmd.toLowerCase()] !== null &&
            this.LoadedCommands[cmd.toLowerCase()] !== undefined) || IsAliasOf(cmd.toLowerCase()) !== null;
    }

    /**
     * This method attempts to run a command if found.
     * 
     * @param {*} message : Discord.js Message object
     * @param {string} cmd 
     * @param {*} args : Array
     * 
     * @returns boolean
    */
    async Run(message, cmd, args) {
        let command = this.LoadedCommands[cmd.toLowerCase()];
        let Alias = IsAliasOf(cmd.toLowerCase());
        if (command !== null && command !== undefined) {
            try {
                if (command.isMusic === true) {
                    let musicData = { "subscription": this.subscription, "voice": this.voiceConnection };
                    let returnData = await command.exe(musicData, message, this.client, ...args);
                    if (returnData) {
                        this.subscription = returnData["subscription"];
                        this.voiceConnection = returnData["voice"];
                        console.log(`Command debug:\nVoice: ${returnData['voice']}\nSubscription: ${returnData["subscription"]}\n`);
                    }
                } else {
                    command.exe(message, this.client, ...args);
                }
                if (command.shouldDelete) {
                    message.delete()
                        .catch(console.error);
                }
            } catch (err) {
                console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                embed(this.client, e => {
                    e.color = 0xeb4034;
                    e.description = `${err}`;
                    e.title = `Could not run ${cmd.toLowerCase()}`;
                    e.footer.text = "An error occured.";
                    message.channel.send({
                        embeds: [e],
                    })
                        .catch(console.error);
                });
            }
        } else if (Alias !== null) {
            command = this.LoadedCommands[Alias];
            if (command === null || command === undefined) throw new Error("Attempt to run null command");
            try {
                if (command.isMusic === true) {
                    let musicData = { "subscription": this.subscription, "voice": this.voiceConnection };
                    let returnData = await command.exe(musicData, message, this.client, ...args);
                    if (returnData) {
                        this.subscription = returnData["subscription"];
                        this.voiceConnection = returnData["voice"];
                        console.log(`Alias debug:\nVoice: ${returnData['voice']}\nSubscription: ${returnData["subscription"]}\n`);
                    }
                } else {
                    command.exe(message, this.client, ...args);
                }
                if (command.shouldDelete) {
                    message.delete()
                        .catch(console.error);
                }
            } catch (err) {
                console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                embed(this.client, e => {
                    e.color = 0xeb4034;
                    e.description = `${err}`;
                    e.title = `Could not run ${cmd.toLowerCase()}`;
                    e.footer.text = "An error occured.";
                    message.channel.send({
                        embeds: [e],
                    })
                        .catch(console.error);
                });
            }
        } else {
            throw new Error(`Attempt to run null command. No alias found matching ${cmd}`);
        }
    }
}

module.exports = { CommandHandler };
