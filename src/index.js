require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client();
var connectedGuilds = {};

const {a} = require('./util/info/a');
const cmdAliases = a;

const {c} = require('./util/info/c')
const cmdCommands = c;

const error = require('./util/error');
const embed = require('./util/homiesEmbed');
const changeSettings = require('./settings');

// Dependencies
const request = require('request');
const fs = require('fs'); // file read and write

/*
fs.writeFile("PATH",content, err => {

});

fs.readFile("PATH",'utf8', (err,data) => {

});

*/

// Import command modules
const commands = require('./commands');
const { connect } = require('http2');
const settings = require('./settings');

// Functions

function readData(guild){
    const PATH = "data_" + toString(guild.id) + ".txt";
    fs.readFile(PATH,'utf8', (err,data) => {
        if (!err) {
            if (connectedGuilds[guild.id] == null) {
                addGuild(guild);
            }
            const info = data.toLowerCase().split("\n");
            for (x = 0; x < info.length; x++) {
                const splitString = info[x].split(":");
                switch(splitString[0]) {
                    case "prefix":
                        connectedGuilds[guild.id].prefix = splitString[1];
                    case "adminRole":
                        let role = message.guild.roles.cache.find(r => r.id === splitString[1]);
                        if (role != null) {
                            connectedGuilds[guild.id].adminRole = role;
                        } else {
                            console.error(`Unable to load adminRole for "${guild.name}" (${guild.id})`);
                        }
                    case "songAnnouncement":
                        if (splitString[1] == "true") {
                            connectedGuilds[guild.id].songAnnouncement = true;
                        } else if (splitString[1] == "false") {
                            connectedGuilds[guild.id].songAnnouncement = false;
                        } else {
                            console.error(`Unable to load songAnnouncement for "${guild.name}" (${guild.id})`);
                        }
                    case "commandLogChannel":
                        connectedGuilds[guild.id].commandLogChannel = splitString[1];
                    case "commandsLog":
                        if (splitString[1] == "true") {
                            connectedGuilds[guild.id].commandsLog = true;
                        } else if (splitString[1] == "false") {
                            connectedGuilds[guild.id].commandsLog = false;
                        } else {
                            console.error(`Unable to load commandsLog for "${guild.name}" (${guild.id})`);
                        }
                }
            }
        }
    });
    return null;
}

function saveData(guild){
    const PATH = "data_" + toString(guild.id) + ".txt";

    const guildData = connectedGuilds[guild.id];
    if (guildData == null) {
        fs.unlink(PATH, err => {
            if (err) {
                console.error(err);
            }
        });
    }

    var data = "";

    data = data + `prefix:${guildData.prefix}\n`;
    if (guildData.adminRole != null) {
        data = data + `adminRole:${guildData.adminRole.id}\n`;
    }
    data = data + `songAnnouncement:${guildData.songAnnouncement}\n`;
    if (guildData.commandLogChannel != null) {
        data = data + `commandLogChannel:${guildData.commandLogChannel}\n`;
    }
    data = data + `commandsLog:${guildData.commandsLog}`; // if something else needs to be saved add new line here 

    fs.writeFile(PATH,data,'utf8', err => {
        console.error(`Error saving data for "${guild.name}" (${guild.id}): ${err}`);
    });
}

function addGuild(guild){
    var set = new Object();
    // set.applications = false;
    // set.selApplications = false;
    // set.selApplicationLink = "Error code 2 : 'Selected' Application link not set.";
    // set.selRole = null;
    // set.applicationLink = "Error code 2: Application link not set.";  
    set.prefix = "//";   
    set.queue = []; // music queue
    set.displayQueue = []; // music queue
    set.songData = []; // data for songs in queue
    set.currentSong = null; // first music queue element (displayQueue)
    set.isPlaying = false;
    set.adminRole = null;
    set.connection = null;
    set.songAnnouncement = true;
    set.dispatcher = null;
    set.cah = null;
    set.commandLogChannel = 'default'; // First text channel found in the server
    set.commandsLog = true; // default
    connectedGuilds[guild.id] = set;
    console.log(`[Guild "${guild.name}" (${guild.id})]: Added to connections.`);
}

function isAdmin(id, message){
    try{
        const guild = message.guild;
        if (id == message.guild.owner.id || toString(id) == "177486429780312064") return true; // The owner is permanent admin for their server.
        const admin = connectedGuilds[guild.id].adminRole;
        var adminRole = null;
        if (typeof(admin) === 'string'){
            adminRole = message.guild.roles.cache.find(role => role.id == admin);
        } else {
            adminRole = admin;
        }
        if(adminRole == null) { // Will return false if the role has not been set.
            return false;
        }
        if (message.member.roles.highest.position >= adminRole.position){
            return true;
        }
        return false;
    } catch (err) {
        console.log(`Error getting admin role: ${err}`);
        return id == message.guild.owner.id || toString(id) == "177486429780312064";
    };
}

function isURL(str) {
    try{
        var value = str.search("https://www.youtube.com/");
        if (value == -1) value = str.search("http://youtu.be");
        if (value == -1) value = str.search("https://youtu.be");
        if (value == -1) value = str.search("http://www.youtube.com/");
        if (value == -1){
            return false;
        }
        return true;
    } catch (err) {
        console.log(`Error processing isURL(${URL}) : ${err}`);
        error(Discord,client,message,errEmbed => {
            errEmbed.setFooter("Error code 500");
            errEmbed.addField("\u2800","Unable to verify URL.",false);
            message.channel.send(errEmbed);
        });
        return false;
    }
}

function playMusic(message, displayIndex){
    const vc = message.member.voice.channel || null;
    if(vc == null) return;
    if(connectedGuilds[message.guild.id].isPlaying) return;
    if(connectedGuilds[message.guild.id].queue.length == 0){
        client.guilds.fetch(message.guild.id).then(async guild => {
            await guild.members.fetch(client.user.id).then(async self => {
                message.channel.send(`The queue is empty. Leaving the voice channel.\nUse \`${connectedGuilds[message.guild.id].prefix}join\` or \`${connectedGuilds[message.guild.id].prefix}play\` and I will join back.`);
                self.voice.kick();
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    }
    try {
        const showJoinMessage = (connectedGuilds[message.guild.id].dispatcher == null) ? true : false;
        connectedGuilds[message.guild.id].connection = vc.join().then(async connection =>{
            const stream = ytdl(connectedGuilds[message.guild.id].queue[0], { filter: 'audioonly' });
            connectedGuilds[message.guild.id].isPlaying = true;
            if (connectedGuilds[message.guild.id].songAnnouncement && connectedGuilds[message.guild.id].songData.length > 0){
                self = client.user;

                const songTitle = connectedGuilds[message.guild.id].songData[0].songTitle;/*await ytdl.getInfo(connectedGuilds[message.guild.id].queue[0]).then(info => {
                    return info.videoDetails.title;
                })
                .catch(() => console.error("Soon to be gone error at line 145\n"));*/
    
                const d = new Date();
                const embed = new Discord.MessageEmbed()
                .setTitle(`Now playing`)
                .setColor(0x3286a6)
                .setTimestamp(d.toISOString())
                .setAuthor(`${self.username}#${self.discriminator}`, self.avatarURL({size : 256}))
                .setFooter(`Say ${connectedGuilds[message.guild.id].prefix}queue [page number] to view the song queue`)
                .addField("\u2800", `Now playing: [${songTitle}](${connectedGuilds[message.guild.id].queue[0]})`, false);

                message.channel.send(embed);
            }
            try{
                if (showJoinMessage) {
                    embed(Discord, client, embed => {
                        embed.addField("\u2800", `Joined and bound bot to ${message.member.voice.channel}`, false);
                        message.channel.send(embed);
                    });
                }
                connectedGuilds[message.guild.id].dispatcher = connection.play(stream);
                
                var displayQueue = connectedGuilds[message.guild.id].displayQueue;

                console.error("Setting current song display...");
                connectedGuilds[message.guild.id].currentSong = displayQueue[0];
                console.log(`Current song set: ${displayQueue[0]}`)
                connectedGuilds[message.guild.id].displayQueue.splice(0,1);


            } catch (err) {
                error(Discord,client,message, embed => {
                    embed.addField("\u2800", `An error occured trying to play ${connectedGuilds[message.guild.id].queue[0]}`);
                    embed.setFooter("Error")
                    message.channel.send(embed);
                    console.log("Error Code 14 called, URL required for playing music.")
                });
                connectedGuilds[message.guild.id].queue.splice(0,1);
                playMusic(message, connectedGuilds[message.guild.id].queue.length);
                return;
            }
            
            if (connectedGuilds[message.guild.id].dispatcher == null){
                return;
            }
    
            connectedGuilds[message.guild.id].dispatcher.on('finish', () => {
                connectedGuilds[message.guild.id].queue.splice(0,1);
                connectedGuilds[message.guild.id].dispatcher.destroy();
                connectedGuilds[message.guild.id].dispatcher = null;
                connectedGuilds[message.guild.id].isPlaying = false;
                playMusic(message, connectedGuilds[message.guild.id].queue.length);
            });
        })
        .catch(err => console.log(err));
    } catch (err){
        console.log(err);
    }
}

function displayQueue(message, p){
    var d = new Date();

    let page;
    let embed;
    try{
        page = parseInt(p) || 1;
            
        var tQueue = "";
        const currentSong = connectedGuilds[message.guild.id].currentSong;
        const tdisplayQueue = connectedGuilds[message.guild.id].displayQueue;
        console.log(`Display queue: ${tdisplayQueue}`);
        console.log(`Current song: ${currentSong}`);

        for (i = (page-1)*10; i < tdisplayQueue.length; i++){
            if(i === page * 10) break;
            tQueue = tQueue + `${i+1}: ${tdisplayQueue[i]}`;
        }

        if(tQueue.length <= 1){
            tQueue = "[empty]";
        }

        // Show gathered queue
       
        self = client.user;
        
        embed = new Discord.MessageEmbed()
        .setTitle(`Queue for ${message.guild.name}`)
        .setColor(0x3286a6)
        .setTimestamp(d.toISOString())
        .setFooter(`Page #${page}`)
        .addField("__Now Playing:__", currentSong || "[empty]", false)
        .addField("__Queue:__",tQueue || "[empty]",false);
    
        message.channel.send(embed);
    } catch (err){
        console.log(err);
        return;
    }

    // message.channel.send("Fetching queue...").then(async msg  => {
        
    // });
}

function displayAlliases(message, page){
    if (page <= 0) return;
    var count = 0;
    var alliases = "";
    for (const [command, allias] of Object.entries(cmdAliases)){

        // Choice 1
        if (allias == null || allias.length == 0) continue;
        // Choice 2 is to put [empty] in place of the allias(es)
        count++;
        if (count > (page-1)*10 && count < page * 10){
            var newallias = `${connectedGuilds[message.guild.id].prefix}${command} : ${connectedGuilds[message.guild.id].prefix}${allias.join(", " + connectedGuilds[message.guild.id].prefix)}`;
            alliases = alliases + newallias + "\n";
        } else if (count > page * 10){
            break;
        }
    }

    if (alliases == ""){
        alliases = "[empty]";
    }

    // Used for music commands
    self = client.user;
    d = new Date();

    const embed = new Discord.MessageEmbed()
    .setTitle(`Command Alliases | Page ${page}`)
    .setColor(0x3286a6)
    .setTimestamp(d.toISOString())
    .setAuthor(`${self.username}#${self.discriminator}`, self.avatarURL({size : 256}))
    .setFooter(`Say ${connectedGuilds[message.guild.id].prefix}als [page number]`)
    .addField("\u2800", alliases, false);

    message.channel.send(embed);
}

/* EVENT HOOKS */

client.on('ready', () => {
    client.user.setPresence({ activity: { name: `Prefix ${"//"}`, type: "STREAMING", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO"}, status: 'dnd' })
    .catch(console.error);
    console.log("--------------\n\nBot loaded........online");
});

client.on('message', message => {
    if (connectedGuilds[message.guild.id] == null){
        addGuild(message.guild);
    }
});

client.on("guildCreate", guild => {
    addGuild(guild);
});

client.on("guildDelete", guild => {
    connectedGuilds[message.guild.id] = null;

});

// Commands have been redacted to prevent theft.

client.login(process.env.DISCORD_BOT_TOKEN);
