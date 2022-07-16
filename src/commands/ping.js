const { resolve } = require("dns");

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "ping";
        this.description = "Displays the latency the bot is experiencing.";
        this.options = [];
        // this.options = [
        //     {
        //         name: "url",
        //         description: "A link to a public or unlisted YouTube video",
        //         required: false,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        //     }
        // ];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    exe(message, client, args) {
        const channel = message.channel;
        let timeSinceEpoch = Math.round(Date.now());
        let difference = Math.round(message.createdTimestamp - timeSinceEpoch);
        message.reply(`Pong: ${Math.abs(difference)}ms`)
            .catch(console.error);
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(interaction, client) {
        return new Promise((resolve, reject) => {
            let timeSinceEpoch = Math.round(Date.now());
            let difference = Math.round(message.createdTimestamp - timeSinceEpoch);
            resolve(`Pong: ${Math.abs(difference)}ms`);
        })
    }
}



module.exports = { command }
