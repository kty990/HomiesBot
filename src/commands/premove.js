const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "premove";
        this.description = "Sends the 'premove' screenshot";
        this.options = [];
        this.aliases = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client, ...args) {
        message.reply({
            files: [
                "./src/images/premove.png"
            ],
        })
            .catch(console.error);
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
