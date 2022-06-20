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

function ChangeSettings(message, msg, stage) {
    const guild = message.guild;

    const content = msg.content.toLowerCase();
    const first = content.split(" ")[0];
    if (!first in editSettings) { // may need to be adjusted for correct syntax
        message.channel.send("Invalid response.");
        return [false, null];
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
            return [stage != 0, stage];
         case 1:
            if (content.length <= 2) {
                return [true, msg.content];
            } else {
                return [false, null];
            }
    }
}

module.exports = (Discord, client, connectedGuilds, message, isAdmin, callback) => {
    if (isAdmin === false) return;
    const guild = message.guild;
    const author = message.author;
    var myConGuild = connectedGuilds[guild.id];

    var settingsPromptMessage = embed(Discord,client, myEmbed => {
        myEmbed.setAuthor("Settings :wrench:",client.user.avatarURL({size: 256}));
        const set = `prefix [${myConGuild.prefix}]\n:crown: adminrole [${myConGuild.adminRole}]\n:speech_balloon: logcommands [${myConGuild.commandsLog}]\n:hash: logchannel [${myConGuild.commandLogChannel}]\n:speech_balloon: songannouncement [${myConGuild.songAnnouncement}]`
        myEmbed.addField("ALL SETTINGS",set,false);
        myEmbed.setFooter("Limit of [1] settings prompt per server.");

        return message.channel.send(myEmbed).then(msg => {
            return msg;
        });
    });

    var stage = 0;

   

    var running = true;
    while (running) {
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        })
        .then(msg => {
            data = ChangeSettings(message,msg,stage);
        })
        .catch(err => {
            message.channel.send('Timeout.');
        })
        running = data[0];
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
                        connectedGuilds[guild.id].adminRole = newAdmin.toString();
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
                        connectedGuilds[guild.id].adminRole = newAdmin.toString();
                        message.channel.send(`New admin role set: ${newAdmin}`);
                    } catch (err) {
                        try {
                            let role = message.guild.roles.cache.find(r => r.id === toString(newAdmin));
                            if (role == null || role == undefined) {
                                console.error(`Unable to set admin role for "${guild.name}" (${guild.id}): Role "${message.content}" can't be found.`)
                            } else {
                                connectedGuilds[guild.id].adminRole = role.id;
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
                stage = 0;



            case 3: // logCommands : boolean
                //
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
                //
                stage = 0;
        }
        if (stage === 0) {
            settingsPromptMessage.delete();
            settingsPromptMessage = embed(Discord,client, myEmbed => {
                myEmbed.setAuthor("Settings :wrench:",client.user.avatarURL({size: 256}));
                const set = `prefix [${myConGuild.prefix}]\n:crown: adminrole [${myConGuild.adminRole}]\n:speech_balloon: logcommands [${myConGuild.commandsLog}]\n:hash: logchannel [${myConGuild.commandLogChannel}]\n:speech_balloon: songannouncement [${myConGuild.songAnnouncement}]`
                myEmbed.addField("ALL SETTINGS",set,false);
                myEmbed.setFooter("Limit of [1] settings prompt per server.");
        
                return message.channel.send(myEmbed).then(msg => {
                    return msg;
                });
            });
        }
    }
    if (settingsPromptMessage != null) settingsPromptMessage.delete();
    callback(myConGuild);
}
console.log("settings.js loaded... Success!");
