console.log("Loading... settings.js");

const embed = require('./util/homiesEmbed');
const error = require('./util/error');

/*
    Stages documentation:
        0 - Starting menu listing all settings to edit
        1 - prefix : string (max 2 chars)
        2 - adminrole : id OR name OR mention
        3 - logcommands : boolean
        4 - logchannel : id OR name OR channel_mention
        5 - songannouncement : boolean
*/

const editSettings = [
    "prefix",
    "adminrole",
    "logcommands",
    "logchannel",
    "songannouncement"
];

var cached_data = null;
function waitForValue(value, shouldntEqual, callback) {
    if (value === shouldntEqual) {
        setTimeout(() => {
            waitForValue(value, shouldntEqual, callback);
        }, 100);
        return;
    }
    callback(value);
}


function call(Discord, client, conGuild, message, isAdmin, settingsPromptMessage, stage) {
    var myConGuild = conGuild;
    const author = message.author;
    const guild = message.guild;
    try {
        let filter = m => m.author.id == author.id;

        console.debug(`Message author: ${author.id}\n`);

        var data = null;
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        })
            .then(msg => {
                console.log(`msg = ${msg}`);
                console.log(`msg content = ${msg.content}`);
                console.log(`collection size = ${msg.size}`); // this was the error... it is a collection not a message instance

                const content = msg.content.toLowerCase();
                const first = content.split(" ")[0];
                if (!first in editSettings) { // may need to be adjusted for correct syntax
                    message.channel.send("Invalid response.");
                    data = [false, null];
                }
                switch (stage) {
                    case 0:
                        // find input
                        switch (content) {
                            case "prefix":
                                stage = 1;
                            case "adminrole":
                                stage = 2;
                            case "logcommands":
                                stage = 3;
                            case "logchannel":
                                stage = 4;
                            case "songannouncement":
                                stage = 5;
                        }
                        data = [stage != 0, stage];
                    case 1:
                        if (content.length <= 2) {
                            data = [true, msg.content];
                        } else {
                            data = [false, null];
                        }
                    case 2:
                        data = [true, content];
                    case 3:
                        if (content == "true") {
                            data = [true, true];
                        } else {
                            data = [true, false];
                        }
                    case 4:
                        data = [true, content];
                    case 5:
                        if (content == "true") {
                            data = [true, true];
                        } else {
                            data = [true, false];
                        }
                }
            })
            .catch(err => {
                console.error(err);
                message.channel.send('Timeout.');
            })

        return waitForValue(data, null, (value) => {
            if (value[1] == null || value[0] == false) return myConGuild;
            switch (stage) {
                case 0: // base menu

                    /*
                        Stages documentation:
                            0 - Starting menu listing all settings to edit
                            1 - prefix : string (max 2 chars)
                            2 - adminrole : id OR name OR mention
                            3 - logcommands : boolean
                            4 - logchannel : id OR name OR channel_mention
                            5 - songannouncement : boolean
                    */

                    stage = value[1];
                    switch (stage) {
                        case 1:
                            settingsPromptMessage.delete();
                            settingsPromptMessage = embed(Discord, client, myEmbed => {
                                myEmbed.setAuthor("Prefix", client.user.avatarURL({ size: 256 }));
                                myEmbed.addField("\u2800", "Set a new prefix (will be applied when this prompt is finished)", false);
                                myEmbed.setFooter(`Current prefix: ${myConGuild.prefix}`);

                                return message.channel.send(myEmbed).then(msg => {
                                    return msg;
                                });
                            });
                        case 2:
                            settingsPromptMessage.delete();
                            settingsPromptMessage = embed(Discord, client, myEmbed => {
                                myEmbed.setAuthor("Admin Role", client.user.avatarURL({ size: 256 }));
                                myEmbed.addField("\u2800", "Set a new admin role (will be applied when this prompt is finished)", false);
                                myEmbed.setFooter(`All roles above this role will also have admin permissions.`);

                                return message.channel.send(myEmbed).then(msg => {
                                    return msg;
                                });
                            });
                        case 3:
                            settingsPromptMessage.delete();
                            settingsPromptMessage = embed(Discord, client, myEmbed => {
                                myEmbed.setAuthor("Log Commands", client.user.avatarURL({ size: 256 }));
                                myEmbed.addField("\u2800", "Set whether the bot should log commands (will be applied when this prompt is finished)", false);
                                myEmbed.setFooter(`"true" or "false" are the valid options`);

                                return message.channel.send(myEmbed).then(msg => {
                                    return msg;
                                });
                            });
                        case 4:
                            settingsPromptMessage.delete();
                            settingsPromptMessage = embed(Discord, client, myEmbed => {
                                myEmbed.setAuthor("Command Logs Channel", client.user.avatarURL({ size: 256 }));
                                myEmbed.addField("\u2800", "Set a new logs channel (will be applied when this prompt is finished)", false);
                                myEmbed.setFooter(`Current channel: ${myConGuild.commandLogChannel}`);

                                return message.channel.send(myEmbed).then(msg => {
                                    return msg;
                                });
                            });
                        case 5:
                            settingsPromptMessage.delete();
                            settingsPromptMessage = embed(Discord, client, myEmbed => {
                                myEmbed.setAuthor("Song Announcements", client.user.avatarURL({ size: 256 }));
                                myEmbed.addField("\u2800", "Set whether the bot should announce when a new song starts playing (will be applied when this prompt is finished)", false);
                                myEmbed.setFooter(`"true" or "false" are the valid options`);

                                return message.channel.send(myEmbed).then(msg => {
                                    return msg;
                                });
                            });
                    }
                case 1: // prefix
                    if (value[1] != null) {
                        myConGuild.prefix = value[1];
                        stage = 0;
                    } else {
                        message.channel.send(":x: **__Settings prompt terminated. Invalid response given.__** :x:");
                    }
                case 2: // adminRole

                    var newAdmin = message.content;

                    if (value[1].search("<@&") != -1) {
                        // Tagged role
                        newAdmin = newAdmin.replace("<@&", "");
                        newAdmin = newAdmin.replace(">", "");
                        newAdmin = newAdmin.replace("@", "");
                        try {
                            newAdmin = parseInt(newAdmin);
                            myConGuild.adminRole = newAdmin.toString();
                            message.channel.send(`New admin role set: ${newAdmin}`);
                        } catch (err) {
                            error(Discord, client, null, embed => {
                                embed.addField("\u2800", "Error Code: 404", false);
                                message.channel.send(embed);
                            });
                            console.error(err);
                        }
                    } else {
                        // Either name or id
                        try {
                            newAdmin = parseInt(newAdmin);
                            myConGuild.adminRole = newAdmin.toString();
                            message.channel.send(`New admin role set: ${newAdmin}`);
                        } catch (err) {
                            try {
                                let role = message.guild.roles.cache.find(r => r.id === toString(newAdmin));
                                if (role == null || role == undefined) {
                                    console.error(`Unable to set admin role for "${guild.name}" (${guild.id}): Role "${message.content}" can't be found.`)
                                } else {
                                    myConGuild.adminRole = role.id;
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                    stage = 0;



                case 3: // logCommands : boolean
                    myConGuild.commandsLog = value[1];
                    stage = 0;
                case 4: // logChannel
                    const newChannel = message.content.toLowerCase();

                    if (newChannel.search("#") == -1) { // id
                        myConGuild.commandLogChannel = newChannel;
                        embed(Discord, client, embed => {
                            embed.setDescription(`New log channel set: ${newChannel}`);
                            message.channel.send(embed);
                        });
                    } else if (newChannel.search("#") != -1) { // tagging the channel
                        newChannel = newChannel.replace("<#", "");
                        newChannel = newChannel.replace(">", "");
                        newChannel = newChannel.replace("#", "");
                        try {
                            myConGuild.commandLogChannel = newChannel;
                            embed(Discord, client, embed => {
                                embed.setDescription(`New log channel set: ${newChannel}`);
                                message.channel.send(embed);
                            });
                        } catch (err) {
                            error(Discord, client, null, embed => {
                                embed.addField("\u2800", "Error Code: 404", false);
                                message.channel.send(embed);
                            });
                            console.log(err);
                            return;
                        }
                    } else { // Name

                    }





                    stage = 0;
                case 5: // songAnnouncement
                    myConGuild.songAnnouncement = value[1];
                    stage = 0;
            }
            if (stage === 0) {
                settingsPromptMessage.delete();
                settingsPromptMessage = embed(Discord, client, myEmbed => {
                    myEmbed.setAuthor("Settings", client.user.avatarURL({ size: 256 }));
                    const set = `:information_source: prefix [${myConGuild.prefix}]\n:crown: adminrole [${myConGuild.adminRole}]\n:speech_balloon: logcommands [${myConGuild.commandsLog}]\n:hash: logchannel [${myConGuild.commandLogChannel}]\n:notes: songannouncement [${myConGuild.songAnnouncement}]`
                    myEmbed.addField("ALL SETTINGS", set, false);
                    myEmbed.addField("\u2800", "All settings take affect once this prompt terminates.", false);
                    myEmbed.setFooter("Limit of [1] settings prompt per server.");

                    return message.channel.send(myEmbed).then(msg => {
                        return msg;
                    });
                });
            }

            if (value[0] === true) {
                return call(Discord, client, myConGuild, message, isAdmin, settingsPromptMessage, stage);
            } else {
                return myConGuild;
            }
        });


    } catch (err) {
        console.error(err);
    }
}

module.exports = (Discord, client, connectedGuilds, message, isAdmin, callback) => {
    if (isAdmin === false) return;
    const guild = message.guild;
    const author = message.author;
    var myConGuild = connectedGuilds[guild.id];

    var settingsPromptMessage = embed(Discord, client, myEmbed => {
        myEmbed.setAuthor("Settings", client.user.avatarURL({ size: 256 }));
        const set = `prefix [${myConGuild.prefix}]\n:crown: adminrole [${myConGuild.adminRole}]\n:speech_balloon: logcommands [${myConGuild.commandsLog}]\n:hash: logchannel [${myConGuild.commandLogChannel}]\n:speech_balloon: songannouncement [${myConGuild.songAnnouncement}]`
        myEmbed.addField("ALL SETTINGS", set, false);
        myEmbed.addField("\u2800", "All settings take affect once this prompt terminates.", false);
        myEmbed.setFooter("Limit of [1] settings prompt per server.");

        return message.channel.send(myEmbed).then(msg => {
            return msg;
        });
    });

    var stage = 0;

    call(Discord, client, myConGuild, message, isAdmin, settingsPromptMessage, stage)

    if (settingsPromptMessage != null) settingsPromptMessage.delete();
    callback(myConGuild);
}
console.log("settings.js loaded... Success!");

/*

running = data[0];
        switch (stage) {
            case 0: // base menu

                        stage = data[1];
                        switch (stage) {
                            case 1:
                                settingsPromptMessage.delete();
                                settingsPromptMessage = embed(Discord,client,myEmbed => {
                                    myEmbed.setAuthor("Prefix",client.user.avatarURL({size: 256}));
                                    myEmbed.addField("\u2800","Set a new prefix (will be applied when this prompt is finished)",false);
                                    myEmbed.setFooter(`Current prefix: ${myConGuild.prefix}`);
        
                                    return message.channel.send(myEmbed).then(msg => {
                                        return msg;
                                    });
                                });
                            case 2:
                                settingsPromptMessage.delete();
                                settingsPromptMessage = embed(Discord,client,myEmbed => {
                                    myEmbed.setAuthor("Admin Role",client.user.avatarURL({size: 256}));
                                    myEmbed.addField("\u2800","Set a new admin role (will be applied when this prompt is finished)",false);
                                    myEmbed.setFooter(`All roles above this role will also have admin permissions.`);
        
                                    return message.channel.send(myEmbed).then(msg => {
                                        return msg;
                                    });
                                });
                            case 3:
                                settingsPromptMessage.delete();
                                settingsPromptMessage = embed(Discord,client,myEmbed => {
                                    myEmbed.setAuthor("Log Commands",client.user.avatarURL({size: 256}));
                                    myEmbed.addField("\u2800","Set whether the bot should log commands (will be applied when this prompt is finished)",false);
                                    myEmbed.setFooter(`"true" or "false" are the valid options`);
        
                                    return message.channel.send(myEmbed).then(msg => {
                                        return msg;
                                    });
                                });
                            case 4:
                                settingsPromptMessage.delete();
                                settingsPromptMessage = embed(Discord,client,myEmbed => {
                                    myEmbed.setAuthor("Command Logs Channel",client.user.avatarURL({size: 256}));
                                    myEmbed.addField("\u2800","Set a new logs channel (will be applied when this prompt is finished)",false);
                                    myEmbed.setFooter(`Current channel: ${myConGuild.commandLogChannel}`);
        
                                    return message.channel.send(myEmbed).then(msg => {
                                        return msg;
                                    });
                                });
                            case 5:
                                settingsPromptMessage.delete();
                                settingsPromptMessage = embed(Discord,client,myEmbed => {
                                    myEmbed.setAuthor("Song Announcements",client.user.avatarURL({size: 256}));
                                    myEmbed.addField("\u2800","Set whether the bot should announce when a new song starts playing (will be applied when this prompt is finished)",false);
                                    myEmbed.setFooter(`"true" or "false" are the valid options`);
        
                                    return message.channel.send(myEmbed).then(msg => {
                                        return msg;
                                    });
                                });
                        }
                    case 1: // prefix
                        if (data[1] != null){
                            myConGuild.prefix = data[1];
                            stage = 0;
                        } else {
                            message.channel.send(":x: **__Settings prompt terminated. Invalid response given.__** :x:");
                        }
                    case 2: // adminRole
        
                        var newAdmin = message.content;
        
                        if (data[1].search("<@&") != -1) {
                            // Tagged role
                            newAdmin = newAdmin.replace("<@&","");
                            newAdmin = newAdmin.replace(">","");
                            newAdmin = newAdmin.replace("@","");
                            try {
                                newAdmin = parseInt(newAdmin);
                                myConGuild.adminRole = newAdmin.toString();
                                message.channel.send(`New admin role set: ${newAdmin}`);
                            } catch (err) {
                                error(Discord,client,null,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                console.error(err);
                            }
                        } else {
                            // Either name or id
                            try {
                                newAdmin = parseInt(newAdmin);
                                myConGuild.adminRole = newAdmin.toString();
                                message.channel.send(`New admin role set: ${newAdmin}`);
                            } catch (err) {
                                try {
                                    let role = message.guild.roles.cache.find(r => r.id === toString(newAdmin));
                                    if (role == null || role == undefined) {
                                        console.error(`Unable to set admin role for "${guild.name}" (${guild.id}): Role "${message.content}" can't be found.`)
                                    } else {
                                        myConGuild.adminRole = role.id;
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }
                        stage = 0;
        
        
        
                    case 3: // logCommands : boolean
                        myConGuild.commandsLog = data[1];
                        stage = 0;
                    case 4: // logChannel
                        const newChannel = message.content.toLowerCase();
        
                        if(newChannel.search("#") == -1) { // id
                            myConGuild.commandLogChannel = newChannel;
                            embed(Discord,client,embed => {
                                embed.setDescription(`New log channel set: ${newChannel}`);
                                message.channel.send(embed);
                            });
                        } else if (newChannel.search("#") != -1) { // tagging the channel
                            newChannel = newChannel.replace("<#","");
                            newChannel = newChannel.replace(">","");
                            newChannel = newChannel.replace("#","");
                            try {
                                myConGuild.commandLogChannel = newChannel;
                                embed(Discord,client,embed => {
                                    embed.setDescription(`New log channel set: ${newChannel}`);
                                    message.channel.send(embed);
                                });
                            } catch (err) {
                                error(Discord,client,null,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                console.log(err);
                                return;
                            }
                        } else { // Name
        
                        }
        
        
        
        
        
                        stage = 0;
                    case 5: // songAnnouncement
                        myConGuild.songAnnouncement = data[1];
                        stage = 0;
                }
                if (stage === 0) {
                    settingsPromptMessage.delete();
                    settingsPromptMessage = embed(Discord,client, myEmbed => {
                        myEmbed.setAuthor("Settings",client.user.avatarURL({size: 256}));
                        const set = `prefix [${myConGuild.prefix}]\n:crown: adminrole [${myConGuild.adminRole}]\n:speech_balloon: logcommands [${myConGuild.commandsLog}]\n:hash: logchannel [${myConGuild.commandLogChannel}]\n:speech_balloon: songannouncement [${myConGuild.songAnnouncement}]`
                        myEmbed.addField("ALL SETTINGS",set,false);
                        myEmbed.addField("\u2800", "All settings take affect once this prompt terminates.", false);
                        myEmbed.setFooter("Limit of [1] settings prompt per server.");
                
                        return message.channel.send(myEmbed).then(msg => {
                            return msg;
                        });
                    });
                }


*/
