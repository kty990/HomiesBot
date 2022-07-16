const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "shuffle";
        this.description = "In development";
        this.options = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    exe(musicData, message, client, args) {
        let voice = musicData['voice'];
        let subscription = musicData['subscription'];

        const guild = message.guild;
        const channel = message.channel;

        subscription.shuffle();

        channel.send({
            content: `**Shuffled** 🔀`,
        })
            .catch(console.error);

        return {
            "subscription": subscription,
            "voice": voice,
        }
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