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
        "description": "Forces the bot to say the message provided.",
        "syntax": "message",
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
    "info (WIP)": {
        "description": "IN DEVELOPMENT",
        "syntax": null,
    },
    "serverinfo (WIP)": {
        "description": "IN DEVELOPMENT",
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
};

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "help";
        this.description = "In development";
        this.options = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {string} info_subject 
    */
    exe(message, client, info_subject) {
        const prefix = this.guildInfo.Get('prefix');

        if (info_subject) {
            let data;
            for (const [key, value] of Object.entries(commands)) {
                if (key.toLowerCase().substring(0, info_subject.length) === info_subject.toLowerCase()) {
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