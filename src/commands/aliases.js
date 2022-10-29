const embed = require('../homiesEmbed.js');
const fs = require('fs');
const { directories } = require('../cmd_dir.json')

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

            console.log(__dirname);

            let files;
            if (curr === "commands") {
                files = fs.readdirSync(__dirname);
            } else {
                files = fs.readdirSync(__dirname + curr.replace("commands\\", "\\"))
            }


            files.forEach(file => {
                let filename = file.split('.');
                if (filename[1] == 'js') {
                    if (filename[0] == "aliases") {
                        // Don't want infinite loop/error
                        this.LoadedCommands["aliases"] = this.command;
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

        this.name = "aliases";
        this.description = "In development";
        this.options = [];
        this.aliases = ["als"];

        this.storage = new command_storage(this);
        this.storage.Initialize(guildInfo);
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client, page) {
        if (page === null || page === undefined) {
            page = 1;
        }
        if (page * 10 > this.storage.stored_length) {
            embed(client, myEmbed => {
                myEmbed.title = `Aliases Page ${page}`;
                myEmbed.description = "[empty]";
                myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}aliases [page number]`;
                message.channel.send({
                    embeds: [myEmbed],
                })
                    .catch(console.error);

            });
            return;
        }

        if (page <= 0) page = 1;
        var count = 0;//(page == 1) ? 0 : (page - 1) * 10;
        var alliases = "";

        for (const [cmd, value] of Object.entries(this.storage.LoadedCommands)) {
            let aliases = value.aliases;

            // Choice 1
            if (aliases.length == 0) {
                alliases = alliases + `${this.guildInfo.Get('prefix')}${cmd} : **n/a**\n`;
                continue;
            }
            // Choice 2 is to put [empty] in place of the allias(es)
            count++;
            if (count > ((page - 1) * 10) && count < (page * 10)) {
                console.log(`aliases: ${aliases}`);
                var newallias = `${this.guildInfo.Get('prefix')}${cmd} : \`${this.guildInfo.Get('prefix')}${aliases.join(", " + this.guildInfo.Get('prefix'))}\``;
                alliases = alliases + newallias + "\n";
            } else if (count >= (page * 10)) {
                break;
            }


        }

        if (alliases == "") {
            alliases = "[empty]";
        }

        let d = new Date();

        console.log(`${alliases.length}\n${alliases}`);
        embed(client, myEmbed => {
            myEmbed.title = `Aliases Page ${page}`;
            myEmbed.description = alliases;
            myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}aliases [page number]`;
            message.channel.send({
                embeds: [myEmbed],
            })
                .catch(console.error);
        });
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns Promise
     */
    slashExe(interaction, client) { }
}



module.exports = { command }
