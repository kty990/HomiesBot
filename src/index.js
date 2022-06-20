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

try {
    commands(Discord, client, connectedGuilds, (message, command) => {
        client.guilds.fetch(message.guild.id).then(async guild => {
            await guild.members.fetch(client.user.id).then(async self => {
                // Used for embeds, timestamp
                var d = new Date();
    
                // Whether a command was found or not
                var logCommand = false;
    
                // Play command
                if (command == "play"){
                    logCommand = true;
                    if (message.member.voice.channel){
                        if(self != null){
                            if(self.voice.channel != message.member.voice.channel){                                                                                    // New command
                                if (self.voice.channel != null) {
                                    error(Discord,client,message, embed => {
                                        embed.addField("\u2800","Attempted to play audio while not in voice channel with bot.",false);
                                        embed.setFooter("Error Code: 11");
                                        message.channel.send(embed);
                                        console.log("Error Code 11 called, trying to play audio while not in channel with bot.")
                                    });
                                    return;
                                }
                            }
                        } else {
                            error(Discord,client,message, embed => {
                                embed.addField("\u2800","Unable to establish 'self' : bot member instance.",false);
                                embed.setFooter("Error Code: 12");
                                message.channel.send(embed);
                                console.log("Error Code 12 called, unable to establish 'self' : bot member instance.");
                            });
                            return;
                        }
                    } else {
                        error(Discord,client,message, embed => {
                            embed.addField("\u2800","Attempted to play audio while not in voice channel with bot.",false);
                            embed.setFooter("Error Code: 11");
                            message.channel.send(embed);
                            console.log("Error Code 11 called, trying to play audio while not in channel with bot.")
                        });
                        return;
                    }
                    var URL = message.content.split(" ")[1] || "&*-_empty(1@3"; // If empty, the playMusic function should skip over it.
    
                    if (URL == "&*-_empty(1@3") {
                        error(Discord,client,message, embed => {
                            embed.addField("\u2800", "Error Code: 14");
                            embed.setFooter("Error: YouTube URL required")
                            message.channel.send(embed);
                            console.log("Error Code 14 called, YouTube URL required for playing music.")
                        });
                        return;
                    }
                    if (!isURL(URL)){
                        
                        var query = message.content.split(" ");
                        query.splice(0,1);
                        query = query.join("+")
                        const queryURL = `https://www.youtube.com/results?search_query=${query}`;
                        console.log(queryURL);
                        request(queryURL, async (error, response, body) => {
                            if (error != null && error != false) {
                                console.error(error);
                                return;
                            }
                            var firstVideoIndex = body.toLowerCase().indexOf('watch?v=');
                            const videoId = body.substr(firstVideoIndex, firstVideoIndex+19);
                            const link = `https://www.youtube.com/${videoId.split('"')[0].split("\\u0026")[0]}`;
                            console.log(`Link: ${link}`);
                            connectedGuilds[message.guild.id].queue.push(link);
    
                            console.log("Starting display log...")
                            await ytdl.getInfo(link).then(info => {
                                connectedGuilds[message.guild.id].displayQueue.push(`[${info.videoDetails.title}](${link})\n`);
                                console.log(`Adding song to display queue: ${link}`);

                                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



                                var details = new Object();
                                details.duration = info.videoDetails.lengthSeconds;
                                details.thumbnail_url = info.thumbnail_url;
                                details.songTitle = info.videoDetails.title;

                                connectedGuilds[message.guild.id].songData.push(details);


                                console.log(`Duration: ${info.videoDetails.lengthSeconds}`);
                                for (var [key, value] in Object.entries(info.videoDetails.thumbnails)) {
                                    
                                    console.log(typeof(key),typeof(value));
                                }
                                















                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                // Display now playing
                                var displayIndex = connectedGuilds[message.guild.id].displayQueue.length;

                                if (connectedGuilds[message.guild.id].songAnnouncement && (displayIndex > 1 || (displayIndex >= 1 && connectedGuilds[message.guild.id].currentSong != null))) {
                                    embed(Discord,client,embed => {
                                        embed.setTitle("Song added to queue");
                                        embed.setFooter(`Say ${connectedGuilds[message.guild.id].prefix}queue [page number] to view the song queue`);
                                        embed.addField("\u2800",`${displayIndex}. [${info.videoDetails.title}](${link})`,false);
                                        message.channel.send(embed);
                                    });
                                }
                            })
                            .catch(err => console.error(err));
                            console.log("Ending display log...")
    
                            playMusic(message, null); // don't display now playing through this
                        });
                    } else {
                        connectedGuilds[message.guild.id].queue.push(URL);
                        console.log("Starting display log...")
                            await ytdl.getInfo(URL).then(info => {
                                connectedGuilds[message.guild.id].displayQueue.push(`[${info.videoDetails.title}](${URL})\n`);

                                var displayIndex = connectedGuilds[message.guild.id].displayQueue.length;
                                if (connectedGuilds[message.guild.id].currentSong != null) displayIndex--;

                                if (connectedGuilds[message.guild.id].songAnnouncement && displayIndex >= 1) {
                                    embed(Discord,client,embed => {
                                        embed.setTitle("Song added to queue");
                                        embed.setFooter(`Say ${connectedGuilds[message.guild.id].prefix}queue [page number] to view the song queue`);
                                        embed.addField("\u2800",`${displayIndex}. [${info.videoDetails.title}](${link})`,false);
                                        message.channel.send(embed);
                                    });
                                }

                                console.log(`Adding song to display queue: ${URL}`);
                            })
                            .catch(err => console.log(err));
                            console.log("Ending display log...")
                            playMusic(message, connectedGuilds[message.guild.id].queue.length);
                    }
                }
    
                // Queue command
                if (command == "queue"){
                    logCommand = true;
                    const page = message.content.split(" ")[1] || '1';
                    displayQueue(message, page);
                }
    
                // Skip song command
                if (command == "skip") {
                    logCommand = true;
                    if (self == null) return;
                    if (message.member.voice.channel){
                        if(self.voice.channel == message.member.voice.channel){
                            connectedGuilds[message.guild.id].isPlaying = false;
                            connectedGuilds[message.guild.id].queue.splice(0,1);
                            // connectedGuilds[message.guild.id].displayQueue.splice(0,1);
                            console.log(`Song skipped: New queue: ${connectedGuilds[message.guild.id].displayQueue}`);
                            try {
                                playMusic(message, connectedGuilds[message.guild.id].queue.length);
                            } catch (err) {
                                console.error(err);
                            }
                            message.channel.send("Skipped!")
                        }
                    }
                }

                // Now playing command
                if (command == "nowplaying") {
                    logCommand = true;
                    embed(Discord,client,embed => {
                        embed.setAuthor('Now Playing ♪',client.user.avatarURL({size : 256}))
                        embed.addField('\u2800',`${connectedGuilds[message.guild.id].currentSong}`,false);
                        var progressBar = "";
                        //To complete this, re-do the song gathering method using ytdl-core: Store song data in separate array in connectedGuilds in the same way queue and displayQueue are formatted.
                        //This should include [name, URL, duration, thumbnail, requested by]
                    });
                }
    
                // Pause command
                if (command == "pause") {
                    error(Discord,client,null, embed => {
                        embed.addField("\u2800", "Pause command not added.", false);
                        embed.setFooter("Resuming paused song faulty");
                        message.channel.send(embed);
                    });
                    // Won't log, return not required.
                }
    
                // Join voice channel command
                if (command == "join"){
                    logCommand = true;
                    try{
                        message.member.voice.channel.join().then( () => {
                            embed(Discord, client, embed => {
                                embed.addField("\u2800", `Joined and bound bot to ${message.member.voice.channel}`, false);
                                message.channel.send(embed);
                            });
                        }).catch(function(){
                            error(Discord,client,message, embed => {
                                embed.addField("\u2800", "Error Code: 11");
                                message.channel.send(embed);
                                console.log("Error Code 11 called, attempting to make bot join channel : not in voice channel.");
                            });
                            return;
                        });
                    } catch (err) {
                        error(Discord,client,message, embed => {
                            embed.addField("\u2800", "Error Code: 11");
                            message.channel.send(embed);
                            console.log("Error Code 11 called, attempting to make bot join channel : not in voice channel.");
                        });
                        return;
                    }
                }
    
                // Leave voice channel command
                if (command == "leave"){
                    logCommand = true;
                    if (self == null) return;
                    if (message.member.voice.channel){
                        if(self.voice.channel != message.member.voice.channel || self.voice.channel == null){ 
                            error(Discord,client,message, embed => {
                                embed.addField("\u2800", "Error Code: 11");
                                message.channel.send(embed);
                                console.log("Error Code 11 called, attempting to make bot leave channel : not in voice channel with bot.");
                            });
                            return;
                        }
                    } else {
                        error(Discord,client,message, embed => {
                            embed.addField("\u2800", "Error Code: 11");
                            message.channel.send(embed);
                            console.log("Error Code 11 called, attempting to make bot leave channel : not in voice channel.");
                        });
                        return;
                    }
                    self.voice.kick();
                    connectedGuilds[message.guild.id].dispatcher = null;
                    connectedGuilds[message.guild.id].queue = [];      
                    connectedGuilds[message.guild.id].displayQueue = [];
                }
    
                // Alias command
                if (command == "aliases") {
                    logCommand = true;
                    const page = message.content.split(" ")[1] || '1';
                    displayAlliases(message,page);
                }
    
                // Show commands command
                if (command == "cmds"){
                    logCommand = true;
                    var sCommands = "";
                    var page = message.content.split(" ")[1] || '1';
                    try{
                        page = parseInt(page);
                        for(i = (page-1) * 10; i < Math.min(cmdCommands.length,page*10); i++){
                            sCommands = sCommands + `${i+1}. ${connectedGuilds[message.guild.id].prefix}${cmdCommands[i]}\n`;
                        }
    
                        if (sCommands == ""){
                            sCommands = "[empty]";
                        }
            
                        embed(Discord,client, embed => {
                            embed.setTitle(`Commands | Page ${page}`);
                            embed.setFooter(`Say ${connectedGuilds[message.guild.id].prefix}cmds [page number]`);
                            embed.addField("\u2800", sCommands, false);
                            message.channel.send(embed);
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
    
                //Change command ** CHANGE THIS COMMAND TO USE AN INTERACTION MENU DONE USING A SEPARATE MODULE **
                if (command == "change" || command == "settings") {
                    logCommand = true;
                    // Check if an instance of this already exists for this guild, if so don't create another one.
                    changeSettings(Discord,client,connectedGuilds,message,isAdmin(message.author.id,message), newConGuild => {

                    });
                }

                if (command == "change" && isAdmin(message.author.id, message)){
                    logCommand = true;
                    var changeType = message.content.split(" ")[1] || null;
                    if (changeType != null){
                        const guild = message.guild;
                        changeType = changeType.toLowerCase();
                        // Prefix
                        if(changeType == 'prefix'){
                            const newPrefix = message.content.split(" ")[2] || null;
                            if (newPrefix == null) {
                                error(Discord,client,_,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                            if(newPrefix.length == 1) {
                                connectedGuilds[guild.id].prefix = newPrefix;
                                embed(Discord,client,embed => {
                                    embed.setDescription(`New prefix set: ${newPrefix}`);
                                    message.channel.send(embed);
                                });
                            } else {
                                error(Discord,client,_,embed => {
                                    embed.addField("\u2800","Prefix must be 1 character in length", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                        }
    
                        // Commands log to a channel (true / false)
                        if(changeType == 'logcommands'){
                            const newValue = message.content.split(" ")[2] || null;
                            if (newValue == null) {
                                error(Discord,client,_,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                            if(newValue.toLowerCase() == 'true') {
                                connectedGuilds[guild.id].commandsLog = true;
                                embed(Discord,client,embed => {
                                    var channel = message.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0) || null;
                                    const newChannel = (connectedGuilds[guild.id].commandLogChannel == 'default') ? (channel.id || "Err: no channel found") : connectedGuilds[guild.id].commandLogChannel;
                                    embed.setDescription(`Commands now log to ${newChannel}`);
                                    embed.setFooter('Command logging : true');
                                    message.channel.send(embed);
                                });
                            } else if (newValue.toLowerCase() == 'false') {
                                connectedGuilds[guild.id].commandsLog = false;
                                embed(Discord,client,embed => {
                                    embed.setDescription(`Commands will not be logged`);
                                    embed.setFooter('Command logging : false');
                                    message.channel.send(embed);
                                });
                            } else {
                                error(Discord,client,null,embed => {
                                    embed.addField("\u2800","logcommands value must either be 'true' or 'false'", false);
                                    embed.addField("\u2800", "Case does not matter", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                        }
                        
                        // Log Channel
                        if(changeType == 'log') {
                            var newChannel = message.content.split(" ")[2] || null;
                            if (newChannel == null) {
                                error(Discord,client,_,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                            if(newChannel.search("#") == -1) { // id
                                connectedGuilds[guild.id].commandLogChannel = newChannel;
                                embed(Discord,client,embed => {
                                    embed.setDescription(`New log channel set: ${newChannel}`);
                                    message.channel.send(embed);
                                });
                            } else {
                                newChannel = newChannel.replace("<#","");
                                newChannel = newChannel.replace(">","");
                                newChannel = newChannel.replace("#","");
                                try {
                                    connectedGuilds[guild.id].commandLogChannel = newChannel;
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
                            }
                        }
    
                        // Admin Role
                        if(changeType == 'admin') {
                            var newAdmin = message.content.split(" ")[2] || null;
                            if (newAdmin == null) {
                                error(Discord,client,null,embed => {
                                    embed.addField("\u2800","Error Code: 404", false);
                                    message.channel.send(embed);
                                });
                                return;
                            }
                            if(newAdmin.search("@") == -1) { // id
                                connectedGuilds[guild.id].adminRole = newAdmin;
                                embed(Discord,client,embed => {
                                    embed.setDescription(`New admin role set: ${newAdmin}`);
                                    message.channel.send(embed);
                                });
                            } else {
                                newAdmin = newAdmin.replace("<@&","");
                                newAdmin = newAdmin.replace(">","");
                                newAdmin = newAdmin.replace("@","");
                                try {
                                    newAdmin = parseInt(newAdmin);
                                    connectedGuilds[guild.id].adminRole = newAdmin.toString();
                                    embed(Discord,client,embed => {
                                        embed.setDescription(`New admin role set: ${newAdmin}`);
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
                            }
                        }
    
                        if (changeType != 'admin' && changeType != "log" && changeType != "logcommands" && changeType != "prefix"){
                            error(Discord,client,null,embed => {
                                embed.addField("\u2800","Invalid change type", false);
                                embed.addField("\u2800",`Use ${connectedGuilds[guild.id].prefix}change without parameters to get a list of all valid change types.\nie. '${connectedGuilds[guild.id].prefix}change'`, false);
                                message.channel.send(embed);
                            });
                            return;
                        }
                    } else {
                        embed(Discord,client,embed => {
                            embed.setTitle("Settings to change");
                            const settings = "1. prefix (server prefix)\n2. log (logging channel)\n3. admin (bot admin role)\n4. logcommands (true/false)";
                            embed.addField("\u2800", settings, false);
                            message.channel.send(embed);
                            return;
                        });
                    }
                }
    
                // Help command
                if (command == "help"){
                    logCommand = true;
                    const guild = message.guild;
                    embed(Discord, client, embed => {
                        embed.setDescription(`Use ${connectedGuilds[guild.id].prefix}cmds to view a list of commands with their corresponding syntax.\nUse ${connectedGuilds[guild.id].prefix}als to view a list of command aliases.`);
                        embed.addField("\u2800","Join [The Task Force](https://discord.gg/FkMFn9DZuv) to get futher help or to report a bug in the bot.",false);
                        message.channel.send(embed);
                    });
                }
    
                // Say command
                if (command == "say" && isAdmin(message.author.id, message)){
                    logCommand = true;
                    var msg = message.content.split(" ");
                    msg.splice(0,1);
                    msg = msg.join(" ");
                    message.channel.send(msg);
                    message.delete();
                }
    
    
                // Cards against humanity game command
                if (command == "cah" && connectedGuilds[message.guild.id].cah == null) {
                    
                }
    
                // Save command : Dev only
                if (command == "save" && message.author.id == "177486429780312064") { 
                    console.log("Save initiated by 177486429780312064");
                    for (const [key, value] in Object.entries(connectedGuilds[message.guild.id])) {
                        console.log(key, value); // for testing purposes, will change later
                    }
                    console.log("Save completed.");
                } else if (command == "save") {
                    console.error(`Unable to save...\nLog: ID Comparison:\tUser: ${message.author.id}\tDefault: 177486429780312064`);
                }
    
    
    
                /* IF A COMMAND WAS USED, LOG IT TO THE SERVER'S LOGGING CHANNEL */
                if(logCommand && connectedGuilds[message.guild.id].commandsLog) {
                    message.delete();
                    if(connectedGuilds[message.guild.id].commandLogChannel == 'default'){
                        var channel = message.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0) || null;
                        if (channel == null) { // no text channels found
                            return;
                        }
                        embed(Discord,client,embed => {
                            embed.setAuthor(message.author.tag, message.author.avatarURL({size : 256}));
                            embed.setDescription(`Command used in ${message.channel}`);
                            embed.addField("\u2800", message.content, false);
                            channel.send(embed);
                        });
                    } else {
                        const channel = message.guild.channels.cache.get(connectedGuilds[message.guild.id].commandLogChannel);
                        if (channel == null) { // no text channels found
                            return;
                        }
                        embed(Discord,client,embed => {
                            embed.setAuthor(message.author.tag, message.author.avatarURL({size : 256}));
                            embed.setDescription(`Command used in ${message.channel}`);
                            embed.addField("\u2800", message.content, false);
                            channel.send(embed);
                        });
                    }
                }
    
    
    
                if(command == "verify"){
                    error(Discord,client,message, embed => {
                        embed.setTitle("Command not available");
                        embed.setFooter("Command being developed");
                        message.channel.send(embed);
                    });
                    return;
                }
    
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
} catch (err){
    console.log(err);
}


client.login(process.env.DISCORD_BOT_TOKEN);
