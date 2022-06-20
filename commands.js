console.log("Loading... commands.js");

const { TextChannel } = require('discord.js');
// Aliases
const aliases = require('./util/aliases')

module.exports = (Discord, client, connectedGuilds, callback) => {
    client.on('message', message => {
        const prefix = connectedGuilds[message.guild.id].prefix;
        const command = message.content.split(" ")[0].toLowerCase();

        // Play music
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "play", result => {
            if(result){
                callback(message, 'play');
            }
        });

        // Display queue
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "queue", result => {
            if(result){
                callback(message, 'queue');
            }
        });

        // Skip song
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "skip", result => {
            if(result){
                callback(message, 'skip');
            }
        });

        // Now playing
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "nowplaying", result => {
            if(result) {
                callback(message,'nowplaying');
            }
        });

        // Join voice channel
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "join", result => {
            if(result){
                callback(message, 'join');
            }
        });

        // Leave voice channel
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "leave", result => {
            if(result){
                callback(message, 'leave');
            }
        });

        // Say message
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "say", result => {
            if(result){
                callback(message, 'say');
            }
        });

        // Announcement
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "announcement", result => {
            if(result){
                callback(message, 'announcement');
            }
        });

        // Program update (announcement)
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "progupdate", result => {
            if(result){
                callback(message, 'progupdate');
            }
        });

        // Verify
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "verify", result => {
            if(result){
                callback(message, 'verify');
            }
        });

        // Commands
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "cmds", result => {
            if(result){
                callback(message, 'cmds');
            }
        });

        // Aliases
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "aliases", result => {
            if(result){
                callback(message, 'aliases');
            }
        });

        // Open apps
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "openapps", result => {
            if(result){
                callback(message, 'openapps');
            }
        });

        // Close apps
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "closeapps", result => {
            if(result){
                callback(message, 'closeapps');
            }
        });

        // Apply
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "apply", result => {
            if(result){
                callback(message, 'apply');
            }
        });

        // Help
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "help", result => {
            if(result){
                callback(message, 'help');
            }
        });

        // Change
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "change", result => {
            if(result){
                callback(message, 'change');
            }
        });

        // Cards against humanity
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "cah", result => {
            if (result) {
                callback(message,'cah');
            }
        })

        // Save : dev only
        aliases(prefix, message.content.split(" ")[0].toLowerCase(), "save", result => {
            if (result) {
                callback(message,'save');
            }
        });

        callback(message, "null");
    });
}

console.log("commands.js loaded... Success!");
