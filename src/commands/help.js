const embed = require('../homiesEmbed.js');

const commands = { // required to edit as more commands are added
    "play": {
        "description": "Requires voice channel: Plays video audio from YouTube.",
        "syntax": "url / query"
    },
    "skip": {
        "description": "Skips a song in the queue.",
        "syntax": null,
    },
    "nowplaying": {
        "description": "Shows data about the current song.",
        "syntax": null,
    },
    "resume": {
        "description": "Resumes playback",
        "syntax": null,
    },
    "pause": {
        "description": "Pauses playback",
        "syntax": null,
    },
    "shuffle": {
        "description": "Shuffles the server queue",
        "syntax": null,
    },
    "loopqueue": {
        "description": "Toggles queue looping.",
        "syntax": null,
    },
    "join": {
        "description": "Forces bot to join your voice channel if it is not in one already.",
        "syntax": null,
    },
    "leave": {
        "description": "Forces bot to leave its current voice channel if you are in that channel.",
        "syntax": null,
    },
    "queue": {
        "description": "Displays the current song queue (10 songs/page)",
        "syntax": "page",
    },
    "say": {
        "description": "Forces the bot to say {message}.",
        "syntax": "message",
    },
    "purge": {
        "description": "Deletes {count} messages in the channel this was used in.",
        "syntax": "count",
    },
    "cmds": {
        "description": "Shows a list of commands (10 commands/page)",
        "syntax": "page",
    },
    "aliases [page]": {
        "description": "Shows a list of command aliases (10/page)",
        "syntax": "page",
    },
    "help": {
        "description": "Displays helpful information regarding the bot.",
        "syntax": null,
    },
    "coinflip": {
        "description": "Flips a coin. The result is either 'Heads' or 'Tails' with a 50-50 chance.",
        "syntax": null,
    },
    "info": {
        "description": "Displays info about a user. 'user' can be their ID, a mention, or their username",
        "syntax": "user (optional)",
    },
    "serverinfo": {
        "description": "Displays information about the current server.",
        "syntax": null,
    },
    "settings (WIP)": {
        "description": "IN DEVELOPMENT",
        "syntax": null,
    },
    "cah (WIP)": {
        "description": "IN DEVELOPMENT",
        "syntax": null,
    },
    "password": {
        "description": "Sends you a randomly generated password.",
        "syntax": "length",
    },
    "uno": {
        "description": "Creates an UNO game, requires players to react to join. 30 second window to join before the game auto-starts. (Needs 3 players MINIMUM) | IN DEVELOPMENT",
        "syntax": null,
    },
    "bugs": {
        "description": "Displays a list of all known bugs",
        "syntax": "page",
    },
    "coup": {
        "description": "IN DEVELOPMENT",
        "syntax": null,
    },
    "premove": {
        "description": "This ain't chess...",
        "syntax": null,
    },
    "gtw": {
        "description": "Try to guess the unscrambled version of the scrambled word | IN DEVELOPMENT",
        "syntax": null,
    }
};

const aliases = {
    "play": ["p", "pl"],
    "skip": ["s"],
    "nowplaying": ["np"],
    "resume": ["res", "r"],
    "pause": ["pp"],
    "join": ["enter", "fuckon", "waxon", "appear"],
    "leave": ["fuckoff", "waxoff", "disappear"],
    "queue": ["q"],
    "say": [],
    "purge": [],
    "cmds": ["commands"],
    "aliases": ["als"],
    "help": [],
    "coinflip": ["flipcoin", "flipacoin"],
    "info": [],
    "serverinfo": [],
    "settings": ["alter", "change"],
    "cah": [],
    "password": ["pw"],
    "bugs": ["knownbugs", "bug"],
    "uno": [],
    "coup": [],
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

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "help";
        this.description = "In development";
        this.options = [];
        this.aliases = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {string} info_subject 
    */
    async exe(message, client, info_subject) {
        const prefix = this.guildInfo.Get('prefix');

        if (info_subject) {
            let data;
            let alias = IsAliasOf(info_subject);
            for (const [key, value] of Object.entries(commands)) {
                if (key.toLowerCase().substring(0, info_subject.length) === info_subject.toLowerCase() || alias == key) {
                    data = {
                        "key": key,
                        "value": value,
                    };
                    break;
                }
            }
            if (data) {
                let syntax = `${prefix}${data["key"]} [${data["value"]["syntax"] || ""}]`;
                embed(client, embed => {
                    embed.description = `**Command:** ${data["key"]}\n**Description:** ${data["value"]["description"] || "n/a"}\n**Syntax:** ${syntax}`;
                    embed.footer.text = `Use ${prefix}help [cmd (optional)] to view this window`
                    message.channel.send({
                        embeds: [embed],
                    })
                        .catch(console.error);
                });
                return;
            }
        }

        embed(client, embed => {
            embed.description = `View commands: \`${prefix}cmds\`\nView command aliases: \`${prefix}aliases\`\nPlay songs: \`${prefix}play [url/query]\`\nChange server settings: \`${prefix}settings (WIP)\``;
            embed.footer.text = `Use ${prefix}help to view this window`
            message.channel.send({
                embeds: [embed],
            })
                .catch(console.error);
        })
        return;
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(musicData, interaction, client) { }
}



module.exports = { command }
