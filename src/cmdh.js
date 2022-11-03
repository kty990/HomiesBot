/**
 * TODO:
 *      1. Add admin members if a user is updated to include thet Administrator permission, or the user becomes the admin of the sevrer
 *          - Remove the old owner if the ownership was transfered, or the old owner does not have an admin role
 */

// ** Dependancies **

const fs = require('fs'); // File I/O
const {PermissionsBitField} = require('discord.js');
const {GuildAdminSystem} = require("./AdminSys.js");

const { directories } = require('./cmd_dir.json');
const embed = require('./homiesEmbed');

class CommandHandler {
    constructor(client, guild) {
        this.LoadedCommands = {};
        this.client = client;
        this.guild = guild;
        this.subscription = null;
        this.voiceConnection = null;

        /**
         * Handle the bot being forceably removed from a voice channel by admin.
         */
        client.on("voiceStateUpdate", (oldState, newState) => {
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
        });
    };

    /**
     * Initializes the CommandHandler with command data.
     * 
     * @param {*} guildInfo Datastore instance
     * 
     * @returns void
     */
    Initialize(guildInfo) {
        this.guildInfo = guildInfo;
        this.guildAdminSys = new GuildAdminSystem(this.guild);

        let members = this.guild.members;
        members.forEach(member => {
            let roles = member.roles.cache;
            for (const [snowflake,role] of roles.entries) {
                if (role.permissions.has(PermissionsBitField.All,true)) {
                    // Is Admin
                    this.guildAdminSys.AddMember(member,true);
                }
            }
            this.guildAdminSys.AddMember(member,false); //If already added as admin, nothing changes
        });

        for (let s = 0; s < directories.length; s++) {
            let curr = directories[s];

            let files = fs.readdirSync(__dirname + "\\" + curr);

            files.forEach(file => {
                let filename = file.split('.');
                if (filename[1] == 'js') {
                    const { command } = require(`./${curr}/${filename[0]}.js`);
                    this.LoadedCommands[filename[0]] = new command(guildInfo);
                }
            });
        }


    }

    /**
    * Checks if the provided string is an alias of, or the name of, a valid command.
    * 
    * @param {*} cmd 
    * @returns string | null
    */
    IsAliasOf(cmd) {
        for (const [key, command] of Object.entries(this.LoadedCommands)) {
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
            this.LoadedCommands[cmd.toLowerCase()] !== undefined) || this.IsAliasOf(cmd.toLowerCase()) !== null;
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
        console.debug("Trying to run a command");
        let command = this.LoadedCommands[cmd.toLowerCase()];
        let Alias = this.IsAliasOf(cmd.toLowerCase());
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
                    let result = command.exe(message, this.client, ...args).catch(err => {
                        console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                        embed(this.client, e => {
                            e.color = 0xeb4034;
                            if (`${err}`.length >= 1025) {
                                e.description = `Error message too long to send`;
                            } else {
                                e.description = `${err}`;
                            }
                            e.title = `Could not run ${cmd.toLowerCase()}`;
                            e.footer.text = "An error occured.";
                            message.channel.send({
                                embeds: [e],
                            })
                                .catch(console.error);
                        });
                    });
                }
                if (command.shouldDelete) {
                    message.delete()
                        .catch(console.error);
                }
            } catch (err) {
                console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                embed(this.client, e => {
                    e.color = 0xeb4034;
                    if (`${err}`.length >= 1025) {
                        e.description = `Error message too long to send`;
                    } else {
                        e.description = `${err}`;
                    }
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
                    let result = command.exe(message, this.client, ...args).catch(err => {
                        console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                        embed(this.client, e => {
                            e.color = 0xeb4034;
                            if (`${err}`.length >= 1025) {
                                e.description = `Error message too long to send`;
                            } else {
                                e.description = `${err}`;
                            }
                            e.title = `Could not run ${cmd.toLowerCase()}`;
                            e.footer.text = "An error occured.";
                            message.channel.send({
                                embeds: [e],
                            })
                                .catch(console.error);
                        });
                    });
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
