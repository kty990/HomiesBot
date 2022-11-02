const embed = require('../homiesEmbed.js');
const commands = require('../cmd_desc.json');

class command_storage {

    /**
     * Stores all commands for aliases reference
     * @param {command} cmd 
     */
    constructor(cmd) {
        this.LoadedCommands = {};
        this.command = cmd;
        this.stored_length = 0;
    }

    /**
     * Initializes the CommandHandler with command data.
     * 
     * @param {*} guildInfo Datastore instance
     * 
     * @returns void
     */
    Initialize(guildInfo) {
        this.guildInfo = guildInfo;

        for (let s = 0; s < directories.length; s++) {
            let curr = directories[s];

            let files;
            if (curr === "commands") {
                files = fs.readdirSync(__dirname);
                console.log(__dirname);
            } else {
                files = fs.readdirSync(__dirname + curr.replace("commands\\", "\\"))
                console.log(__dirname + curr.replace("commands\\", "\\"));
            }


            files.forEach(file => {
                let filename = file.split('.');
                if (filename[1] == 'js') {
                    if (filename[0] == "help") {
                        // Don't want infinite loop/error
                        this.LoadedCommands["help"] = this.command;
                    } else {
                        const { command } = require(`..\\${curr}\\${filename[0]}.js`);
                        this.LoadedCommands[filename[0]] = new command(guildInfo);
                    }
                    this.stored_length++;
                }
            });
        }
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.storage = new command_storage(guildInfo);

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
            let alias = this.IsAliasOf(info_subject);
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
    * Checks if the provided string is an alias of, or the name of, a valid command.
    * 
    * @param {*} cmd 
    * @returns string | null
    */
    IsAliasOf(cmd) {
        for (const [key, command] of Object.entries(this.storage.LoadedCommands)) {
            if (key.toLowerCase().substring(0, cmd.length) == cmd.toLowerCase()) {
                return key
            } else {
                for (let x = 0; x < command.aliases.length; x++) {
                    let curr = command.aliases[x];
                    if (curr.toLowerCase().substring(0, cmd.length) == cmd.toLowerCase()) {
                        return key
                    }
                }
            }
        }
        return null;
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
